import { NextResponse, type NextRequest } from 'next/server';

import { requireBasicAuth } from '@/lib/auth';

const REALM = 'Palestine CMS';

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/cms/:path*'],
};

function hasValidBasicAuth(req: NextRequest): boolean {
  const result = requireBasicAuth(req);
  return result.status !== 401;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isCmsApiRoute = pathname.startsWith('/api/cms');

  if (!isAdminRoute && !isCmsApiRoute) {
    return NextResponse.next();
  }

  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;
  if (!user || !pass) {
    return NextResponse.next();
  }

  if (hasValidBasicAuth(req)) {
    return NextResponse.next();
  }

  if (isAdminRoute) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}"` },
  });
}
