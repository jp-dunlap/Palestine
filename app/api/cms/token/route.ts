export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';

type CMSMode = 'oauth' | 'token';

function getMode(): CMSMode {
  const value = (process.env.CMS_MODE ?? '').toLowerCase();
  if (value === 'oauth' || value === 'token') {
    return value;
  }
  throw new Error('CMS_MODE must be set to "oauth" or "token"');
}

function assertTokenAvailable() {
  const token = process.env.CMS_GITHUB_TOKEN;
  if (!token) {
    throw new Error('CMS_GITHUB_TOKEN is required when CMS_MODE=token');
  }
  return token;
}

export async function GET() {
  try {
    const mode = getMode();
    if (mode !== 'token') {
      return NextResponse.json(
        { error: 'CMS token mode is not enabled' },
        {
          status: 400,
          headers: { 'Cache-Control': 'no-store' },
        },
      );
    }

    const token = assertTokenAvailable();
    return NextResponse.json(
      { token },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected CMS token error';
    return new NextResponse(message, {
      status: 500,
      headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain' },
    });
  }
}
