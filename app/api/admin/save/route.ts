import { NextRequest, NextResponse } from 'next/server'
import { ensureAuth } from '@/lib/api/auth'
import { requireCsrfToken } from '@/lib/api/csrf'
import { getCollection } from '@/lib/collections'
import { resolveCollectionPath, serializeEntry, slugFromPath } from '@/lib/content'
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
import { sanitizeFilename, slugify } from '@/lib/slugs'

const parseBody = async (req: NextRequest) => {
  try {
    return await req.json()
  } catch {
    return null
  }
}

const toSlug = (value?: string | null) => {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.includes('.')) {
    return sanitizeFilename(trimmed.toLowerCase())
  }
  return slugify(trimmed)
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
  const {
    collection: collectionId,
    slug: inputSlug,
    originalSlug,
    frontmatter = {},
    data,
    body: markdownBody,
    workflow,
    message,
  } = body
  if (typeof collectionId !== 'string') {
    return NextResponse.json({ error: 'collection is required' }, { status: 400 })
  }
  const collection = getCollection(collectionId)
  if (!collection) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
  }
  const candidateData = collection.format === 'markdown' ? frontmatter : data ?? frontmatter
  if (collection.format === 'markdown') {
    if (!candidateData || typeof candidateData !== 'object' || Array.isArray(candidateData)) {
      return NextResponse.json({ error: 'frontmatter must be an object' }, { status: 400 })
    }
  } else if (candidateData === undefined) {
    return NextResponse.json({ error: 'data is required for this collection' }, { status: 400 })
  }
  const parsed = collection.schema.safeParse(candidateData)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 })
  }
  const validated = parsed.data
  let slug = typeof inputSlug === 'string' && inputSlug.length > 0 ? toSlug(inputSlug) : ''
  if (!slug && typeof validated === 'object' && validated !== null && !Array.isArray(validated)) {
    const slugSource = (validated as Record<string, unknown>)[collection.slugField]
    if (typeof slugSource === 'string' && slugSource) {
      slug = toSlug(slugSource)
    }
  }
  if (!slug && typeof validated === 'object' && validated !== null && !Array.isArray(validated)) {
    const title = (validated as Record<string, unknown>).title
    if (typeof title === 'string') {
      slug = toSlug(title)
    }
  }
  if (!slug) {
    return NextResponse.json({ error: 'Unable to determine slug' }, { status: 400 })
  }

  if (collection.format === 'markdown') {
    const fm = validated as Record<string, unknown>
    const existingSlug = fm[collection.slugField]
    if (typeof existingSlug !== 'string' || existingSlug.trim().length === 0) {
      const derived = slug.replace(/\.ar$/, '').replace(/^(\d{3})-/, '')
      fm[collection.slugField] = derived
    }
  } else if (typeof validated === 'object' && validated !== null && !Array.isArray(validated)) {
    const container = validated as Record<string, unknown>
    if (typeof container[collection.slugField] !== 'string') {
      container[collection.slugField] = slug
    }
  }

  const branchWorkflow: 'draft' | 'publish' = workflow === 'draft' ? 'draft' : workflow === 'publish' ? 'publish' : collection.defaultWorkflow
  const branchName = branchWorkflow === 'draft' ? `cms/${slug}` : undefined

  const client = getOctokitForRequest(req)
  try {
    if (branchName) {
      await ensureBranch(client, branchName)
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }

  const lookupSlug = typeof originalSlug === 'string' && originalSlug.trim().length > 0 ? originalSlug.trim() : slug
  const path = await resolveCollectionPath(client, collection, lookupSlug, branchName)

  const payload = collection.format === 'markdown'
    ? {
        frontmatter: validated as Record<string, unknown>,
        body: typeof markdownBody === 'string' ? markdownBody : '',
      }
    : {
        frontmatter: {},
        data: validated,
      }

  const content = serializeEntry(collection, payload)

  const author = resolveCommitAuthor(auth.mode === 'oauth' ? auth.session : undefined)

  const existing = await getFile(client, path, branchName).catch(() => null)
  const pathSlug = slugFromPath(collection, path)

  const commitMessage = typeof message === 'string' && message.trim().length > 0
    ? message
    : `[CMS] ${branchWorkflow.charAt(0).toUpperCase()}${branchWorkflow.slice(1)} ${collection.label}: ${pathSlug}`

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
      const summary =
        collection.format === 'markdown' && typeof validated === 'object' && !Array.isArray(validated)
          ? { ...(validated as Record<string, unknown>) }
          : { [collection.slugField]: pathSlug }
      const existingPr = await findPullRequestByBranch(client, branchName)
      const prTitle = `[CMS] ${pathSlug}`
      const prBody = buildPrBody(collection.label, pathSlug, summary)
      if (existingPr) {
        await updatePullRequestBody(client, existingPr.number, prBody)
        return NextResponse.json({ prUrl: existingPr.html_url, workflow: 'draft' })
      }
      const pr = await createPullRequest(client, branchName, prTitle, prBody)
      return NextResponse.json({ prUrl: pr.html_url, workflow: 'draft' })
    }

    const commitSha = (response as any)?.commit?.sha ?? null
    return NextResponse.json({ commitSha, urlToRaw: getRawFileUrl(path), workflow: 'publish', slug: pathSlug })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
