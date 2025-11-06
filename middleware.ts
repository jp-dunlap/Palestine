import { NextResponse, type NextRequest } from 'next/server';

import { requireBasicAuth } from '@/lib/auth';

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/cms/:path*', '/api/admin/:path*'],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  const isCmsApiRoute = pathname.startsWith('/api/cms');
  const isAdminApiRoute = pathname.startsWith('/api/admin');

  if (!isAdminPage && !isCmsApiRoute && !isAdminApiRoute) {
    return NextResponse.next();
  }

  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;
  if (!user || !pass) {
    return NextResponse.next();
  }

  const authResult = requireBasicAuth(req);
  if ('status' in authResult && authResult.status === 401) {
    if (isAdminPage) {
      return new NextResponse('Not Found', { status: 404 });
    }

    return authResult;
  }

  return NextResponse.next();
}
