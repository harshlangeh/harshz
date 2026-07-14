# Harshz — Project Progress Log

> Update this file after every work session. One entry per session, newest first.

---

## Project Identity

| | |
|---|---|
| **App** | Harshz Green Building Automation |
| **GitHub** | `harshlangeh/harshz` |
| **Vercel** | `harshz` → `www.harshz.com` / `harshz-seven.vercel.app` |
| **Supabase** | `Harshz` (ref: `imrgjnvvylrdjzsxthzg`, region: `ap-south-1`) |
| **Stack** | Next.js 16.2, React 19, TypeScript, lucide-react, date-fns |
| **Persistence** | `localStorage` (no DB writes yet — Supabase connected but not yet wired) |

---

## What the App Does

A web tool for green building certification consultants to track compliance and points across four Indian rating systems:

| Rating System | Route | Brand Color | Rating Output |
|---|---|---|---|
| GRIHA V2015 | `/griha-v2015` | Rose-red | 1–5 stars |
| GRIHA V2019 | `/griha-v2019` | Green | 1–5 stars |
| GRIHA V6 | `/griha-v6` | Orange | 1–5 stars |
| IGBC SB 2020 | `/igbc-sb-2020` | Blue | Certified / Silver / Gold / Platinum |

The dashboard (`/`) shows project info (name, site area, occupancy, climate zone) and live point totals for all four systems.

---

## Architecture Decisions Made

- **All state in `localStorage`** — keys: `stats_v6`, `stats_v2019`, `stats_v2015`, `stats_igbc`, `project_info`, `app-theme`, `global-icon-override`
- **App Router** (Next.js) — all rating pages are `"use client"` components with inline section/criteria data arrays
- **No API routes** — fully client-side; Supabase is provisioned but not yet integrated
- **Glass morphism UI** — custom CSS tokens in `globals.css`: `glass-card`, `glass-panel`, `glass-input`
- **3-mode theme** — light / dark / high-contrast, managed via `ThemeProvider.tsx` + `localStorage`
- **Daily rotating icon** — `IconProvider.tsx` cycles through 365 sustainability facts/icons from `src/data/sustainability.ts`
- **Chatbot stub** — `Chatbot.tsx` exists in layout but has no backend; static greeting only
- **Root-level JS scripts** (`make-igbc.js`, `add-stars.js`, etc.) are one-off codegen tools, not part of the app runtime

---

## Completed Work

### Session: 2026-07-14 (Claude — initial audit)
- [ ] Confirmed project structure, routing, and state model (see above)
- [ ] Confirmed Vercel project `harshz` (ID: `prj_6WeTsDLfwbtTTyl66e5hFydrZNqD`) is the correct deployment target
- [ ] Confirmed Supabase project `Harshz` (ID: `imrgjnvvylrdjzsxthzg`) is provisioned and healthy
- [ ] Added `.claude/PROGRESS.md` (this file) and `.claude/skills/project-status/SKILL.md`
- [ ] Updated `AGENTS.md` with project context

---

## Pending / Known Gaps

- [ ] **Supabase not wired** — project is provisioned but no tables created and no client integration in the codebase yet
- [ ] **Chatbot has no backend** — `Chatbot.tsx` is a UI stub; no AI or API connected
- [ ] **No auth** — any user can access all data; no login/session
- [ ] **Single-user** — localStorage means data is device-local; no sync or sharing
- [ ] **No export** — users cannot export their scoring data (PDF, CSV, etc.)
- [ ] **Root scripts** (`make-*.js`, `add-*.js`, etc.) are not cleaned up — clutter the root

---

## How to Run Locally

```bash
npm install
npm run dev        # starts on http://localhost:3000
npm run build      # production build
npm run lint       # eslint
```

## Deployments

Push to `main` triggers auto-deploy on Vercel to `www.harshz.com`.  
Always push to the designated `claude/*` branch and open a PR — never push directly to `main`.
