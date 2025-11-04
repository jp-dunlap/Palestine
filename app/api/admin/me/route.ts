import { NextRequest, NextResponse } from 'next/server'
import { ensureAuth } from '@/lib/api/auth'
import { createCsrfToken, readCsrfToken, setCsrfCookie } from '@/lib/api/csrf'

export const GET = async (req: NextRequest) => {
  const auth = ensureAuth(req)
  if (!auth.ok) {
    return auth.response
  }
  if (auth.mode === 'token') {
    const existing = readCsrfToken(req)
    const token = existing ?? createCsrfToken()
    const response = NextResponse.json({ mode: 'token', csrfToken: token })
    setCsrfCookie(response, token)
    return response
  }
  const { name, email, login } = auth.session
  return NextResponse.json({ name, email, login })
}
