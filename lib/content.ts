import { CollectionDefinition, getEntryPath } from './collections'
import { parseMarkdown, serializeMarkdown } from './md'
import { getFile, getLatestCommitForPath, listDirectory, type GitHubClient } from './github'

export type ParsedEntry = {
  frontmatter: Record<string, unknown>
  body?: string
  data?: Record<string, unknown> | unknown
  sha: string
  path: string
  raw: string
}

export type EntrySummary = {
  path: string
  slug: string
  title: string
  updatedAt: string | null
}

const decodeContent = (encoded: string, encoding: string) => {
  if (encoding !== 'base64') {
    throw new Error(`Unsupported encoding ${encoding}`)
  }
  return Buffer.from(encoded, 'base64').toString('utf-8')
}

export const readEntry = async (
  client: GitHubClient,
  collection: CollectionDefinition,
  slug: string,
  branch?: string,
): Promise<ParsedEntry> => {
  const file = await getFile(client, getEntryPath(collection, slug), branch).catch(() => null)
  if (!file) {
    throw new Error('Not Found')
  }
  const raw = decodeContent(file.content, file.encoding)
  if (collection.format === 'markdown') {
    const parsed = parseMarkdown<Record<string, unknown>>(raw)
    const validation = collection.schema.safeParse(parsed.frontmatter)
    if (!validation.success) {
      throw validation.error
    }
    return {
      frontmatter: validation.data,
      body: parsed.body,
      path: getEntryPath(collection, slug),
      sha: file.sha,
      raw,
    }
  }
  const data = JSON.parse(raw)
  const validation = collection.schema.safeParse(data)
  if (!validation.success) {
    throw validation.error
  }
  return {
    frontmatter: validation.data as Record<string, unknown>,
    data: validation.data,
    path: getEntryPath(collection, slug, '.json'),
    sha: file.sha,
    raw,
  }
}

export const serializeEntry = (
  collection: CollectionDefinition,
  payload: { frontmatter: Record<string, unknown>; body?: string; data?: unknown },
) => {
  if (collection.format === 'markdown') {
    return serializeMarkdown({ frontmatter: payload.frontmatter, body: payload.body ?? '' })
  }
  return `${JSON.stringify(payload.data ?? payload.frontmatter, null, 2)}\n`
}

export const listEntries = async (
  client: GitHubClient,
  collection: CollectionDefinition,
  branch?: string,
): Promise<EntrySummary[]> => {
  const entries = await listDirectory(client, collection.directory, branch).catch(() => [])
  const files = entries.filter((entry) => entry.type === 'file' && entry.name.endsWith(collection.extension))
  const summaries: EntrySummary[] = []
  for (const file of files) {
    const slug = file.name.slice(0, -collection.extension.length)
    try {
      const parsed = await readEntry(client, collection, slug, branch)
      const title = (parsed.frontmatter?.title as string | undefined) ?? slug
      const commit = await getLatestCommitForPath(client, parsed.path, branch)
      summaries.push({
        path: parsed.path,
        slug,
        title,
        updatedAt: commit?.commit?.committer?.date ?? null,
      })
    } catch {
      continue
    }
  }
  summaries.sort((a, b) => {
    if (!a.updatedAt && !b.updatedAt) return a.slug.localeCompare(b.slug)
    if (!a.updatedAt) return 1
    if (!b.updatedAt) return -1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
  return summaries
}
