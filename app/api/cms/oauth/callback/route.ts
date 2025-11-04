export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code') || '';
  const state = url.searchParams.get('state') || '';
  const stored = cookies().get('cms_oauth_state')?.value || '';

  if (!code || !state || !stored || state !== stored) {
    return new Response('Invalid OAuth state', { status: 400 });
  }

  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;
  if (!client_id || !client_secret) {
    return new Response('GITHUB_CLIENT_ID/SECRET missing', { status: 500 });
  }

  const redirect_uri = `${url.origin}/api/cms/oauth/callback`;

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: new URLSearchParams({ client_id, client_secret, code, redirect_uri }),
  });

  if (!tokenRes.ok) {
    const txt = await tokenRes.text();
    return new Response(`OAuth exchange failed: ${txt}`, { status: 502 });
  }

  const data = await tokenRes.json();
  const token = data?.access_token;
  if (!token) return new Response('No access_token returned', { status: 502 });

  // Post back the full shape Decap recognizes
  const html = `<!doctype html><html><body><script>
(function(){
  var payload = { token: ${JSON.stringify(token)}, provider: 'github', backendName: 'github', useOpenAuthoring: false };
  try { if (window.opener) window.opener.postMessage(payload, '*'); }
  finally { window.close(); }
})();
</script></body></html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
