export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  const cmsMode = process.env.CMS_MODE ?? null;
  const body = {
    CMS_MODE: cmsMode,
    has_GITHUB_CLIENT_ID: Boolean(process.env.GITHUB_CLIENT_ID),
    has_GITHUB_CLIENT_SECRET: Boolean(process.env.GITHUB_CLIENT_SECRET),
    has_CMS_GITHUB_TOKEN: Boolean(process.env.CMS_GITHUB_TOKEN),
    has_BASIC_AUTH_USER:
      Boolean(process.env.BASIC_AUTH_USER ?? process.env.BASIC_AUTH_USERS),
    has_BASIC_AUTH_PASS:
      Boolean(process.env.BASIC_AUTH_PASS ?? process.env.BASIC_AUTH_PASSWORD),
  };

  return NextResponse.json(body, {
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
  });
}
