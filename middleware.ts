import { NextResponse, NextRequest } from 'next/server';

const REALM = 'Palestine CMS';

export const config = {
  matcher: ['/admin/:path*', '/api/cms/:path*'],
};

function unauthorized() {
  return new Response('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}"` },
  });
}

function missingConfig(message: string) {
  return new Response(`CMS authentication is not configured: ${message}`, {
    status: 500,
  });
}

function decodeCredentials(raw: string) {
  try {
    const value = atob(raw);
    const idx = value.indexOf(':');
    if (idx === -1) {
      return null;
    }
    return { user: value.slice(0, idx), pass: value.slice(idx + 1) };
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return NextResponse.next();
  }

  const cmsMode = process.env.CMS_MODE?.toLowerCase();
  if (!cmsMode) {
    return missingConfig('CMS_MODE is missing');
  }
  if (cmsMode !== 'oauth' && cmsMode !== 'token') {
    return missingConfig(`CMS_MODE must be "oauth" or "token" (received "${cmsMode}")`);
  }

  const user =
    process.env.BASIC_AUTH_USER ??
    process.env.BASIC_AUTH_USERS ??
    '';
  const pass =
    process.env.BASIC_AUTH_PASS ??
    process.env.BASIC_AUTH_PASSWORD ??
    '';

  if (!user || !pass) {
    return missingConfig('BASIC_AUTH_USER/BASIC_AUTH_PASS are missing');
  }

  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Basic ')) {
    return unauthorized();
  }

  const creds = decodeCredentials(auth.slice(6));
  if (!creds || creds.user !== user || creds.pass !== pass) {
    return unauthorized();
  }

  return NextResponse.next();
}
