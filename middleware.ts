import { NextRequest, NextResponse } from 'next/server';

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

function missingAuthConfig(message: string) {
  return new Response(message, { status: 500 });
}

export function middleware(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return NextResponse.next();
  }

  const user =
    process.env.BASIC_AUTH_USER ??
    process.env.BASIC_AUTH_USERS ??
    '';
  const pass =
    process.env.BASIC_AUTH_PASS ??
    process.env.BASIC_AUTH_PASSWORD ??
    '';
  const mode = process.env.CMS_MODE ?? '';

  if (!user || !pass) {
    return missingAuthConfig('CMS basic auth is not configured');
  }

  if (!mode) {
    return missingAuthConfig('CMS authentication mode is not configured');
  }

  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Basic ')) {
    return unauthorized();
  }

  try {
    const decoded = atob(auth.slice(6));
    const separatorIndex = decoded.indexOf(':');
    if (separatorIndex < 0) {
      return unauthorized();
    }
    const name = decoded.slice(0, separatorIndex);
    const pwd = decoded.slice(separatorIndex + 1);
    if (name !== user || pwd !== pass) {
      return unauthorized();
    }
  } catch {
    return unauthorized();
  }

  return NextResponse.next();
}
