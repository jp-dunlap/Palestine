export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const STATE_COOKIE = 'palestine_cms_oauth_state';
const USER_AGENT = 'Palestine-CMS/1.0';

function ensureOAuthMode() {
  const mode = (process.env.CMS_MODE ?? 'token').toLowerCase();
  if (mode !== 'oauth') {
    throw new Error('OAuth mode is disabled. Set CMS_MODE=oauth to enable this endpoint.');
  }
}

function requireSecrets() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set.');
  }
  return { clientId, clientSecret };
}

function parseAllowedUsers() {
  const raw = process.env.CMS_ALLOWED_USERS;
  if (!raw) return [];
  return raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function renderResult(message: string) {
  return `<!DOCTYPE html><html><body><script>(function(){var payload=${JSON.stringify(
    message,
  )};if(window.opener){window.opener.postMessage(payload,'*');}window.close();})();</script></body></html>`;
}

async function fetchGitHubToken(code: string, redirectUri: string) {
  const { clientId, clientSecret } = requireSecrets();

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
    },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }),
  });

  if (!response.ok) {
    throw new Error(`GitHub token exchange failed with status ${response.status}`);
  }

  const data = (await response.json()) as { access_token?: string; error?: string; error_description?: string };
  if (!data.access_token) {
    const description = data.error_description || data.error || 'Unknown OAuth error';
    throw new Error(description);
  }

  return data.access_token;
}

async function fetchGitHubEmail(token: string) {
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });

  if (!userResponse.ok) {
    throw new Error(`Unable to fetch GitHub user profile (status ${userResponse.status})`);
  }

  const user = (await userResponse.json()) as { email?: string | null };
  if (user.email) {
    return user.email.toLowerCase();
  }

  const emailsResponse = await fetch('https://api.github.com/user/emails', {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });

  if (!emailsResponse.ok) {
    throw new Error(`Unable to fetch GitHub user emails (status ${emailsResponse.status})`);
  }

  const emails = (await emailsResponse.json()) as Array<{ email: string; primary?: boolean }>;
  const primary = emails.find((entry) => entry.primary);
  const first = (primary ?? emails[0])?.email;
  if (!first) {
    throw new Error('No GitHub email address found for this user.');
  }

  return first.toLowerCase();
}

export async function GET(request: NextRequest) {
  try {
    ensureOAuthMode();
    const params = request.nextUrl.searchParams;
    const code = params.get('code');
    const state = params.get('state');

    if (!code || !state) {
      throw new Error('Missing OAuth code or state.');
    }

    const storedState = request.cookies.get(STATE_COOKIE)?.value;
    if (!storedState || storedState !== state) {
      throw new Error('OAuth state verification failed. Please retry.');
    }

    const redirectUri = new URL('/api/cms/oauth/callback', request.nextUrl.origin).toString();
    const token = await fetchGitHubToken(code, redirectUri);

    const allowed = parseAllowedUsers();
    if (allowed.length > 0) {
      const email = await fetchGitHubEmail(token);
      if (!allowed.includes(email)) {
        throw new Error('This account is not permitted to publish edits.');
      }
    }

    const payload = `authorization:github:success:${JSON.stringify({ token })}`;
    const html = renderResult(payload);
    const response = new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
    response.cookies.set({ name: STATE_COOKIE, value: '', path: '/api/cms/oauth', maxAge: 0 });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OAuth callback failed';
    const payload = `authorization:github:failure:${JSON.stringify({ message })}`;
    const html = renderResult(payload);
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' }, status: 400 });
  }
}
