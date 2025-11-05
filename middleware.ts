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

  const pathname = req.nextUrl.pathname
  const mode = (process.env.CMS_AUTH_MODE ?? 'oauth').toLowerCase()
  if (mode !== 'token') {
    const isAdminApi = pathname.startsWith('/api/admin')
    const isAdminPage = pathname.startsWith('/admin')
    if (isAdminPage && !isAdminApi) {
      const session = req.cookies.get('cms_session')?.value
      if (!session) {
        return NextResponse.redirect(new URL('/api/auth/signin', req.url), 302)
      }
    }
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
    const separatorIndex = decoded.indexOf(':')
    if (separatorIndex === -1) {
      return unauthorized()
    }
    const name = decoded.slice(0, separatorIndex)
    const password = decoded.slice(separatorIndex + 1)
    if (name !== user || password !== pass) {
      return unauthorized()
    }
  } catch {
    return unauthorized()
  }

  return NextResponse.next()
}
