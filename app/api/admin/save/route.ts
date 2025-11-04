import { NextRequest, NextResponse } from 'next/server'
import { ensureAuth } from '@/lib/api/auth'
import { requireCsrfToken } from '@/lib/api/csrf'
import { getCollection, getEntryPath } from '@/lib/collections'
import { serializeEntry } from '@/lib/content'
import {
  createPullRequest,
  ensureBranch,
  findPullRequestByBranch,
  getFile,
  getOctokitForRequest,
  getRawFileUrl,
  putFile,
  resolveCommitAuthor,
  updatePullRequestBody,
} from '@/lib/github'
import { rateLimit } from '@/lib/rate-limit'
import { slugify } from '@/lib/slugs'

const parseBody = async (req: NextRequest) => {
  try {
    return await req.json()
  } catch {
    return null
  }
}

const toSlug = (value?: string | null) => {
  if (!value) return ''
  return slugify(value)
}

const rateLimitKey = (req: NextRequest) => {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]
  }
  return req.ip ?? 'unknown'
}

const buildPrBody = (collectionLabel: string, slug: string, summary: Record<string, unknown>) => {
  const lines = Object.entries(summary)
    .filter(([key]) => key !== 'body')
    .map(([key, value]) => `- **${key}**: ${Array.isArray(value) ? value.join(', ') : String(value ?? '')}`)
  return [`This PR was created from the Palestine CMS admin for ${collectionLabel}.`, '', `Slug: \`${slug}\``, '', ...lines].join('\n')
}

export const POST = async (req: NextRequest) => {
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
  const limited = rateLimit(`save:${rateLimitKey(req)}`, 10, 60_000)
  if (!limited.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  const body = await parseBody(req)
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { collection: collectionId, slug: inputSlug, frontmatter = {}, data, body: markdownBody, workflow, message } = body
  if (typeof collectionId !== 'string') {
    return NextResponse.json({ error: 'collection is required' }, { status: 400 })
  }
  const collection = getCollection(collectionId)
  if (!collection) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
  }
  const candidateData = collection.format === 'markdown' ? (frontmatter as Record<string, unknown>) : (data ?? frontmatter)
  if (!candidateData || typeof candidateData !== 'object') {
    return NextResponse.json({ error: 'frontmatter/data must be an object' }, { status: 400 })
  }
  const parsed = collection.schema.safeParse(candidateData)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 })
  }
  const validated = parsed.data as Record<string, unknown>
  let slug = typeof inputSlug === 'string' && inputSlug.length > 0 ? toSlug(inputSlug) : ''
  if (!slug) {
    const slugSource = validated[collection.slugField]
    if (typeof slugSource === 'string' && slugSource) {
      slug = toSlug(slugSource)
    }
  }
  if (!slug) {
    const title = validated.title
    if (typeof title === 'string') {
      slug = toSlug(title)
    }
  }
  if (!slug) {
    return NextResponse.json({ error: 'Unable to determine slug' }, { status: 400 })
  }
  validated[collection.slugField] = slug

  const branchWorkflow: 'draft' | 'publish' = workflow === 'draft' ? 'draft' : workflow === 'publish' ? 'publish' : collection.defaultWorkflow
  const branchName = branchWorkflow === 'draft' ? `cms/${slug}` : undefined

  const payload = collection.format === 'markdown'
    ? { frontmatter: validated, body: typeof markdownBody === 'string' ? markdownBody : '' }
    : { frontmatter: validated, data: validated }

  const content = serializeEntry(collection, payload)

  const client = getOctokitForRequest(req)
  const path = getEntryPath(collection, slug)
  const author = resolveCommitAuthor(auth.mode === 'oauth' ? auth.session : undefined)

  try {
    if (branchName) {
      await ensureBranch(client, branchName)
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }

  const existing = await getFile(client, path, branchName).catch(() => null)

  const commitMessage = typeof message === 'string' && message.trim().length > 0
    ? message
    : `[CMS] ${branchWorkflow.charAt(0).toUpperCase()}${branchWorkflow.slice(1)} ${collection.label}: ${slug}`

  try {
    const response = await putFile(
      client,
      path,
      content,
      commitMessage,
      branchName,
      existing?.sha,
      author,
    )

    if (branchWorkflow === 'draft' && branchName) {
      const summary = { ...validated }
      const existingPr = await findPullRequestByBranch(client, branchName)
      const prTitle = `[CMS] ${slug}`
      const prBody = buildPrBody(collection.label, slug, summary)
      if (existingPr) {
        await updatePullRequestBody(client, existingPr.number, prBody)
        return NextResponse.json({ prUrl: existingPr.html_url, workflow: 'draft' })
      }
      const pr = await createPullRequest(client, branchName, prTitle, prBody)
      return NextResponse.json({ prUrl: pr.html_url, workflow: 'draft' })
    }

    const commitSha = (response as any)?.commit?.sha ?? null
    return NextResponse.json({ commitSha, urlToRaw: getRawFileUrl(path), workflow: 'publish' })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
