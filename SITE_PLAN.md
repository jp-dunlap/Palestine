# SITE_PLAN.md

Minimal plan for the public site. No framework code yet—this document guides the first scaffold.

## 1) Routes (planned)
- `/` — Landing: project intro, featured chapter, featured timeline window
- `/timeline` — Zoomable 4,000-year timeline (reads `content/timeline/*.yml`, `data/eras.yml`)
- `/map` — Base map with place layers (reads `data/gazetteer.json`)
- `/chapters/[slug]` — Chapter detail (reads `content/chapters/*.mdx`, cites `data/bibliography.json`)
- `/about` — Method, licensing, contributor guide links

## 2) Data contracts (files already exist)
- Chapters (MDX frontmatter): see `CONTENT_GUIDE.md`
- Timeline (YAML): see `CONTENT_GUIDE.md`
- Bibliography: `data/bibliography.json` (CSL-JSON)
- Gazetteer: `data/gazetteer.json`
- Eras: `data/eras.yml`

## 3) Components (planned, no code yet)
- `components/Timeline.tsx` — virtualized lanes (eras), event bars/points, year scale
- `components/Map.tsx` — MapLibre base, markers from gazetteer, RTL-aware labels
- `components/ChapterMeta.tsx` — title, authors, places, inline citations
- `components/Search.tsx` — client-side search (lunr/minisearch later)

## 4) Styling & a11y
- Tailwind utility classes, readable type scale, high contrast
- Arabic support + RTL styles on `/ar/*` (future)
- All images require `alt`, media requires transcripts

## 5) Build approach (later)
- Next.js (App Router) + TypeScript
- Static-first pages; incremental content without server dependencies initially
