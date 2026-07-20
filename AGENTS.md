<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Project: Harshz Green Building Automation

**Always read `.claude/PROGRESS.md` at the start of a session.** It is the source of truth for what's been built, what decisions were made, and what's still pending. Run `/project-status` to get a formatted briefing.

## Scope

| | |
|---|---|
| **GitHub** | `harshlangeh/harshz` — this repo, the only one to touch |
| **Vercel** | project `harshz` (`www.harshz.com`) — ignore `harshz_v4`, `harshz_v5`, `harshz-version3` |
| **Supabase** | project `Harshz` (ref `imrgjnvvylrdjzsxthzg`, `ap-south-1`) |

## Stack

Next.js 16.2 · React 19 · TypeScript · lucide-react · date-fns · App Router · no API routes · `localStorage` for all state (Supabase not yet wired in the frontend).

## Key conventions

- Multi-project system: `/` is the Projects list; every rating page and dashboard lives under `/project/[projectId]/...` (e.g. `/project/[projectId]/griha-v6`). `src/lib/projects.ts` holds the `Project` CRUD (global `projects` key) and `scopedKey(projectId, key)`, which every per-project piece of state must be wrapped in before touching `localStorage`.
- All rating pages (`griha-v6`, `griha-v2019`, `griha-v2015`, `igbc-sb-2020`, under `/project/[projectId]/`) are `"use client"` with inline `sections` arrays — no separate data files.
- State keys (all wrapped in `scopedKey(projectId, ...)` except the two globals): `stats_v6`, `stats_v2019`, `stats_v2015`, `stats_igbc`, `scores_v6`, `scores_v2019`, `scores_v2015`, `scores_igbc`, `project_info`, `project_typology`, `appraisals_v6`. Globals (not project-scoped): `projects`, `app-theme`, `global-icon-override`.
- Theme is 3-mode: light / dark / high-contrast — managed by `ThemeProvider.tsx`.
- Glass morphism design tokens live in `globals.css`.
- Root-level `.js` scripts (`make-igbc.js`, `add-stars.js`, etc.) are one-off codegen tools — do not run them unless explicitly asked.

## Git rules

- Develop on `claude/*` branch, open a PR, never push directly to `main`.
- After every session, update `.claude/PROGRESS.md` with what was done.
