import { describe, expect, beforeEach, it, vi } from 'vitest'
import { collections } from '@/lib/collections'
import { listEntries, readEntry, serializeEntry } from '@/lib/content'

const githubMocks = vi.hoisted(() => ({
  listDirectory: vi.fn(),
  getFile: vi.fn(),
  getLatestCommitForPath: vi.fn(),
}))

vi.mock('@/lib/github', () => ({
  listDirectory: githubMocks.listDirectory,
  getFile: githubMocks.getFile,
  getLatestCommitForPath: githubMocks.getLatestCommitForPath,
}))

describe('lib/content', () => {
  beforeEach(() => {
    githubMocks.listDirectory.mockReset()
    githubMocks.getFile.mockReset()
    githubMocks.getLatestCommitForPath.mockReset()
  })

  it('lists english chapter entries using filename-derived slug', async () => {
    const collection = collections.find((item) => item.id === 'chapters_en')!
    const client = {} as any
    githubMocks.listDirectory.mockResolvedValue([
      { name: '001-prologue.mdx', path: 'content/chapters/001-prologue.mdx', sha: 'abc', type: 'file' },
      { name: '001-prologue.ar.mdx', path: 'content/chapters/001-prologue.ar.mdx', sha: 'def', type: 'file' },
    ])
    const markdown = Buffer.from(
      `---\ntitle: Prologue\nslug: prologue\nlanguage: en\ndate: '2024-01-01'\n---\nBody text.\n`,
      'utf-8',
    ).toString('base64')
    githubMocks.getFile.mockImplementation(async (_client, path: string) => ({
      sha: 'abc',
      content: markdown,
      encoding: 'base64',
      path,
    }))
    githubMocks.getLatestCommitForPath.mockResolvedValue({
      sha: 'commit',
      commit: { committer: { date: '2024-01-01T00:00:00Z' } },
    })

    const entries = await listEntries(client, collection)
    expect(entries).toHaveLength(1)
    expect(entries[0].slug).toBe('001-prologue')
    expect(entries[0].title).toBe('Prologue')
    expect(entries[0].path).toBe('content/chapters/001-prologue.mdx')
  })

  it('coerces chapter frontmatter date when parsed as Date', async () => {
    const collection = collections.find((item) => item.id === 'chapters_en')!
    const client = {} as any
    githubMocks.listDirectory.mockResolvedValue([
      { name: '001-prologue.mdx', path: 'content/chapters/001-prologue.mdx', sha: 'abc', type: 'file' },
    ])
    const markdown = Buffer.from(
      `---\ntitle: Prologue\nslug: prologue\nlanguage: en\ndate: 2025-10-29\n---\nBody text.\n`,
      'utf-8',
    ).toString('base64')
    githubMocks.getFile.mockResolvedValue({
      sha: 'abc',
      content: markdown,
      encoding: 'base64',
      path: 'content/chapters/001-prologue.mdx',
    })
    githubMocks.getLatestCommitForPath.mockResolvedValue({
      sha: 'commit',
      commit: { committer: { date: '2024-01-01T00:00:00Z' } },
    })

    const entries = await listEntries(client, collection)
    expect(entries).toHaveLength(1)
    expect(entries[0].slug).toBe('001-prologue')

    const parsed = await readEntry(client, collection, '001-prologue')
    expect(parsed.frontmatter.date).toBe('2025-10-29')
  })

  it('lists arabic chapters when frontmatter date is parsed as Date', async () => {
    const collection = collections.find((item) => item.id === 'chapters_ar')!
    const client = {} as any
    githubMocks.listDirectory.mockResolvedValue([
      { name: '001-prologue.ar.mdx', path: 'content/chapters/001-prologue.ar.mdx', sha: 'def', type: 'file' },
    ])
    const markdown = Buffer.from(
      `---\ntitle: المقدمة\nslug: prologue\nlanguage: ar\ndate: 2025-11-05\n---\nBody text.\n`,
      'utf-8',
    ).toString('base64')
    githubMocks.getFile.mockResolvedValue({
      sha: 'def',
      content: markdown,
      encoding: 'base64',
      path: 'content/chapters/001-prologue.ar.mdx',
    })
    githubMocks.getLatestCommitForPath.mockResolvedValue({
      sha: 'commit',
      commit: { committer: { date: '2024-01-01T00:00:00Z' } },
    })

    const entries = await listEntries(client, collection)
    expect(entries).toHaveLength(1)
    expect(entries[0].slug).toBe('001-prologue.ar')

    const parsed = await readEntry(client, collection, '001-prologue.ar')
    expect(parsed.frontmatter.date).toBe('2025-11-05')
  })

  it('serializes yaml entries with newline termination', () => {
    const collection = collections.find((item) => item.id === 'timeline')!
    const serialized = serializeEntry(collection, {
      frontmatter: {},
      data: {
        id: 'foundations',
        title: 'Foundations',
        start: -2000,
        end: null,
        places: ['Gaza'],
        sources: ['sayigh1997'],
        summary: 'Summary',
        tags: ['foundations'],
        certainty: 'medium',
      },
    })
    expect(serialized.endsWith('\n')).toBe(true)
  })

  it('lists single-file json collections as a single entry', async () => {
    const collection = collections.find((item) => item.id === 'bibliography')!
    const client = {} as any
    githubMocks.getFile.mockResolvedValue({
      sha: 'sha',
      content: Buffer.from(JSON.stringify([{ id: 'one' }]), 'utf-8').toString('base64'),
      encoding: 'base64',
      path: 'data/bibliography.json',
    })
    githubMocks.getLatestCommitForPath.mockResolvedValue({
      sha: 'commit',
      commit: { committer: { date: '2024-01-01T00:00:00Z' } },
    })
    const entries = await listEntries(client, collection)
    expect(entries).toHaveLength(1)
    expect(entries[0].slug).toBe('bibliography')
    expect(entries[0].title).toBe('Bibliography')
    expect(entries[0].path).toBe('data/bibliography.json')
  })

  it('reads entries using resolvePath with branch awareness', async () => {
    const baseCollection = collections.find((item) => item.id === 'chapters_en')!
    const baseResolvePath = baseCollection.resolvePath
    if (!baseResolvePath) {
      throw new Error('chapters_en collection must define resolvePath')
    }
    const collection = { ...baseCollection, resolvePath: vi.fn(baseResolvePath) }
    const client = {} as any
    const markdown = Buffer.from(
      `---\ntitle: Prologue\nslug: prologue\nlanguage: en\n---\nBody text.\n`,
      'utf-8',
    ).toString('base64')
    githubMocks.listDirectory.mockResolvedValue([
      { name: '001-prologue.mdx', path: 'content/chapters/001-prologue.mdx', sha: 'sha', type: 'file' },
    ])
    githubMocks.getFile.mockResolvedValue({
      sha: 'branch-sha',
      content: markdown,
      encoding: 'base64',
      path: 'content/chapters/001-prologue.mdx',
    })

    await readEntry(client, collection, '001-prologue', 'cms/001-prologue')

    expect(collection.resolvePath).toHaveBeenCalledWith(client, '001-prologue', { branch: 'cms/001-prologue' })
    expect(githubMocks.getFile).toHaveBeenCalledWith(client, 'content/chapters/001-prologue.mdx', 'cms/001-prologue')
  })
})
