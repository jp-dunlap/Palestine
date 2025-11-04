import { NextRequest } from 'next/server'
import { getAuthMode, getSessionFromRequest, isAllowlisted, OAuthSession } from './auth'

const GITHUB_API = 'https://api.github.com'

type RepoConfig = {
  owner: string
  repo: string
  defaultBranch: string
}

type GitHubRequestInit = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown
  headers?: HeadersInit
  asJson?: boolean
}

export type GitHubClient = {
  request<T = unknown>(method: string, path: string, init?: GitHubRequestInit): Promise<T>
  token: string
  sessionUser?: OAuthSession
}

const getRepoConfig = (): RepoConfig => {
  const repo = process.env.CMS_GITHUB_REPO
  if (!repo || !repo.includes('/')) {
    throw new Error('CMS_GITHUB_REPO must be set as owner/repo')
  }
  const [owner, name] = repo.split('/')
  const defaultBranch = process.env.CMS_GITHUB_BRANCH ?? 'main'
  return { owner, repo: name, defaultBranch }
}

const getUserAgent = () => process.env.CMS_USER_AGENT ?? 'palestine-cms-admin'

const createClient = (token: string, sessionUser?: OAuthSession): GitHubClient => {
  return {
    token,
    sessionUser,
    async request<T = unknown>(method: string, path: string, init: GitHubRequestInit = {}) {
      const url = `${GITHUB_API}${path}`
      const { body, asJson, headers: initHeaders, ...rest } = init
      const headers = new Headers(initHeaders ?? {})
      headers.set('Accept', 'application/vnd.github+json')
      headers.set('Authorization', `Bearer ${token}`)
      headers.set('User-Agent', getUserAgent())
      if (!(body instanceof FormData) && body !== undefined) {
        headers.set('Content-Type', 'application/json')
      }
      const response = await fetch(url, {
        method,
        headers,
        body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
        ...rest,
      })
      if (response.status >= 200 && response.status < 300) {
        if (response.status === 204) {
          return undefined as T
        }
        if (asJson === false) {
          return (await response.text()) as T
        }
        return (await response.json()) as T
      }
      const text = await response.text()
      throw new Error(`GitHub API ${method} ${path} failed: ${response.status} ${text}`)
    },
  }
}

export const resolveCommitAuthor = (session?: OAuthSession) => {
  if (session) {
    return {
      name: session.name || session.login,
      email: session.email || `${session.login}@users.noreply.github.com`,
    }
  }
  return {
    name: process.env.CMS_COMMIT_AUTHOR_NAME ?? 'Palestine CMS Bot',
    email: process.env.CMS_COMMIT_AUTHOR_EMAIL ?? 'cms@palestine-solidarity.local',
  }
}

export const getOctokitForRequest = (req: NextRequest): GitHubClient => {
  const mode = getAuthMode()
  if (mode === 'token') {
    const token = process.env.CMS_GITHUB_TOKEN
    if (!token) {
      throw new Error('CMS_GITHUB_TOKEN must be configured in token mode')
    }
    return createClient(token)
  }
  const session = getSessionFromRequest(req)
  if (!session) {
    throw new Error('Unauthorized')
  }
  if (!isAllowlisted(session)) {
    throw new Error('Forbidden')
  }
  return createClient(session.accessToken, session)
}

export const ensureBranch = async (client: GitHubClient, branch: string, fromBranch?: string) => {
  const { owner, repo, defaultBranch } = getRepoConfig()
  const baseBranch = fromBranch ?? defaultBranch
  try {
    await client.request('GET', `/repos/${owner}/${repo}/git/ref/heads/${branch}`)
    return
  } catch (error) {
    // create branch from base
  }
  const baseRef = await client.request<{ object: { sha: string } }>(
    'GET',
    `/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`,
  )
  await client.request('POST', `/repos/${owner}/${repo}/git/refs`, {
    body: {
      ref: `refs/heads/${branch}`,
      sha: baseRef.object.sha,
    },
  })
}

