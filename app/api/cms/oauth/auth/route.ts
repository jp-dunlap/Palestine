// app/api/cms/oauth/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://palestine-two.vercel.app';

  if (!clientId) {
    return new NextResponse('GITHUB_CLIENT_ID is not set', { status: 500 });
  }

  // Decap will pass state; we’ll echo it back
  const { searchParams } = new URL(req.url);
  const state = searchParams.get('state') ?? '';

  const redirectUri = `${siteUrl}/api/cms/oauth/callback`;

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'repo'); // repo scope needed for private repos / write access
  url.searchParams.set('state', state);
  url.searchParams.set('allow_signup', 'false');

  return NextResponse.redirect(url.toString());
}
