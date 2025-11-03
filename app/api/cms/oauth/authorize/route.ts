export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const STATE_COOKIE = 'palestine_cms_oauth_state';

function ensureOAuthMode() {
  const mode = (process.env.CMS_MODE ?? 'token').toLowerCase();
  if (mode !== 'oauth') throw new Error('OAuth mode is disabled. Set CMS_MODE=oauth.');
}

function getClientId() {
  return process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '';
}

export async function GET(request: NextRequest) {
  try {
    ensureOAuthMode();
    const clientId = getClientId();
    if (!clientId) throw new Error('GITHUB_CLIENT_ID missing in environment');

    const state = crypto.randomBytes(16).toString('hex');
    const redirectUri = new URL('/api/cms/oauth/callback', request.nextUrl.origin).toString();

    const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
    authorizeUrl.searchParams.set('client_id', clientId);
    authorizeUrl.searchParams.set('scope', 'repo');
    authorizeUrl.searchParams.set('state', state);
    authorizeUrl.searchParams.set('redirect_uri', redirectUri);

    const res = NextResponse.redirect(authorizeUrl.toString());
    res.cookies.set({
      name: STATE_COOKIE, value: state, httpOnly: true, secure: true, path: '/api/cms/oauth',
      sameSite: 'lax', maxAge: 60 * 5,
    });
    return res;
  } catch (err: any) {
    return new NextResponse(err?.message || 'OAuth authorization failed', { status: 500 });
  }
}
