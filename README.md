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

The private editor lives at `/admin`. Decap CMS loads a JSON config from `/api/cms/config`, requires HTTP Basic Auth, and authenticates to GitHub either through OAuth (preferred) or a personal access token fallback. Editorial guidance still lives in [CMS.md](CMS.md); the steps below cover infrastructure.

### Required Vercel Project environment variables

Configure these keys at the project level (`Settings → Environment Variables`). Use the same value for Production and Preview unless a note says otherwise.

- `CMS_MODE` — `oauth` (default) or `token` for the fallback PAT flow.
- `BASIC_AUTH_USER` **or** `BASIC_AUTH_USERS` — username for Basic Auth.
- `BASIC_AUTH_PASS` **or** `BASIC_AUTH_PASSWORD` — password for Basic Auth.
- `CMS_GITHUB_REPO` — target repository (`jp-dunlap/Palestine`).
- `CMS_GITHUB_BRANCH` — branch to edit (`main` unless you need a different default).
- `NEXT_PUBLIC_SITE_URL` — canonical site URL, e.g. `https://palestine-two.vercel.app`.
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` — required when `CMS_MODE=oauth`.
- `CMS_GITHUB_TOKEN` — required when `CMS_MODE=token`; use a PAT with minimal `repo` scope.

### Create the GitHub OAuth App

1. Visit **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Set **Homepage URL** to `NEXT_PUBLIC_SITE_URL`.
3. Set **Authorization callback URL** to `NEXT_PUBLIC_SITE_URL/api/cms/oauth/callback`.
4. After creation, copy the **Client ID** and **Client Secret** into the Vercel environment variables listed above.

### Switching modes & local development

- Production should run `CMS_MODE=oauth` so editors authenticate with GitHub via the popup.
- To force the PAT fallback locally, create `.env.local` with:
  ```env
  CMS_MODE=token
  CMS_GITHUB_TOKEN=<pat-with-repo-scope>
  BASIC_AUTH_USER=local
  BASIC_AUTH_PASS=local
  ```
  GitHub only issues tokens over HTTPS, so the OAuth flow typically runs against deployed environments. The token mode keeps local work viable without exposing secrets.

### Smoke tests

After configuring credentials, confirm the deployment with curl (replace the username/password with your Basic Auth values and adjust the base URL if necessary):

```bash
# /admin requires Basic Auth
curl -sI https://palestine-two.vercel.app/admin | sed -n '1,14p'

# /admin with Basic Auth succeeds
curl -sI -u "<user>:<pass>" https://palestine-two.vercel.app/admin | sed -n '1,14p'

# Config describes the GitHub backend without leaking secrets
curl -s -u "<user>:<pass>" https://palestine-two.vercel.app/api/cms/config | jq '.backend'

# OAuth authorize endpoint redirects to GitHub
curl -sI -u "<user>:<pass>" https://palestine-two.vercel.app/api/cms/oauth/authorize | sed -n '1,20p'

# Debug endpoint only reports boolean flags
curl -s -u "<user>:<pass>" https://palestine-two.vercel.app/api/cms/debug-env
```

The Network tab inside `/admin` should show only the Decap bundle and a single `GET /api/cms/config`. After the GitHub popup closes, the editor reloads and displays the collections without the “Login with GitHub” button.

### Debugging

- `/api/cms/debug-env` (behind Basic Auth) returns boolean flags to confirm that credentials are present without exposing the values.
- A `500 CMS authentication is not configured` response indicates missing `CMS_MODE` or Basic Auth variables.

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
