import { NextRequest, NextResponse } from 'next/server'

const REALM = 'Palestine CMS'

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}

const unauthorized = () =>
  new Response('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}"` },
  })

export function middleware(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return NextResponse.next()
  }

  const mode = (process.env.CMS_AUTH_MODE ?? 'oauth').toLowerCase()
  if (mode !== 'token') {
    return NextResponse.next()
  }

  const user = process.env.BASIC_AUTH_USER
  const pass = process.env.BASIC_AUTH_PASS
  if (!user || !pass) {
    return NextResponse.next()
  }

  const header = req.headers.get('authorization')
  if (!header || !header.startsWith('Basic ')) {
    return unauthorized()
  }

  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString()
    const [name, password] = decoded.split(':')
    if (name !== user || password !== pass) {
      return unauthorized()
    }
  } catch {
    return unauthorized()
  }

  return NextResponse.next()
}
