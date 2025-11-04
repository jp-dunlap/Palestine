import { NextResponse, NextRequest } from 'next/server';

const REALM = 'Palestine CMS';

// Guard all private CMS surfaces (admin UI, OAuth endpoints, config API, YAML fallbacks)
export const config = {
  matcher: ['/admin/:path*', '/api/cms/:path*', '/config.yml'],
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

  if (!user || !pass) {
    return new Response('CMS basic auth is not configured', { status: 500 });
  }

  if (req.method === 'OPTIONS') {
    return NextResponse.next();
  }

  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Basic ')) {
    return unauthorized();
  }

  try {
    const [name, pwd] = atob(auth.slice(6)).split(':');
    if (name !== user || pwd !== pass) return unauthorized();
  } catch {
    return unauthorized();
  }

  return NextResponse.next();
}
