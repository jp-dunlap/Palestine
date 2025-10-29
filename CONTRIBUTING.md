# Contributing to **Palestine**

A public, art-grade digital history centered on Palestinian life, law, memory, and return.

## Ground rules
- **Content license:** CC BY-SA 4.0 (`LICENSE-CONTENT`).  
- **Code license:** MIT (`LICENSE`).  
- **No surveillance/telemetry** or closed SaaS embeds. Prefer FOSS.
- Follow the project’s norms in `AGENTS.md` and writing standards in `CONTENT_GUIDE.md`.

---

## How to add content

### 1) Chapter (MDX)
- Create: `content/chapters/NNN-title.mdx` (e.g., `002-early-iron-age.mdx`)
- Include frontmatter per `CONTENT_GUIDE.md`:
  - `title`, `slug`, `era`, `authors`, `language`, `summary`, `tags`, `date`, `sources`, optional `places`
- Body: clear prose with in-text citations. Images must have **alt text**; audio/video need **transcripts**.
- Keep tone rigorous, accessible, and anti-colonial.

### 2) Timeline event (YAML)
- Create: `content/timeline/NNNN-key.yml`
- Fields: `id`, `title`, `start`, `end|null`, `places[]`, `sources[]`, `summary`, `tags[]`, `certainty`
- BCE years are **negative** (e.g., `-1200`).

### 3) Sources (CSL-JSON)
- Add new entries to `data/bibliography.json`.
- Use stable `id`s (e.g., `sayigh1997`).
- Prefer primary sources, ICJ/UN docs, respected Palestinian historians. Include `issued` dates and `URL` when relevant.

### 4) Places (Gazetteer)
- Add to `data/gazetteer.json`: `id`, `name`, `alt_names[]` (include Arabic), `lat`, `lon`, `kind`.
- Use the **gazetteer names/ids** in chapters/timeline `places[]`.

---

## Style & accessibility
- Plain, precise language; active voice.  
- Respect RTL and multilingual needs; avoid jargon unless necessary.  
- **A11y:** semantic headings, captions, alt text; avoid low-contrast images.

---

## Git & PRs
- Small, focused changes.  
- Reference sources for factual edits.  
- Keep filenames kebab-case; don’t rename existing IDs without discussion.

**PR checklist**
- [ ] Files in the right directories
- [ ] Frontmatter/schemas match `CONTENT_GUIDE.md`
- [ ] New sources added to `data/bibliography.json`
- [ ] New places added to `data/gazetteer.json` (if applicable)
