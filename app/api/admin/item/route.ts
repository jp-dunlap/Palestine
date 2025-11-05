import { NextRequest, NextResponse } from 'next/server'
import { ensureAuth } from '@/lib/api/auth'
import { requireCsrfToken } from '@/lib/api/csrf'
import { getCollection, getEntryPath } from '@/lib/collections'
import { readEntry } from '@/lib/content'
import {
  createPullRequest,
  deleteFile,
  ensureBranch,
  findPullRequestByBranch,
  getFile,
  getOctokitForRequest,
  resolveCommitAuthor,
  updatePullRequestBody,
} from '@/lib/github'
import { rateLimit } from '@/lib/rate-limit'

export const GET = async (req: NextRequest) => {
  const auth = ensureAuth(req)
  if (!auth.ok) {
    return auth.response
  }
  const url = new URL(req.url)
  const collectionId = url.searchParams.get('collection')
  const slug = url.searchParams.get('slug')
  const workflow = url.searchParams.get('workflow') ?? 'publish'
  if (!collectionId || !slug) {
    return NextResponse.json({ error: 'collection and slug are required' }, { status: 400 })
  }
  const collection = getCollection(collectionId)
  if (!collection) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
  }
  try {
    const branch = workflow === 'draft' ? `cms/${slug}` : undefined
    const client = getOctokitForRequest(req)
    const entry = await readEntry(client, collection, slug, branch)
    return NextResponse.json({
      frontmatter: entry.frontmatter,
      body: entry.body,
      data: entry.data,
      sha: entry.sha,
      path: entry.path,
      workflow,
    })
  } catch (error) {
    const message = (error as Error).message
    const status = message === 'Not Found' ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

const ipKey = (req: NextRequest) => {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]
  }
  return req.ip ?? 'unknown'
}

export const DELETE = async (req: NextRequest) => {
  const auth = ensureAuth(req)
  if (!auth.ok) {
    return auth.response
  }
  if (auth.mode === 'token') {
    const csrf = requireCsrfToken(req)
    if (csrf) {
      return csrf
    }
  }
  const limited = rateLimit(`delete:${ipKey(req)}`, 5, 60_000)
  if (!limited.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  let payload: any
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { collection: collectionId, slug, workflow, message } = payload ?? {}
  if (typeof collectionId !== 'string' || typeof slug !== 'string') {
    return NextResponse.json({ error: 'collection and slug are required' }, { status: 400 })
  }
  const collection = getCollection(collectionId)
  if (!collection) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
  }
  const branchWorkflow: 'draft' | 'publish' = workflow === 'draft' ? 'draft' : 'publish'
  const branchName = branchWorkflow === 'draft' ? `cms/${slug}` : undefined
  const client = getOctokitForRequest(req)
  const author = resolveCommitAuthor(auth.mode === 'oauth' ? auth.session : undefined)
  const path =
    (await collection.resolvePath?.(client, slug, { branch: branchName })) ??
    (collection.singleFile ?? getEntryPath(collection, slug))
  try {
    if (branchName) {
      await ensureBranch(client, branchName)
    }
    const existing = await getFile(client, path, branchName).catch(() => null)
    if (!existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }
    const commitMessage = typeof message === 'string' && message.trim().length > 0
      ? message
      : `[CMS] Delete ${collection.label}: ${slug}`
    const response = await deleteFile(client, path, commitMessage, branchName, existing.sha, author)
    if (branchWorkflow === 'draft' && branchName) {
      const existingPr = await findPullRequestByBranch(client, branchName)
      const prTitle = `[CMS] ${slug}`
      const prBody = `This PR removes ${slug} from ${collection.label}.`
      if (existingPr) {
        await updatePullRequestBody(client, existingPr.number, prBody)
        return NextResponse.json({ prUrl: existingPr.html_url, workflow: 'draft' })
      }
      const pr = await createPullRequest(client, branchName, prTitle, prBody)
      return NextResponse.json({ prUrl: pr.html_url, workflow: 'draft' })
    }
    const commitSha = (response as any)?.commit?.sha ?? null
    return NextResponse.json({ commitSha, workflow: 'publish' })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
