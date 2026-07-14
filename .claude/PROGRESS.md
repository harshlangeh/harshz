# Harshz — Project Progress Log

> **MANDATORY FOR ALL AI AGENTS:** You MUST write a session entry to this file before ending your turn if you made any changes. Use the exact template below. Include a precise timestamp (IST = UTC+5:30). No exceptions — this file is the single source of truth for handoffs between humans and any AI.

---

## Project Identity

| | |
|---|---|
| **App** | Harshz Green Building Automation |
| **GitHub** | `harshlangeh/harshz` |
| **Vercel** | `harshz` → `www.harshz.com` / `harshz-seven.vercel.app` (project ID: `prj_6WeTsDLfwbtTTyl66e5hFydrZNqD`) |
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

## Session Log (newest first)

### [2026-07-14 23:55 IST] Claude (claude-sonnet-4-6) — Branding section, cover page templates & download preview
**Files changed:**
- New: `src/types/branding.ts`, `src/components/CoverPageVisual.tsx`, `src/components/BrandingSection.tsx`, `src/components/ui/dialog.tsx`
- Modified: `src/app/page.tsx`, `src/components/DownloadSection.tsx`, `src/lib/downloads/pdf.ts`, `src/lib/downloads/ppt.ts`, `src/lib/downloads/word.ts`, `src/lib/downloads/excel.ts`

**What was done:**
- [x] `BrandingInfo` type + `getBranding()`/`saveBranding()` helpers in `src/types/branding.ts`; stored under `branding_info` key
- [x] `CoverPageVisual` component: pure inline-style A4 cover page for 4 templates (Classic/Modern/Minimal/Bold); `scale` prop for thumbnails vs full preview
- [x] `BrandingSection` dashboard card: logo uploader (base64 via FileReader), company name/tagline inputs, 4-template picker with live thumbnails, full-size preview Dialog
- [x] Custom `Dialog` component (no Radix dependency): Escape key + backdrop click to close, body overflow lock
- [x] All 4 download formats (PDF, PPT, Word, Excel) now generate a branded cover page as the first page/sheet using the stored branding + template
- [x] `DownloadSection` updated: "Preview before downloading" CSS toggle; when on, clicking a format button opens a preview modal with cover visual + document info before the download triggers
- [x] `<BrandingSection />` inserted in dashboard between Project Information card and Rating Cards grid
- [x] Build passed; committed + pushed to `claude/new-session-fqgdu4`; PR #5 opened as draft
- [x] Vercel preview deployed: `harshz-git-claude-new-session-fqgdu4-harshs-projects-cf1bfbf4.vercel.app` — Ready
- [x] PR #5 merged to main (squash)

**Decisions made:**
- Download libs call `getBranding()` directly (read from localStorage) — avoids touching `DownloadData` type or all 4 rating pages
- `CoverPageVisual` uses pure inline styles (not Tailwind/CSS classes) so it renders correctly in the preview dialog regardless of theme
- Thumbnail scaling: CSS `transform: scale(N)` with `transformOrigin: top left`; outer div clips to scaled dimensions
- `saveProjectInfo()` continues to write computed flat `siteArea`/`builtUpArea` strings for download-lib backward compat

**Blockers / next steps:**
- Supabase still not wired; chatbot still stub; no auth
- Could add more template designs, or allow custom brand color per document

---

### [2026-07-14 23:30 IST] Claude (claude-sonnet-4-6) — Replace flat area inputs with dynamic multi-area list
**Files changed:**
- Modified: `src/app/page.tsx`

**What was done:**
- [x] Replaced single `siteArea` / `builtUpArea` text inputs with `AreaItem[]` lists
- [x] New `AreaList` sub-component: name input + sqm number input + delete (X) button per row; computed total shown at top-right; "Add area" button at bottom
- [x] `AreaItem` interface: `{ id: string; name: string; value: string }`
- [x] `migrateProjectInfo()` handles existing localStorage data (old string → single AreaItem)
- [x] `saveProjectInfo()` writes new arrays + computed string totals for backward compat with download code
- [x] Layout: 4-col grid for basic fields → Separator → 2-col grid (site areas | built-up areas) on lg screens
- [x] Build passed: all 13 routes generated static
- [x] Committed + pushed to `claude/new-session-fqgdu4`; PR #4 updated with new commit
- [x] Vercel preview building: `harshz-git-claude-new-session-fqgdu4-harshs-projects-cf1bfbf4.vercel.app`

**Decisions made:**
- Areas stored as `AreaItem[]` in localStorage; backward compat via migration on load and string-totals on save
- `newId()` uses `Date.now() + Math.random()` to avoid collisions when adding multiple areas quickly
- Placeholder text guides users: site "e.g. Landscape area, Hard paved area…"; built-up "e.g. Ground floor, First floor…"

