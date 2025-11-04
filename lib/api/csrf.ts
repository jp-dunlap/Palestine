import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const CSRF_COOKIE = 'cms_csrf'
const CSRF_HEADER = 'x-csrf-token'
const CSRF_TTL_SECONDS = 12 * 60 * 60

export const readCsrfToken = (req: NextRequest) => req.cookies.get(CSRF_COOKIE)?.value ?? null

export const createCsrfToken = () => crypto.randomBytes(32).toString('hex')

export const setCsrfCookie = (res: NextResponse, token: string) => {
  res.cookies.set({
    name: CSRF_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CSRF_TTL_SECONDS,
  })
}

export const ensureCsrfToken = (req: NextRequest, res: NextResponse) => {
  const existing = readCsrfToken(req)
  const token = existing ?? createCsrfToken()
  setCsrfCookie(res, token)
  return token
}

export const requireCsrfToken = (req: NextRequest) => {
  const expected = readCsrfToken(req)
  const provided = req.headers.get(CSRF_HEADER)
  if (!expected || !provided) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  const expectedBuffer = Buffer.from(expected, 'utf8')
  const providedBuffer = Buffer.from(provided, 'utf8')
  if (expectedBuffer.length !== providedBuffer.length) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  if (!crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  return null
}

export const CSRF_HEADER_NAME = CSRF_HEADER
