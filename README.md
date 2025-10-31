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
bun i
bun dev

## Maps

Routes
- `/maps` — English
- `/ar/maps` — Arabic (RTL)

Features
- Marker clustering, deep links (`?place=<id>`), click any list item to focus the map, “Reset view”, “Copy link”.

Run locally
```bash
# with npm
npm i
npm run dev

# or with bun (already in README)
bun i
bun dev