**Blockers / next steps:**
- PR #4 open as draft — user should review and merge
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-14 23:07 IST] Claude (claude-sonnet-4-6) — Add download checklist section (Excel, PDF, PPT, Word)
**Files changed:**
- New: `src/types/download.ts`, `src/lib/downloads/excel.ts`, `src/lib/downloads/pdf.ts`, `src/lib/downloads/ppt.ts`, `src/lib/downloads/word.ts`, `src/components/DownloadSection.tsx`
- Modified: `src/app/griha-v6/page.tsx`, `src/app/griha-v2019/page.tsx`, `src/app/griha-v2015/page.tsx`, `src/app/igbc-sb-2020/page.tsx`, `package.json`, `package-lock.json`

**What was done:**
- [x] Installed `xlsx`, `jspdf`, `jspdf-autotable`, `pptxgenjs`, `docx` (all loaded lazily via dynamic import)
- [x] Created shared `DownloadData` type in `src/types/download.ts`
- [x] Excel: SheetJS export — Summary sheet (project info + star rating) + Checklist sheet (all sections/criteria)
- [x] PDF: jsPDF + autotable — A4 portrait, branded header, star rating drawn as filled/empty circles, full criteria table
- [x] PPT: pptxgenjs — title/summary slide + one slide per section + section-summary slide
- [x] Word: docx — branded heading, project info table, rating summary, full criteria table
- [x] `DownloadSection` component with 4 format buttons, loading spinners, error state
- [x] All 4 rating pages updated with `useMemo` DownloadData + DownloadSection at bottom
- [x] Build passed: all 13 routes generated static
- [x] Committed + pushed to `claude/new-session-fqgdu4`; PR #4 opened as draft
- [x] Vercel preview deployed: `harshz-git-claude-new-session-fqgdu4-harshs-projects-cf1bfbf4.vercel.app` — Ready

**Decisions made:**
- All download libraries loaded via dynamic import — zero bundle impact on initial page load
- Star rating rendered as drawn filled/empty circles in PDF; Unicode ★/☆ in Excel, PPT, Word
- IGBC page normalizes its `maxNew`/`maxExisting` structure into the shared `DownloadData` type
- `DownloadSection` reads project info from `localStorage` inside `useMemo` (IGBC) or via dedicated `useEffect` (GRIHA pages)

**Blockers / next steps:**
- PR #4 open as draft — user should review and merge
- Supabase still not wired; chatbot still stub; no auth; no export addressed in earlier sessions

---

### [2026-07-14 13:45 IST] Claude (claude-sonnet-4-6) — Install shadcn/ui and rebuild all pages with proper components

**Files changed:**
- New: `src/lib/utils.ts`, `components.json`
- New: `src/components/ui/button.tsx`, `card.tsx`, `input.tsx`, `badge.tsx`, `progress.tsx`, `select.tsx`, `separator.tsx`, `table.tsx`
- Rewritten: `src/app/globals.css`, `src/app/page.tsx`, `src/app/griha-v6/page.tsx`, `src/app/griha-v2015/page.tsx`, `src/app/griha-v2019/page.tsx`, `src/app/igbc-sb-2020/page.tsx`
- Modified: `package.json` (added shadcn peer deps)

**What was done:**
- [x] Attempted `npx shadcn@latest init` — blocked by proxy (403 on `ui.shadcn.com`); worked around by manually writing all component files
- [x] Installed peer packages: `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`, `@radix-ui/react-select`, `@radix-ui/react-progress`, `@radix-ui/react-separator`, `tw-animate-css`
- [x] Created `cn()` helper in `src/lib/utils.ts`
- [x] Hand-wrote all 8 shadcn UI components (Button with CVA variants, Card, Input, Badge with 10 variants, Progress with `indicatorClassName`, Select/Radix, Separator, Table)
- [x] Rewrote `globals.css`: Tailwind v4 with `@theme` static brand colors + `@theme inline` for dynamic shadcn CSS-variable tokens, 3-mode theme (light/dark/high-contrast)
- [x] Rebuilt dashboard (`page.tsx`): project info card with shadcn Input/Select, 4 rating cards with brand-colored borders + Progress bars, IGBC card with Badge
- [x] Rebuilt all 4 rating pages with shadcn Card, Input, Badge, Progress; HTML tables (not shadcn Table) for the checklist
- [x] Fixed orange color: `#d97706` in light mode, `#F9BD77` in dark mode via CSS variable
- [x] Build passed: `✓ Compiled successfully in 4.1s`, all 13 routes generated static
- [x] Committed + pushed to `claude/shadcn-ui`; PR #2 opened as draft
- [x] Vercel preview deployed: `harshz-git-claude-shadcn-ui-harshs-projects-cf1bfbf4.vercel.app` — Ready

**Decisions made:**
- shadcn components hand-written (not CLI) because proxy blocks `ui.shadcn.com`
- `@theme inline` maps CSS vars → Tailwind utilities so brand colors change per theme
- All rating pages use plain HTML `<table>` inside a Card (not shadcn Table) for dense data layout
- Badge variants added: `mandatory`, `partly-mandatory`, `optional`, `certified`, `silver`, `gold`, `platinum`

**Blockers / next steps:**
- PR #2 (`claude/shadcn-ui`) is open as draft — user should review and merge
- PROGRESS.md needs updating after shadcn rebuild (this entry)

