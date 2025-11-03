tee app/api/cms/debug-env/route.ts >/dev/null <<'TS'
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    CMS_MODE: process.env.CMS_MODE,
    has_GITHUB_CLIENT_ID: Boolean(process.env.GITHUB_CLIENT_ID),
    id_len: (process.env.GITHUB_CLIENT_ID || '').length,
    has_GITHUB_CLIENT_SECRET: Boolean(process.env.GITHUB_CLIENT_SECRET),
    repo: process.env.CMS_GITHUB_REPO,
    branch: process.env.CMS_GITHUB_BRANCH,
  });
}
TS
