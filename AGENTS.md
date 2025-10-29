# AGENTS.md

## 📌 Project Context
This repository is maintained by Joshua Dunlap, a revolutionary leftist organizer and developer building digital infrastructure for pro-Palestinian, anti-colonial movement work. The codebase should reflect political discipline, free and open-source ethics, and technical clarity.

## ⚙️ Stack & Tools
- **Frontend:** React (functional components), TypeScript (`.tsx`), TailwindCSS, shadcn/ui
- **Backend:** Node.js (preferably via Bun), Express, PostgreSQL (SQL dialect: Postgres)
- **Deployment:** Dockerized services with preference for self-hosted or privacy-conscious environments
- **Testing:** Vitest, Playwright
- **Build/Runtime:** Prefer Bun over Node when available
- **Package Manager:** Bun (fallback to pnpm)

## 💡 Coding Standards
- Use modern ES6+ syntax
- Use 2-space indentation across all languages
- Always include required imports in generated code
- Avoid inline CSS unless explicitly requested
- Use semantic HTML for accessibility
- Use Postgres-flavored SQL, not generic ANSI

## 🚫 Do Not Use
- Google Analytics, Sentry, or other proprietary surveillance tech
- Firebase or AWS Amplify
- Closed-source components unless explicitly justified and replaceable

## ✅ Always Prefer
- FOSS libraries and tools
- Minimalist, composable components over monoliths
- Declarative logic over imperative sprawl
- Stateless functions unless persistence is clearly required

## 🧠 Task Handling
When implementing a feature or fixing a bug:
1. Create a new branch unless otherwise specified
2. Include descriptive commit messages with political or functional context
3. Prioritize clarity and reproducibility over brevity
4. Explain reasoning in comments *only when non-obvious* (this is not a teaching repo)

## 🧱 Directory Conventions
- `/components` – Reusable React components (functional only)
- `/pages` – Route-specific UI logic
- `/lib` – Business logic, helpers, or API clients
- `/utils` – Stateless utility functions
- `/styles` – Tailwind config + global styles
- `/tests` – E2E and unit tests

## 🧪 Testing Notes
- Prefer test-driven stubs for new modules
- Use `describe` and `it` blocks with descriptive language (no placeholder names)
- Ensure all tests are deterministic and free of network calls

## 🔐 Political/Movement Discipline
- Avoid integrating third-party tools that log user data unless reviewed for compliance with anti-colonial principles
- If generating copy or UX text, use decolonial language—center clarity and dignity, not persuasion or marketing tone
- When naming variables or systems, avoid military metaphors or surveillance-coded language

## 📎 Final Note
This repo is part of an organizing infrastructure that rejects surveillance capitalism, colonial ideology, and developer culture that rewards speed over strategy. Build with integrity.
