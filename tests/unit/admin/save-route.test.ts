import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  ensureAuth: vi.fn(() => ({ ok: true, mode: 'token', session: null })),
}))

vi.mock('@/lib/api/auth', () => authMock)

const csrfMock = vi.hoisted(() => ({
  requireCsrfToken: vi.fn(() => null),
}))

vi.mock('@/lib/api/csrf', () => csrfMock)

const contentMocks = vi.hoisted(() => ({
  resolveCollectionPath: vi.fn((_, __, slug: string) => Promise.resolve(`content/chapters/${slug}.mdx`)),
  slugFromPath: vi.fn((_, path: string) => {
    const base = path.split('/').pop() ?? ''
    return base.replace(/\.mdx$/, '')
  }),
}))

vi.mock('@/lib/content', async () => {
  const actual = await vi.importActual<typeof import('@/lib/content')>('@/lib/content')
  return {
    ...actual,
    resolveCollectionPath: contentMocks.resolveCollectionPath,
    slugFromPath: contentMocks.slugFromPath,
  }
})

const githubMocks = vi.hoisted(() => ({
  getOctokitForRequest: vi.fn(() => ({})),
  ensureBranch: vi.fn(),
  getFile: vi.fn(() => Promise.resolve(null)),
  putFile: vi.fn(() => Promise.resolve({ commit: { sha: 'abc123' } })),
  findPullRequestByBranch: vi.fn(() => Promise.resolve(undefined)),
  createPullRequest: vi.fn(),
  getRawFileUrl: vi.fn(() => 'https://raw.githubusercontent.com/test/repo/file'),
  resolveCommitAuthor: vi.fn(() => ({ name: 'Bot', email: 'bot@example.com' })),
  updatePullRequestBody: vi.fn(),
}))

vi.mock('@/lib/github', () => githubMocks)

import { POST } from '@/app/api/admin/save/route'

describe('POST /api/admin/save', () => {
  beforeEach(() => {
    process.env.CMS_GITHUB_REPO = 'owner/repo'
    process.env.CMS_GITHUB_BRANCH = 'main'
    Object.values(authMock).forEach((mock) => (mock as any).mock?.clear?.())
    Object.values(csrfMock).forEach((mock) => (mock as any).mock?.clear?.())
    Object.values(githubMocks).forEach((mock) => (mock as any).mock?.clear?.())
  })

  afterEach(() => {
    delete process.env.CMS_GITHUB_REPO
    delete process.env.CMS_GITHUB_BRANCH
  })

  it('publishes markdown entry to main branch', async () => {
    const body = {
      collection: 'chapters_en',
      frontmatter: { title: 'Hello', slug: 'hello', language: 'en' },
      body: 'Body',
      workflow: 'publish',
      message: '',
    }
    const request = new NextRequest('http://localhost/api/admin/save', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.commitSha).toBe('abc123')
    expect(json.urlToRaw).toBe('https://raw.githubusercontent.com/test/repo/file')
    expect(json.slug).toBe('hello')
    expect(githubMocks.putFile).toHaveBeenCalled()
    expect(contentMocks.resolveCollectionPath).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), 'hello', undefined)
    const [, pathArg] = (githubMocks.putFile as any).mock.calls[0]
    expect(pathArg).toBe('content/chapters/hello.mdx')
    expect(csrfMock.requireCsrfToken).toHaveBeenCalled()
    const [, , , commitMessage] = (githubMocks.putFile as any).mock.calls[0]
    expect(commitMessage).toContain('Publish')
  })

  it('preserves existing filename when originalSlug is provided', async () => {
    const body = {
      collection: 'chapters_en',
      slug: 'prologue',
      originalSlug: '001-prologue',
      frontmatter: { title: 'Hello', slug: 'prologue', language: 'en' },
      body: 'Body',
      workflow: 'publish',
      message: '',
    }
    const request = new NextRequest('http://localhost/api/admin/save', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
    await POST(request)
    expect(contentMocks.resolveCollectionPath).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      '001-prologue',
      undefined,
    )
  })
})
