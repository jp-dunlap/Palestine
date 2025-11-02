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
  or skip e2e and run unit tests:
  ```bash
  npm run test:unit
  ```
- In CI, set repository variable `E2E_ENABLED=true` to run e2e. When false, CI will still pass with unit tests + build.

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
