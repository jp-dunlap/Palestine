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

type DirectoryEntry = { name: string; path: string; sha: string; type: 'file' }

const cloneEntries = (entries: DirectoryEntry[]) => entries.map((entry) => ({ ...entry }))

const githubMocks = vi.hoisted(() => ({
  getOctokitForRequest: vi.fn(() => ({})),
  ensureBranch: vi.fn(),
  getFile: vi.fn(),
  putFile: vi.fn(),
  findPullRequestByBranch: vi.fn(() => Promise.resolve(undefined)),
  createPullRequest: vi.fn(),
  getRawFileUrl: vi.fn(() => 'https://raw.githubusercontent.com/test/repo/file'),
  resolveCommitAuthor: vi.fn(() => ({ name: 'Bot', email: 'bot@example.com' })),
  updatePullRequestBody: vi.fn(),
  listDirectory: vi.fn(),
}))

vi.mock('@/lib/github', () => githubMocks)

import { POST } from '@/app/api/admin/save/route'

describe('POST /api/admin/save', () => {
  const branchState: Record<string, DirectoryEntry[]> = {}
  let commitCounter = 0

  const ensureEntries = (branch?: string) => {
    const key = branch ?? 'main'
    if (!branchState[key]) {
      branchState[key] = cloneEntries(branchState.main ?? [])
    }
    return branchState[key]
  }

  beforeEach(() => {
    process.env.CMS_GITHUB_REPO = 'owner/repo'
    process.env.CMS_GITHUB_BRANCH = 'main'
    Object.values(authMock).forEach((mock) => (mock as any).mock?.clear?.())
    Object.values(csrfMock).forEach((mock) => (mock as any).mock?.clear?.())
    Object.values(githubMocks).forEach((mock) => (mock as any).mock?.clear?.())
    githubMocks.putFile.mockClear()
    githubMocks.listDirectory.mockClear()
    githubMocks.getFile.mockClear()
    for (const key of Object.keys(branchState)) {
      delete branchState[key]
    }
    branchState.main = cloneEntries([
      {
        name: '001-prologue.mdx',
        path: 'content/chapters/001-prologue.mdx',
        sha: 'sha-main-en',
        type: 'file',
      },
      {
        name: '001-prologue.ar.mdx',
        path: 'content/chapters/001-prologue.ar.mdx',
        sha: 'sha-main-ar',
        type: 'file',
      },
    ])
    commitCounter = 0

    githubMocks.listDirectory.mockImplementation(async (_client, directory: string, branch?: string) => {
      if (directory !== 'content/chapters') {
        return []
      }
      return cloneEntries(ensureEntries(branch))
    })

    githubMocks.getFile.mockImplementation(async (_client, targetPath: string, branch?: string) => {
      const entries = ensureEntries(branch)
      const existing = entries.find((entry) => entry.path === targetPath)
      if (!existing) {
        throw new Error('Not Found')
      }
      return { sha: existing.sha, content: '', encoding: 'base64', path: existing.path }
    })

    githubMocks.putFile.mockImplementation(
      async (_client, targetPath: string, _content: string, _message: string, branch?: string) => {
        const entries = ensureEntries(branch)
        const name = targetPath.split('/').pop() ?? targetPath
        const nextSha = `sha-${++commitCounter}`
        const updated: DirectoryEntry = { name, path: targetPath, sha: nextSha, type: 'file' }
        const index = entries.findIndex((entry) => entry.name === name)
        if (index >= 0) {
          entries[index] = updated
        } else {
          entries.push(updated)
        }
        return { commit: { sha: nextSha } }
      },
    )
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
    expect(json.commitSha).toBe('sha-1')
    expect(json.urlToRaw).toBe('https://raw.githubusercontent.com/test/repo/file')
    expect(json.slug).toBe('002-hello')
    expect(githubMocks.putFile).toHaveBeenCalled()
    const [, pathArg] = (githubMocks.putFile as any).mock.calls[0]
    expect(pathArg).toBe('content/chapters/002-hello.mdx')
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
    const lastCall = githubMocks.putFile.mock.calls.at(-1)
    expect(lastCall?.[1]).toBe('content/chapters/001-prologue.mdx')
  })

  it('updates the same file when saving a draft multiple times', async () => {
    const body = {
      collection: 'chapters_en',
      slug: 'hello',
      frontmatter: { title: 'Hello', slug: 'hello', language: 'en' },
      body: 'Body',
      workflow: 'draft',
      message: '',
    }
    const request = (payload: Record<string, unknown>) =>
      new NextRequest('http://localhost/api/admin/save', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      })

    await POST(request(body))
    const firstPath = (githubMocks.putFile as any).mock.calls[0][1]
    expect(firstPath).toBe('content/chapters/002-hello.mdx')

    githubMocks.putFile.mockClear()
    githubMocks.findPullRequestByBranch.mockResolvedValue({ html_url: 'https://example.com', number: 1 } as any)

    await POST(
      request({
        ...body,
        originalSlug: '002-hello',
      }),
    )
    const secondPath = (githubMocks.putFile as any).mock.calls[0][1]
    expect(secondPath).toBe('content/chapters/002-hello.mdx')
  })

  it('updates the Arabic sibling in place on a draft branch', async () => {
    const body = {
      collection: 'chapters_ar',
      slug: '001-prologue.ar',
      originalSlug: '001-prologue.ar',
      frontmatter: { title: 'مرحبا', slug: 'prologue', language: 'ar' },
      body: 'Body',
      workflow: 'draft',
      message: '',
    }
    const makeRequest = () =>
      new NextRequest('http://localhost/api/admin/save', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      })

    const firstResponse = await POST(makeRequest())
    expect(firstResponse.status).toBe(200)
    const firstCall = githubMocks.putFile.mock.calls.at(-1)
    expect(firstCall?.[1]).toBe('content/chapters/001-prologue.ar.mdx')

    const initialCallCount = githubMocks.putFile.mock.calls.length

    const secondResponse = await POST(makeRequest())
    expect(secondResponse.status).toBe(200)
    expect(githubMocks.putFile.mock.calls.length).toBe(initialCallCount + 1)
    const secondCall = githubMocks.putFile.mock.calls.at(-1)
    expect(secondCall?.[1]).toBe('content/chapters/001-prologue.ar.mdx')
  })
})
