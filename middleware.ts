import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const REALM = 'Palestine CMS';

function unauthorized() {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}"`,
    },
  });
}

export function middleware(request: NextRequest) {
  const username = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASS;

  if (!username || !password) {
    return new NextResponse('CMS authentication is not configured', { status: 500 });
  }

  const header = request.headers.get('authorization');
  if (!header) {
    return unauthorized();
  }

  const [scheme, value] = header.split(' ');
  if (scheme !== 'Basic' || !value) {
    return unauthorized();
  }

  let decoded: string;
  try {
    decoded = Buffer.from(value, 'base64').toString('utf8');
  } catch {
    return unauthorized();
  }

  const separatorIndex = decoded.indexOf(':');
  if (separatorIndex === -1) {
    return unauthorized();
  }

  const receivedUser = decoded.slice(0, separatorIndex);
  const receivedPass = decoded.slice(separatorIndex + 1);

  if (receivedUser !== username || receivedPass !== password) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/cms/:path*'],
};