---

<!--
SESSION ENTRY TEMPLATE — copy this block, fill it in, paste at the TOP of the Session Log:

### [YYYY-MM-DD HH:MM IST] <AI-name or "Human"> — <one-line goal>
**Files changed:** list key files touched
**What was done:**
- [x] Completed item
- [x] Another completed item
- [ ] Started but not finished

**Decisions made:** any architectural or design choices made this session
**Blockers / next steps:** what to do next or what's blocked
-->

### [2026-07-14 13:22 IST] Claude (claude-sonnet-4-6) — Comprehensive UI/UX overhaul: Tailwind v4, light-mode design system, mobile sidebar fix

**Files changed:** `postcss.config.mjs` (new), `src/app/globals.css`, `src/components/layout/ClientLayout.tsx`, `src/app/page.tsx`, `package.json`, `package-lock.json`

**What was done:**
- [x] Discovered Tailwind CSS was not installed — all `text-*`, `bg-*`, `flex`, `grid` etc. utility classes were silently failing
- [x] Installed Tailwind v4 (`tailwindcss`, `@tailwindcss/postcss`) and created `postcss.config.mjs`
- [x] Completely rewrote `globals.css` with Tailwind v4 import, `@variant dark` for `data-theme` attribute, brand `@theme` color tokens
- [x] Implemented user's design spec: page body `#F5F5F5`, cards `#FFFFFF` + `rgba(0,0,0,0.22)` border, elevation shadows `0 1px 3px / 0 4px 12px rgba(0,0,0,0.10/0.12)`
- [x] Fixed `text-white` in light mode → `#000000` (and opacity variants) so star icons and text are legible on white cards
- [x] Fixed `text-orange` in light mode → `#d97706` (darkened for legibility on white)
- [x] Applied checklist row tints: `.bg-silver`, `.bg-rose-10`, `.bg-dark-rose`, `.bg-white-5`
- [x] Fixed mobile sidebar: changed default state to collapsed on `window.innerWidth < 768`; CSS uses `transform: translateX(-100%)` so sidebar slides off-screen instead of overlapping content
- [x] Fixed dashboard card title wrapping: changed from `text-xl` to `text-base font-bold whitespace-nowrap` for 4-column grid
- [x] Fixed CSS `@import` order error (Google Fonts must come before `@import 'tailwindcss'`)
- [x] Verified with Playwright screenshots: desktop, checklist, and mobile all render correctly

**Decisions made:**
- Tailwind v4 CSS-first config — no `tailwind.config.js`; all config via `@theme` and `@variant` in `globals.css`
- Custom dark mode variant: `@variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))` to match existing `ThemeProvider.tsx` which sets `data-theme` on `<html>`
- Brand colors defined in `@theme` so they work as Tailwind utilities AND in CSS variables
- `text-white/*` opacity variants overridden in light mode to map to black/dark equivalents

**Blockers / next steps:** Dark mode not yet screenshot-verified; GRIHA V2015 and V2019 pages not yet screenshot-verified after Tailwind install

---

### [2026-07-14 12:15 IST] Claude (claude-sonnet-4-6) — Progress tracking with timestamps for all AIs
**Files changed:** `.claude/PROGRESS.md`, `.claude/skills/project-status/SKILL.md`
**What was done:**
- [x] Rewrote PROGRESS.md with mandatory timestamped session entry template
- [x] Updated skill to enforce timestamp + AI attribution on every session entry
- [x] Added IST (UTC+5:30) as the project timezone standard for all entries

**Decisions made:** Every AI (Claude, GPT, Gemini, or any other) must log a timestamped entry before ending a session; format is `[YYYY-MM-DD HH:MM IST] <AI-name> — <goal>`
**Blockers / next steps:** Supabase not yet wired; chatbot stub; no auth; no export

---

### [2026-07-14 11:55 IST] Claude (claude-sonnet-4-6) — Initial audit + progress tracking setup
**Files changed:** `AGENTS.md`, `.claude/PROGRESS.md`, `.claude/skills/project-status/SKILL.md`
**What was done:**
- [x] Audited full project structure, routing, and state model
- [x] Confirmed Vercel project `harshz` (`prj_6WeTsDLfwbtTTyl66e5hFydrZNqD`) as correct deployment target
- [x] Confirmed Supabase `Harshz` (`imrgjnvvylrdjzsxthzg`) provisioned and healthy
- [x] Created `.claude/PROGRESS.md` with session log format
- [x] Created `.claude/skills/project-status/SKILL.md` — `/project-status` slash command
- [x] Updated `AGENTS.md` with project scope, stack, and conventions
- [x] PR #1 opened (`claude/website-check-fpje2y → main`), Vercel preview deployed and Ready

**Decisions made:** PROGRESS.md is the single source of truth for all AI handoffs
**Blockers / next steps:** Supabase not yet wired; chatbot has no backend; no auth; no export

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
Always develop on a `claude/*` branch and open a PR — never push directly to `main`.
Vercel also deploys `harshz_v5` from the same repo (unrelated project, ignore it).
