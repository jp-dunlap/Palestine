export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  const modeValue = (process.env.CMS_MODE ?? '').toLowerCase();
  const mode = modeValue === 'oauth' || modeValue === 'token' ? modeValue : null;

  return NextResponse.json(
    {
      CMS_MODE: mode,
      has_GITHUB_CLIENT_ID: Boolean(process.env.GITHUB_CLIENT_ID),
      has_GITHUB_CLIENT_SECRET: Boolean(process.env.GITHUB_CLIENT_SECRET),
      has_PAT: Boolean(process.env.CMS_GITHUB_TOKEN),
      has_basic_auth_user:
        Boolean(process.env.BASIC_AUTH_USER) || Boolean(process.env.BASIC_AUTH_USERS),
      has_basic_auth_password:
        Boolean(process.env.BASIC_AUTH_PASS) || Boolean(process.env.BASIC_AUTH_PASSWORD),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
