import crypto from 'crypto'
import { cookies, headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export type AuthMode = 'oauth' | 'token'

export type OAuthSession = {
  name: string
  email: string
  login: string
  accessToken: string
  expiresAt: number
}

const SESSION_COOKIE = 'cms_session'
const STATE_COOKIE = 'cms_oauth_state'
const SESSION_TTL_MS = 12 * 60 * 60 * 1000

const getSecret = () => {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret || secret.length < 16) {
    throw new Error('NEXTAUTH_SECRET must be configured and at least 16 characters long')
  }
  return secret
}

const base64url = (input: Buffer | string) =>
  Buffer.from(input)
    .toString('base64')
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

const sign = (payload: Record<string, unknown>) => {
  const body = base64url(Buffer.from(JSON.stringify(payload)))
  const signature = base64url(crypto.createHmac('sha256', getSecret()).update(body).digest())
  return `${body}.${signature}`
}

const verify = <TPayload extends Record<string, unknown>>(token: string): TPayload | null => {
  const [body, signature] = token.split('.')
  if (!body || !signature) {
    return null
  }
  const expected = base64url(crypto.createHmac('sha256', getSecret()).update(body).digest())
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null
  }
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64').toString()) as TPayload
    return payload
  } catch {
    return null
  }
}

export const getAuthMode = (): AuthMode => {
  const value = (process.env.CMS_AUTH_MODE ?? 'oauth').toLowerCase()
  return value === 'token' ? 'token' : 'oauth'
}

export const isTokenMode = () => getAuthMode() === 'token'

const parseAllowlist = (value?: string) =>
  value
    ?.split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean) ?? []

const allowedEmails = () => parseAllowlist(process.env.ALLOWED_EMAILS)
const allowedLogins = () => parseAllowlist(process.env.ALLOWED_GITHUB_LOGINS)

export const isAllowlisted = (user: { email?: string | null; login?: string | null }) => {
  const emails = allowedEmails()
  const logins = allowedLogins()
  if (emails.length === 0 && logins.length === 0) {
    return true
  }
  const email = user.email?.toLowerCase()
  const login = user.login?.toLowerCase()
  if (email && emails.includes(email)) {
    return true
  }
  if (login && logins.includes(login)) {
    return true
  }
  return false
}

export const createSession = (user: { name: string; email: string; login: string; accessToken: string }) => {
  const session: OAuthSession = {
    ...user,
    expiresAt: Date.now() + SESSION_TTL_MS,
  }
  return sign(session)
}

export const readSession = (token: string | undefined): OAuthSession | null => {
  if (!token) {
    return null
  }
  const payload = verify<OAuthSession>(token)
  if (!payload || typeof payload !== 'object') {
    return null
  }
  if (payload.expiresAt && payload.expiresAt < Date.now()) {
    return null
  }
  return payload
}

export const getSessionFromRequest = (req: NextRequest): OAuthSession | null => {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  return readSession(token)
}

export const getSessionFromCookies = (): OAuthSession | null => {
  try {
    const store = cookies()
    const token = store.get(SESSION_COOKIE)?.value
    return readSession(token)
  } catch {
    return null
  }
}

export const setSessionCookie = (res: NextResponse, token: string) => {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_MS / 1000,
  })
}

export const clearSessionCookie = (res: NextResponse) => {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  })
}

export const createStateToken = () => crypto.randomBytes(16).toString('hex')

export const setStateCookie = (res: NextResponse, state: string) => {
  res.cookies.set({
    name: STATE_COOKIE,
    value: state,
    httpOnly: true,
    path: '/api/auth',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60,
  })
}

export const readStateFromRequest = (req: NextRequest) => req.cookies.get(STATE_COOKIE)?.value

export const clearStateCookie = (res: NextResponse) => {
  res.cookies.set({
    name: STATE_COOKIE,
    value: '',
    httpOnly: true,
    path: '/api/auth',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  })
}

export const requireBasicAuth = (req: NextRequest) => {
  const user = process.env.BASIC_AUTH_USER
  const pass = process.env.BASIC_AUTH_PASS
  if (!user || !pass) {
    return NextResponse.next()
  }
  const header = req.headers.get('authorization')
  if (!header || !header.startsWith('Basic ')) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Palestine CMS"' },
    })
  }
  const decoded = Buffer.from(header.slice(6), 'base64').toString()
  const [name, password] = decoded.split(':')
  if (name !== user || password !== pass) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Palestine CMS"' },
    })
  }
  return NextResponse.next()
}

export const getUserAgent = () => headers().get('user-agent') ?? 'cms-admin'
