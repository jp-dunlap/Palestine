import { NextResponse, NextRequest } from 'next/server';

const REALM = 'Palestine CMS';

// Protect private surfaces (all /admin assets + /api/cms/*)
export const config = {
  matcher: ['/admin/:path*', '/api/cms/:path*'],
};

function unauthorized() {
  return new Response('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}"` },
  });
}

export function middleware(req: NextRequest) {
  const user =
    process.env.BASIC_AUTH_USER ??
    process.env.BASIC_AUTH_USERS ??
    '';
  const pass =
    process.env.BASIC_AUTH_PASS ??
    process.env.BASIC_AUTH_PASSWORD ??
    '';
  const mode = (process.env.CMS_MODE ?? '').toLowerCase();

  if (!user || !pass || !mode) {
    return new Response('CMS authentication is not configured', { status: 500 });
  }

  if (req.method === 'OPTIONS') {
    return NextResponse.next();
  }

  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Basic ')) {
    return unauthorized();
  }

  // Edge-safe base64 decode (no Buffer on Edge)
  let name = '';
  let pwd = '';
  try {
    const encoded = auth.slice(6);
    [name, pwd] = atob(encoded).split(':');
  } catch {
    return unauthorized();
  }

  if (name !== user || pwd !== pass) {
    return unauthorized();
  }

  return NextResponse.next();
}
