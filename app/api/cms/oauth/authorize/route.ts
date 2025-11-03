export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const STATE_COOKIE = 'palestine_cms_oauth_state';

function ensureOAuthMode() {
  const mode = (process.env.CMS_MODE ?? 'token').toLowerCase();
  if (mode !== 'oauth') {
    throw new Error('OAuth mode is disabled. Set CMS_MODE=oauth to enable this endpoint.');
  }
}

function requireClientId() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    throw new Error('GITHUB_CLIENT_ID is not configured.');
  }
  return clientId;
}

export async function GET(request: NextRequest) {
  try {
    ensureOAuthMode();
    const clientId = requireClientId();

    const state = crypto.randomBytes(16).toString('hex');
    const redirectUri = new URL('/api/cms/oauth/callback', request.nextUrl.origin).toString();

    const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
    authorizeUrl.searchParams.set('client_id', clientId);
    authorizeUrl.searchParams.set('scope', 'repo');
    authorizeUrl.searchParams.set('state', state);
    authorizeUrl.searchParams.set('redirect_uri', redirectUri);

    const response = NextResponse.redirect(authorizeUrl.toString());
    response.cookies.set({
      name: STATE_COOKIE,
      value: state,
      httpOnly: true,
      secure: true,
      path: '/api/cms/oauth',
      sameSite: 'lax',
      maxAge: 60 * 5,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OAuth authorization failed';
    return new NextResponse(message, { status: 500 });
  }
}
