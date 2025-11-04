import { NextRequest, NextResponse } from 'next/server'
import {
  clearSessionCookie,
  clearStateCookie,
  createSession,
  createStateToken,
  getAuthMode,
  getSessionFromRequest,
  isAllowlisted,
  readStateFromRequest,
  setSessionCookie,
  setStateCookie,
} from '@/lib/auth'

const githubTokenEndpoint = 'https://github.com/login/oauth/access_token'
const githubUserEndpoint = 'https://api.github.com/user'
const githubEmailsEndpoint = 'https://api.github.com/user/emails'

const redirectUrl = () => {
  const baseEnv = process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL
  if (!baseEnv) {
    throw new Error('NEXTAUTH_URL must be configured')
  }
  const base = baseEnv.startsWith('http') ? baseEnv : `https://${baseEnv}`
  return `${base.replace(/\/$/, '')}/api/auth/callback/github`
}

const getClientId = () => process.env.GITHUB_CLIENT_ID ?? ''
const getClientSecret = () => process.env.GITHUB_CLIENT_SECRET ?? ''

const ensureOAuthMode = () => {
  if (getAuthMode() !== 'oauth') {
    throw new Error('OAuth mode is disabled')
  }
  if (!getClientId() || !getClientSecret()) {
    throw new Error('GitHub OAuth credentials are not configured')
  }
}

const signIn = (req: NextRequest) => {
  ensureOAuthMode()
  const state = createStateToken()
  const url = new URL('https://github.com/login/oauth/authorize')
  url.searchParams.set('client_id', getClientId())
  url.searchParams.set('redirect_uri', redirectUrl())
  url.searchParams.set('scope', 'repo user')
  url.searchParams.set('state', state)
  const response = NextResponse.redirect(url.toString())
  setStateCookie(response, state)
  return response
}

const fetchAccessToken = async (code: string) => {
  const response = await fetch(githubTokenEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      client_id: getClientId(),
      client_secret: getClientSecret(),
      code,
      redirect_uri: redirectUrl(),
    }),
  })
  if (!response.ok) {
    throw new Error('Failed to exchange code for token')
  }
  const json = (await response.json()) as { access_token?: string; error?: string }
  if (!json.access_token) {
    throw new Error(json.error ?? 'Invalid OAuth response')
  }
  return json.access_token
}

const fetchUserProfile = async (token: string) => {
  const headers = { Authorization: `Bearer ${token}`, 'User-Agent': 'palestine-cms-admin' }
  const userResponse = await fetch(githubUserEndpoint, { headers })
  if (!userResponse.ok) {
    throw new Error('Failed to fetch user profile')
  }
  const profile = (await userResponse.json()) as { login: string; name?: string; email?: string | null }
  if (!profile.email) {
    const emailsResponse = await fetch(githubEmailsEndpoint, { headers })
    if (emailsResponse.ok) {
      const emails = (await emailsResponse.json()) as { email: string; primary?: boolean; verified?: boolean }[]
      const primary = emails.find((entry) => entry.primary && entry.verified)
      profile.email = primary?.email ?? emails[0]?.email ?? null
    }
  }
  return profile
}

const oauthCallback = async (req: NextRequest) => {
  ensureOAuthMode()
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  if (!code || !state) {
    return NextResponse.json({ error: 'Invalid OAuth response' }, { status: 400 })
  }
  const storedState = readStateFromRequest(req)
  if (!storedState || storedState !== state) {
    return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 })
  }
  try {
    const token = await fetchAccessToken(code)
    const profile = await fetchUserProfile(token)
    if (!isAllowlisted(profile)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    const response = NextResponse.redirect('/admin')
    const sessionToken = createSession({
      name: profile.name ?? profile.login,
      email: profile.email ?? `${profile.login}@users.noreply.github.com`,
      login: profile.login,
      accessToken: token,
    })
    setSessionCookie(response, sessionToken)
    clearStateCookie(response)
    return response
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

const getSession = (req: NextRequest) => {
  const session = getSessionFromRequest(req)
  if (!session) {
    return NextResponse.json(null)
  }
  return NextResponse.json({ name: session.name, email: session.email, login: session.login })
}

const signOut = (req: NextRequest) => {
  const response = NextResponse.json({ ok: true })
  clearSessionCookie(response)
  return response
}

const notFound = () => NextResponse.json({ error: 'Not Found' }, { status: 404 })

export const GET = async (req: NextRequest) => {
  const segments = req.nextUrl.pathname.split('/')
  const action = segments.pop() ?? ''
  if (action === 'signin') {
    try {
      return signIn(req)
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 })
    }
  }
  if (segments.pop() === 'callback') {
    return oauthCallback(req)
  }
  if (action === 'session') {
    return getSession(req)
  }
  return notFound()
}

export const POST = async (req: NextRequest) => {
  const segments = req.nextUrl.pathname.split('/')
  const action = segments.pop() ?? ''
  if (action === 'signout') {
    return signOut(req)
  }
  return notFound()
}
