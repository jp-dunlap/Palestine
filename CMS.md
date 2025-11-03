# Private CMS Operations

The Palestine site now includes a private, Git-backed CMS powered by Netlify CMS. This interface exists to make carefully-audited content changes without exposing an external surface to the public internet. Treat it like any other part of the organizing infrastructure: verify authentication, double check diffs, and keep Arabic/English parity tight.

## Accessing `/admin`

- The admin client lives at [`/admin`](./public/admin/index.html) and is not linked anywhere in the public UI.
- Requests to `/admin` and `/api/cms/*` are gated behind HTTP Basic Auth. Credentials are injected through environment variables (`BASIC_AUTH_USER`, `BASIC_AUTH_PASS`). Browsers cache the credentials for the current origin once entered.
- `robots.txt` explicitly disallows crawling `/admin` and `/api/cms`, reducing automated discovery.
- Netlify CMS is manually initialised in the browser after fetching a protected config payload from `/api/cms/config`.

## Environment variables

Copy `.env.example` to `.env.local` (or your deployment secret store) and set:

| Variable | Description |
| --- | --- |
| `BASIC_AUTH_USER` / `BASIC_AUTH_PASS` | Required for every request to `/admin` and `/api/cms/*`. |
| `CMS_MODE` | `token` (single-user) or `oauth` (multi-user). |
| `CMS_GITHUB_TOKEN` | Fine-grained GitHub token with repo contents scope (used when `CMS_MODE=token`). |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | OAuth app credentials (only when `CMS_MODE=oauth`). |
| `CMS_ALLOWED_USERS` | Comma-separated list of email addresses authorised to log in via OAuth. Leave blank to allow anyone with Basic Auth + GitHub access. |
| `CMS_GITHUB_REPO` (optional) | Override the GitHub repo slug if deploying to a fork. |
| `CMS_GITHUB_BRANCH` (optional) | Override the branch used for commits. |

### Token mode

`CMS_MODE=token` injects the fine-grained token server-side. The token never leaves the protected API unless the requester has already passed Basic Auth. Use this for quick, single-user edits.

### OAuth mode

`CMS_MODE=oauth` enables a GitHub OAuth dance under `/api/cms/oauth/*`. The middleware still enforces Basic Auth so only trusted organisers can kick off the flow. The callback validates state, exchanges the code for a token, and (optionally) checks the resulting GitHub email against `CMS_ALLOWED_USERS`.

GitHub scopes: the CMS requests `repo` to read/write content. Keep the OAuth app restricted to this project.

## Collections & editing model

The CMS exposes:

- **Chapters (English)** and **Chapters (Arabic)** from `content/chapters`. New files are created with `.mdx` extensions, matching the existing bilingual pairing. Language is enforced through hidden frontmatter fields; always keep Arabic translations aligned with the corresponding English slug.
- **Timeline — Content** (`content/timeline/*.yml`) for narrative milestones and **Timeline — Data** (`data/timeline/*.yml`) for shared or Arabic-enhanced events.
- **Bibliography** (`data/bibliography.json`) and **Gazetteer** (`data/gazetteer.json`). Each entry is edited as structured JSON; the CMS ensures the files remain valid arrays.
- **Media uploads** land in `public/images/uploads`. Move large media via git manually to avoid bloating the repo.

Every save triggers Netlify CMS to commit directly to the configured branch using GitHub APIs. Review diffs before merging downstream.

## Search index regeneration

`scripts/build-search.js` rebuilds `public/search.en.json` and `public/search.ar.json`.

- The script runs automatically before and after `npm run build`.
- A GitHub Action (`Rebuild search index`) reruns the script on pushes touching `content/**`, `data/**`, or the script itself. If the generated JSON files change, the workflow commits them back to `main`.
- Unit tests assert that chapter summaries remain synchronised with the search index; if you edit content locally, rerun `node scripts/build-search.js` before committing.

## Local development notes

- When running `npm run dev`, set at minimum `BASIC_AUTH_USER`, `BASIC_AUTH_PASS`, `CMS_MODE`, and either `CMS_GITHUB_TOKEN` or the OAuth credentials.
- Playwright E2E tests supply dummy credentials automatically. For manual testing, export the same values so the middleware allows you through.
- Netlify CMS is fetched from the unpkg CDN. When developing offline, expect the admin shell to display a warning until connectivity returns.

## Incident response

- If credentials leak, rotate both the Basic Auth password and the GitHub token/OAuth secret immediately, then invalidate outstanding sessions.
- All CMS activity lands in Git history; use standard git revert workflows to roll back.
- Treat the Basic Auth realm (`Palestine CMS`) as a signal—unexpected prompts indicate a potential probe. Monitor server logs accordingly.
