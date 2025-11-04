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

## Private admin interface

The Decap CMS integration has been replaced with a custom admin SPA at `/admin`. The admin surface speaks directly to the GitHub API using server-side helpers and offers two auth modes:

- **OAuth mode** – editors sign in with GitHub via the bundled OAuth flow. Requests use the editor's GitHub token and respect allowlists for email or login.
- **Token mode** – the server authenticates with a repository PAT supplied via `CMS_GITHUB_TOKEN`. Optional HTTP basic auth can gate `/admin` in this mode.

### Environment variables

Create an `.env.local` (for local dev) or configure the variables on Vercel:

| Key | Notes |
| --- | --- |
| `CMS_AUTH_MODE` | `oauth` (default) or `token` |
| `CMS_GITHUB_REPO` | `owner/name` of the content repo |
| `CMS_GITHUB_BRANCH` | Default branch, usually `main` |
| `ALLOWED_EMAILS` | Comma separated allowlist (optional) |
| `ALLOWED_GITHUB_LOGINS` | Comma separated allowlist (optional) |
| `BASIC_AUTH_USER` / `BASIC_AUTH_PASS` | Optional basic auth for token mode |
| `NEXTAUTH_SECRET` | 16+ character secret for signing session cookies |

**OAuth mode** additionally requires:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `NEXTAUTH_URL` (base URL, e.g. `https://palestine-two.vercel.app`)

**Token mode** additionally requires:

- `CMS_GITHUB_TOKEN` – GitHub PAT with `repo` scope for the content repository

### GitHub OAuth setup

1. Register a GitHub OAuth application.
2. Set the callback URL to `<origin>/api/auth/callback/github`.
3. Provide the Client ID and Client Secret via environment variables.
4. Add editors to `ALLOWED_EMAILS` or `ALLOWED_GITHUB_LOGINS`.

The admin UI exposes sign-in/sign-out controls, draft/publish toggles, and PR links for draft saves. Draft saves create branches named `cms/<slug>` and open or update pull requests. Publish saves commit directly to the main branch and return the commit SHA plus a raw file URL.

### Image uploads

Editors can upload images via the admin. Files are committed to `public/images/uploads/` using the same workflow as other entries and return a CDN-safe URL (e.g. `/images/uploads/<timestamp>-<filename>`).

### Adding a new collection

Collections are defined in `lib/collections.ts` with a zod schema, file format, default workflow, and directory. To add a new collection:

1. Append a new entry to the `collections` array with the correct directory and schema.
2. Export any additional TypeScript helpers as needed.
3. Ensure the GitHub repo contains the directory structure described in the collection config.
4. Optionally update tests and add fixtures for the new content type.

Once deployed the admin UI will automatically surface the new collection in the switcher.

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
