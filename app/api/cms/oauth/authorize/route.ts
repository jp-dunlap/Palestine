export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return new Response('GITHUB_CLIENT_ID is missing', { status: 500 });
  }

  const state = crypto.randomUUID();
  const redirectUri = `${url.origin}/api/cms/oauth/callback`;

  const gh = new URL('https://github.com/login/oauth/authorize');
  gh.searchParams.set('client_id', clientId);
  gh.searchParams.set('redirect_uri', redirectUri);
  gh.searchParams.set('scope', 'repo,user:email');
  gh.searchParams.set('state', state);

  const res = NextResponse.redirect(gh.toString(), 302);
  res.cookies.set('cms_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/api/cms/oauth',
    maxAge: 600,
  });
  return res;
}
