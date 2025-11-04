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
      frontmatter: { title: 'Hello', slug: 'hello' },
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
    expect(githubMocks.putFile).toHaveBeenCalled()
    expect(csrfMock.requireCsrfToken).toHaveBeenCalled()
    const [, , , commitMessage] = (githubMocks.putFile as any).mock.calls[0]
    expect(commitMessage).toContain('Publish')
  })
})
