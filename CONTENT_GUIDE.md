# CONTENT_GUIDE.md

A shared standard for writing and data in **Palestine**. Keep it lean, rigorous, and accessible.

---

## 1) Directories (content-only)
- `content/chapters/*.mdx` — essays/chapters (MDX with frontmatter)
- `content/timeline/*.yml` — historical events/eras (YAML)
- `data/bibliography.json` — CSL-JSON citations (sources referenced by `id`)
- `data/gazetteer.json` — places (coords, alt names, kind)
- `public/images/...` — small, optimized media (large masters live elsewhere)

---

## 2) Chapters (MDX) — frontmatter schema

Required:
```yaml
title: string
slug: kebab-case-short
era: string                # e.g. "Foundations", "Ottoman", "Mandate", "Nakba", etc.
authors: [string]          # ["Joshua Dunlap", ...]
language: en|ar            # primary language of the file
summary: string            # ≤ 240 chars
tags: [string]             # lowercase topic tags
date: YYYY-MM-DD           # publication date
sources:                   # cite by CSL-JSON id or URL
  - id: some-source-id
  - url: https://example.org/primary-source
places: [string]           # OPTIONAL: must match gazetteer names/ids
