// app/api/cms/oauth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new NextResponse('GITHUB_CLIENT_ID/SECRET not set', { status: 500 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code') || '';
  const state = url.searchParams.get('state') || '';

  // Exchange code for token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });

  if (!tokenRes.ok) {
    const txt = await tokenRes.text();
    return new NextResponse(`OAuth exchange failed: ${txt}`, { status: 500 });
  }

  const { access_token } = await tokenRes.json();

  // Return a tiny HTML page that 'postMessage's the token back to Decap.
  // Decap expects the message: "authorization:github:success:{...}"
  // See examples of this message format in community OAuth proxies.
  // (We interpolate state back if Decap needs it.)
  const html = `<!doctype html><html><body>
<script>
  (function() {
    try {
      var content = { token: ${JSON.stringify(access_token)}, provider: 'github', state: ${JSON.stringify(state)} };
      // Decap listens for this:
      // "authorization:github:success:{...}"
      window.opener.postMessage('authorization:github:success:' + JSON.stringify(content), '*');
      window.close();
    } catch (e) {
      document.body.textContent = 'OAuth complete, but could not notify opener: ' + (e && e.message || e);
    }
  })();
</script></body></html>`;

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
