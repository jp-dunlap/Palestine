import { describe, expect, beforeEach, it, vi } from 'vitest'
import { collections } from '@/lib/collections'
import { listEntries, serializeEntry } from '@/lib/content'

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
      `---\ntitle: Prologue\nslug: prologue\nlanguage: en\n---\nBody text.\n`,
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
})
