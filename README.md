[![CI](https://github.com/jp-dunlap/Palestine/actions/workflows/ci.yml/badge.svg)](https://github.com/jp-dunlap/Palestine/actions/workflows/ci.yml)

# Palestine

A public, art-grade digital history of Palestine spanning 4,000 years. Primary sources, timelines, maps, and testimony centered on Palestinian life and anti-colonial memory.

## Stack
Next.js (App Router) · TypeScript · Tailwind · MDX · MapLibre/Leaflet · D3 · Lunr/mini-search

## Goals
- Build a rigorous, accessible, living history that centers Palestinian voices.
- Pair long-form essays with an interactive timeline, maps, and a searchable archive.
- Ship fast, static-first pages with progressive enhancement.

## Run locally

```bash
# with npm
npm install
npm run dev

# or with bun
bun install
bun dev
```

## Testing

```bash
npm run test:unit   # vitest
npm run test:e2e    # playwright
```

- E2E requires Playwright browsers. Locally:
  ```bash
  npm run test:e2e
  ```
  If behind a restricted network, either preinstall browsers once with:
  ```bash
  npx playwright install --with-deps
  ```

## Private CMS (Decap) — Setup & Troubleshooting

We ship a private Decap CMS instance at `/admin` with manual JSON config loading and GitHub-backed authentication. The CMS never requests `config.yml`; all configuration comes from `/api/cms/config`.

### Required Vercel Project environment variables

Set these keys at the **project** level (not the account level) in Vercel:

- `CMS_MODE` — `oauth` (GitHub OAuth, default) or `token` (fallback with PAT)
- `BASIC_AUTH_USER` **and** `BASIC_AUTH_PASS` *(or `BASIC_AUTH_USERS` / `BASIC_AUTH_PASSWORD`)*
- `CMS_GITHUB_REPO` (e.g., `jp-dunlap/Palestine`)
- `CMS_GITHUB_BRANCH` (e.g., `main`)
- `NEXT_PUBLIC_SITE_URL` (e.g., `https://palestine-two.vercel.app`)
- OAuth mode: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- Token mode: `CMS_GITHUB_TOKEN` (GitHub PAT with minimal `repo` scope)

Missing credentials will surface as HTTP 500 responses from either the middleware or `/api/cms/config`.

### GitHub OAuth App setup

1. Create a GitHub OAuth App under the `jp-dunlap` org or your personal account.
2. Authorization callback URL: `https://palestine-two.vercel.app/api/cms/oauth/callback`
3. Set the homepage URL to the public site (e.g., `https://palestine-two.vercel.app`).
4. Copy the **Client ID** and **Client Secret** into the Vercel env vars listed above.

During local development you can run `npm run dev` with a `.env.local` file that sets the same variables (adjust the callback URL to match your localhost origin).

### Smoke tests

After deploying, validate the private CMS with:

```bash
# /admin unauthenticated
curl -sI https://palestine-two.vercel.app/admin | sed -n '1,14p'

# /admin with Basic Auth
curl -sI -u "<user>:<pass>" https://palestine-two.vercel.app/admin | sed -n '1,14p'

# Config endpoint (should show the OAuth backend in production)
curl -s -u "<user>:<pass>" https://palestine-two.vercel.app/api/cms/config | jq '.backend'

# OAuth authorize (302 to GitHub)
curl -sI -u "<user>:<pass>" https://palestine-two.vercel.app/api/cms/oauth/authorize | sed -n '1,20p'

# Debug flags (no secrets)
curl -s -u "<user>:<pass>" https://palestine-two.vercel.app/api/cms/debug-env
```

### Token mode fallback

If GitHub OAuth becomes unavailable, set `CMS_MODE=token` and provide `CMS_GITHUB_TOKEN`. The `/api/cms/config` response will embed the token directly for Decap. Remember to rotate the PAT regularly and revert to `CMS_MODE=oauth` once OAuth is back online.

The search index is rebuilt automatically during `npm run build` via `scripts/build-search.js`.

## i18n routing

Use `buildLanguageToggleHref` from `lib/i18nRoutes.ts` to derive language switcher links. The helper accepts the
current pathname, query parameters, and the target locale, returning a safe, leading-slash URL that preserves
existing query parameters.

```ts
import { buildLanguageToggleHref } from '@/lib/i18nRoutes';

const arabicHref = buildLanguageToggleHref('/map', { place: 'haifa' }, 'ar');
// => '/ar/map?place=haifa'
```

## Maps

Routes
- `/map` — English
- `/ar/map` — Arabic (RTL)

Features
- Marker clustering, deep links (`?place=<id>`), click any list item to focus the map, “Reset view”, “Copy link”.