type FileContentResponse = {
  sha: string
  content: string
  encoding: string
  path: string
}

export const getFile = async (client: GitHubClient, path: string, branch?: string) => {
  const { owner, repo, defaultBranch } = getRepoConfig()
  const ref = branch ?? defaultBranch
  return client.request<FileContentResponse>(
    'GET',
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}` + `?ref=${ref}`,
  )
}

export const putFile = async (
  client: GitHubClient,
  path: string,
  content: string | Buffer,
  message: string,
  branch?: string,
  sha?: string,
  author?: { name: string; email: string },
) => {
  const { owner, repo, defaultBranch } = getRepoConfig()
  const ref = branch ?? defaultBranch
  const payload = Buffer.isBuffer(content) ? content : Buffer.from(content)
  const body: Record<string, unknown> = {
    message,
    content: payload.toString('base64'),
    branch: ref,
  }
  if (sha) {
    body.sha = sha
  }
  if (author) {
    body.committer = author
    body.author = author
  }
  const encoded = encodeURIComponent(path).replace(/%2F/g, '/')
  return client.request('PUT', `/repos/${owner}/${repo}/contents/${encoded}`, { body })
}

export const deleteFile = async (
  client: GitHubClient,
  path: string,
  message: string,
  branch?: string,
  sha?: string,
  author?: { name: string; email: string },
) => {
  const { owner, repo, defaultBranch } = getRepoConfig()
  const ref = branch ?? defaultBranch
  const body: Record<string, unknown> = {
    message,
    branch: ref,
  }
  if (sha) {
    body.sha = sha
  }
  if (author) {
    body.committer = author
    body.author = author
  }
  const encoded = encodeURIComponent(path).replace(/%2F/g, '/')
  return client.request('DELETE', `/repos/${owner}/${repo}/contents/${encoded}`, { body })
}

export const listDirectory = async (client: GitHubClient, directory: string, branch?: string) => {
  const { owner, repo, defaultBranch } = getRepoConfig()
  const ref = branch ?? defaultBranch
  return client.request<
    {
      name: string
      path: string
      sha: string
      type: 'file' | 'dir'
    }[]
  >(
    'GET',
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(directory).replace(/%2F/g, '/')}` + `?ref=${ref}`,
  )
}

export const getLatestCommitForPath = async (client: GitHubClient, path: string, branch?: string) => {
  const { owner, repo, defaultBranch } = getRepoConfig()
  const ref = branch ?? defaultBranch
  const commits = await client.request<
    { sha: string; commit: { committer: { date: string } } }[]
  >(
    'GET',
    `/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}&sha=${encodeURIComponent(ref)}&per_page=1`,
  )
  return commits[0]
}

type PullRequest = {
  number: number
  html_url: string
  head: { ref: string }
}

export const findPullRequestByBranch = async (client: GitHubClient, branch: string) => {
  const { owner, repo } = getRepoConfig()
  const prs = await client.request<PullRequest[]>(
    'GET',
    `/repos/${owner}/${repo}/pulls?state=open&head=${encodeURIComponent(owner)}:${encodeURIComponent(branch)}`,
  )
  return prs.find((pr) => pr.head.ref === branch)
}

export const createPullRequest = async (
  client: GitHubClient,
  branch: string,
  title: string,
  body: string,
) => {
  const { owner, repo, defaultBranch } = getRepoConfig()
  return client.request<PullRequest>('POST', `/repos/${owner}/${repo}/pulls`, {
    body: {
      title,
      head: branch,
      base: defaultBranch,
      body,
    },
  })
}

export const updatePullRequestBody = async (client: GitHubClient, number: number, body: string) => {
  const { owner, repo } = getRepoConfig()
  return client.request<PullRequest>('PATCH', `/repos/${owner}/${repo}/pulls/${number}`, {
    body: { body },
  })
}

export const getRawFileUrl = (path: string, branch?: string) => {
  const { owner, repo, defaultBranch } = getRepoConfig()
  const ref = branch ?? defaultBranch
  return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`
}
