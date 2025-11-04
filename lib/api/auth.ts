import { NextRequest, NextResponse } from 'next/server'
import { getAuthMode, getSessionFromRequest, isAllowlisted, OAuthSession } from '../auth'

export type AuthResult =
  | { ok: true; mode: 'token'; session: null }
  | { ok: true; mode: 'oauth'; session: OAuthSession }
  | { ok: false; response: NextResponse }

export const ensureAuth = (req: NextRequest): AuthResult => {
  const mode = getAuthMode()
  if (mode === 'token') {
    return { ok: true, mode: 'token', session: null }
  }
  const session = getSessionFromRequest(req)
  if (!session) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (!isAllowlisted(session)) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true, mode: 'oauth', session }
}
