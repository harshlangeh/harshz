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
| GRIHA V2015 | `/project/[projectId]/griha-v2015` | Rose-red | 1–5 stars |
| GRIHA V2019 | `/project/[projectId]/griha-v2019` | Green | 1–5 stars |
| GRIHA V6 | `/project/[projectId]/griha-v6` | Orange | 1–5 stars |
| IGBC SB 2020 | `/project/[projectId]/igbc-sb-2020` | Blue | Certified / Silver / Gold / Platinum |

`/` is the **Projects list** (create/open/delete projects, shown as cards). Each project's dashboard (`/project/[projectId]`) shows its own project info (name, site area, occupancy, climate zone) and live point totals for all four systems — completely isolated from every other project.

---

## Architecture Decisions Made

- **Multi-project system** — `src/lib/projects.ts` holds `Project` CRUD (`projects` localStorage key) and `scopedKey(projectId, key)`. Every per-project piece of state (`project_info`, `project_typology`, `appraisals_v6`, `scores_*`, `stats_*`) is namespaced as `${projectId}::${key}` — verified with Playwright that two projects never bleed state into each other. Deleting a project removes it from the `projects` list but does **not** clean up its scoped keys yet (orphaned data, harmless since nothing references the old id — worth a cleanup pass later if it matters)
- **All state in `localStorage`** — see Key Conventions in AGENTS.md for the exact key list and global-vs-scoped split
- **App Router** (Next.js) — all rating pages are `"use client"` components with inline section/criteria data arrays
- **No API routes** — fully client-side; Supabase is provisioned but not yet integrated
- **Glass morphism UI** — custom CSS tokens in `globals.css`: `glass-card`, `glass-panel`, `glass-input`
- **3-mode theme** — light / dark / high-contrast, managed via `ThemeProvider.tsx` + `localStorage`
- **Daily rotating icon** — `IconProvider.tsx` cycles through 365 sustainability facts/icons from `src/data/sustainability.ts`
- **Chatbot stub** — `Chatbot.tsx` exists in layout but has no backend; static greeting only
- **Root-level JS scripts** (`make-igbc.js`, `add-stars.js`, etc.) are one-off codegen tools, not part of the app runtime

---

## Session Log (newest first)

### [2026-07-21 15:35 IST] Claude (claude-sonnet-4-6) — Bulk paste for Total Site Area

**Files changed:**
- Modified: `src/components/AreaList.tsx`

**What was done:**
- [x] Added "Paste from spreadsheet" button to `AreaList` component (used for Total Site Area in all checklist pages and Project Details section)
- [x] Pasting multi-line content from Excel or Word immediately parses all rows and appends them — no manual row-by-row entry needed (like Vercel env vars UX)
- [x] Supported formats: tab-separated (Excel copy), colon-separated, equals-separated, trailing-number (all Word/text variants)
- [x] Thousand-separators (commas, spaces) and unit suffixes (sqm, m2, sq.m, sq ft) stripped automatically
- [x] "Parse & Add" button for typed entry; Cancel collapses panel without changes
- [x] Build passed; PR #29 merged

**Blockers / next steps:**
- Criteria 2–30 in GRIHA V6 still have placeholder appraisals — need real names/points/compliance types
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-20 08:00 IST] Claude (claude-sonnet-5) — Multi-project system

**Files changed:**
- Added: `src/lib/projects.ts`
- Moved: `src/app/page.tsx` → `src/app/project/[projectId]/page.tsx` (dashboard); `src/app/griha-v6/**`, `griha-v2019/page.tsx`, `griha-v2015/page.tsx`, `igbc-sb-2020/page.tsx` → same paths under `src/app/project/[projectId]/`
- Added: new `src/app/page.tsx` (Projects list)
- Modified: `src/components/ProjectDetailsSection.tsx`, `src/components/calculators/TreePreservationCalculator.tsx`, `src/components/layout/Sidebar.tsx`, `src/data/building-typology.ts`, `src/data/griha-v6-appraisals.ts`, `src/lib/project-narrative.ts`

**What was done:**
- [x] User asked for a project system: create a project first, then everything (checklists, project info, etc.) lives inside it; multiple projects shown as cards
- [x] `src/lib/projects.ts`: `Project { id, name, createdAt }` CRUD over a global `projects` key, plus `scopedKey(projectId, key)` — the namespacing helper every piece of per-project state now goes through
- [x] New `/` — Projects list: cards with name/created date, "New Project" dialog, delete-with-confirm dialog, empty state
- [x] All 4 rating pages + dashboard + the GRIHA V6 appraisal detail page moved under `/project/[projectId]/...`; every internal `Link` updated to include the project id
- [x] Every localStorage read/write across these pages — `project_info`, `scores_v6/v2019/v2015/igbc`, `stats_v6/v2019/v2015/igbc` — now goes through `scopedKey(projectId, ...)`
- [x] Threaded `projectId` as an explicit parameter through `getAppraisalState`/`saveAppraisalState` (was keyed only by appraisal code before), `getProjectDetails`/`saveProjectDetails`/its `project_info` sync, `buildProjectApprovalsNarrative`, `ProjectDetailsSection`, and `TreePreservationCalculator`
- [x] Sidebar is now project-aware: always shows "My Projects" (`/`); adds a "Project Dashboard" link (`/project/[projectId]`) only when inside a project route; "Branding" stays global
- [x] Cleared the stale `.next` type-validator cache (referenced the pre-move route paths) before the final typecheck
- [x] Verified with Playwright: created two projects, set different occupancy/building-count/appraisal-status data in each, confirmed zero bleed-over in either direction, confirmed values persist correctly across navigation, confirmed the raw `localStorage` dump shows clean `proj-xxx::key` namespacing, confirmed delete-project and the global `/branding` route both still work
- [x] Build + typecheck passed; committed to `claude/new-session-fqgdu4`

**Blockers / next steps:**
- Deleting a project doesn't yet garbage-collect its scoped localStorage keys (harmless orphaned data, not user-visible)
- Criterion 1's stated max (5) still doesn't reconcile with its appraisals' point sum — pre-existing gap, see below
- Still waiting on real appraisal names/points/compliance types for placeholders on criteria 2–30
- Supabase still not wired (and now doubly relevant — projects only live in this browser's localStorage, so no cross-device sync); chatbot still stub; no auth

---

### [2026-07-20 00:50 IST] Claude (claude-sonnet-5) — Appraisals 1.1.3 and 1.1.4 added to Criterion 1

**Files changed:**
- Modified: `src/data/griha-v6-appraisals.ts`

**What was done:**
- [x] `1.1.3` "One Tree for Every 80 sqm" — 1 point, Optional
- [x] `1.1.4` "Per Capita Gross Area Benchmark" — 1 point, Optional
- [x] Criterion 1 (Green Infrastructure) now has 4 appraisals total; verified both render correctly in the checklist's nested table and on their own detail pages (untinted "Optional" row style, correct badge)
- [x] Build passed; committed to `claude/new-session-fqgdu4`

**Blockers / next steps:**
- Criterion 1's stated max (5) still doesn't reconcile with its appraisals' point sum (1.1.1/1.1.2 mandatory = 0 pts, 1.1.3/1.1.4 = 1 pt each = 2 total) — pre-existing gap, not something to silently "fix" without confirming the real GRIHA point breakdown
- Still waiting on real appraisal names/points/compliance types for placeholders on criteria 2–30
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-20 00:35 IST] Claude (claude-sonnet-5) — Appraisal page rebuilt as accordion rows matching the criterion table

**Files changed:**
- Added: `src/lib/griha-compliance.tsx`
- Modified: `src/app/griha-v6/appraisal/[code]/page.tsx`, `src/app/griha-v6/page.tsx`

**What was done:**
- [x] The earlier "just add an orange top border to each card" pass (previous entry below) wasn't what the user meant — clarified via AskUserQuestion that they wanted the appraisal page's *row* styling to match the criterion table's clickable rows: compliance-tinted background, chevron, compact single-row layout — not stacked always-open Cards
- [x] Extracted `complianceBadge()`/`rowClass()` out of `griha-v6/page.tsx` into a new shared `src/lib/griha-compliance.tsx` so both the checklist table and the appraisal page render compliance styling from one source (no drift risk)
- [x] Rebuilt the appraisal detail page: Status/Narrative/Calculation/Data are now four accordion rows inside one bordered `Card`, each tinted via `rowClass(meta.type)` (e.g. `1.1.1`/`1.1.2` are Mandatory → rose tint, same as a Mandatory criterion row), with a chevron and single-section-expanded-at-a-time behavior — the same interaction pattern as the criterion table's row-click-to-expand
- [x] The appraisal's own compliance badge (Mandatory/Optional) now shows next to the page title, mirroring how the criterion table shows it in the Compliance column
- [x] The Narrative row's "Generate from Project Details" button now sits inline in the row header (stopPropagation so it doesn't toggle the row) instead of a Card-header corner
- [x] Verified with Playwright: rows render with the rose "Mandatory" tint on `1.1.1`/`1.1.2`, clicking a row collapses the previous one and expands the clicked one, and the Tree Preservation calculator still renders correctly inside its row
- [x] Build passed; committed to `claude/new-session-fqgdu4`

**Blockers / next steps:**
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-20 00:10 IST] Claude (claude-sonnet-5) — Appraisal page card styling matched to criterion checklist page

**Files changed:**
- Modified: `src/app/griha-v6/appraisal/[code]/page.tsx`

**What was done:**
- [x] Added `border-t-4 border-t-orange` to all four cards on the appraisal detail page (Status, Narrative, Calculation, Data) — previously plain white cards with no accent, unlike the checklist page's Summary/Project Details cards which already carry that orange top-border branding
- [x] Verified visually with Playwright on both `1.1.1` and `1.1.2` — cards now read as visually consistent with the criterion/checklist page
- [x] Build passed; committed to `claude/new-session-fqgdu4`

**Blockers / next steps:**
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-19 06:15 IST] Claude (claude-sonnet-5) — Tree Preservation: exempted-state narrative + calculator collapse

**Files changed:**
- Modified: `src/app/griha-v6/appraisal/[code]/page.tsx`, `src/components/calculators/TreePreservationCalculator.tsx`

**What was done:**
- [x] New `EXEMPTED_NARRATIVES` code→text map on the appraisal page; when `1.1.2`'s Status is switched to Exempted (or is already Exempted on load with no narrative yet), the narrative auto-fills to "There is no existing trees on the site hence project is exempted from the appraisal." (overwrites, same as the existing "Generate" pattern)
- [x] `TreePreservationCalculator` now takes a `status` prop; `isExempted = status === 'exempted' || hasExistingTrees === 'No'` — either trigger collapses rows C–I (all the tree-count inputs), leaving only A (Site area), B (Yes/No), and J, which shows "EXEMPTED" in gold instead of the computed YES/NO. H (GRIHA requirement) is forced to 0 while exempted, per spec, even though its row is hidden
- [x] Switching B back to "Yes" (with status not Exempted) restores all rows and live computation as before
- [x] Verified with Playwright: B=No → 3 rows, J=EXEMPTED; switching Status to Exempted while B=Yes still collapses to 3 rows and sets the exact narrative text requested; switching B back to Yes restores all 10 rows
- [x] Build passed; committed to `claude/new-session-fqgdu4`

**Blockers / next steps:**
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-19 06:00 IST] Claude (claude-sonnet-5) — Tree Preservation (1.1.2) calculator

**Files changed:**
- Added: `src/components/calculators/TreePreservationCalculator.tsx`
- Modified: `src/data/griha-v6-appraisals.ts`, `src/app/griha-v6/appraisal/[code]/page.tsx`

**What was done:**
- [x] Added `calculator?: Record<string, string>` to `AppraisalState` — a generic per-appraisal key/value bag (mirrors how `narrativeHtml` is stored) so future appraisal calculators don't need bespoke storage
- [x] Built the Tree Preservation calculator per user's sample (A–J), rendered as a table: A Site area, B Existing mature trees Y/N, C/D/E/G manual inputs (prior count / preserved / cut / transplanted), and computed read-only F/H/I/J:
  - F = E × 3 (1:3 replanting ratio for cut trees)
  - H = A ÷ 125 (GRIHA site-area-based tree requirement)
  - I = D + F + G (total preserved via combined strategies)
  - J = I ≥ H ? "YES" : "NO" (Mandatory threshold, green/red)
- [x] Site area (A) auto-prefills from the Project Details section's Total Site Area when empty, matching the Calculation card's existing "Prefilled from Project Information" description
- [x] Wired in via a `CALCULATORS` code→component map on the appraisal detail page, same pattern as the narrative-builder map — only `1.1.2` has one for now, other appraisals still show the "not configured yet" placeholder
- [x] Verified with Playwright against the exact sample values (site area 5000, C=30, D=20, E=5, G=10) — F/H/I/J came out to 15/40/45/YES, matching the user-provided sample precisely
- [x] Build passed; committed to `claude/new-session-fqgdu4`

**Blockers / next steps:**
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-19 05:35 IST] Claude (claude-sonnet-5) — Dynamic Project Approvals narrative, tabular layout

**Files changed:**
- Added: `src/lib/project-narrative.ts`
- Modified: `src/app/griha-v6/appraisal/[code]/page.tsx`, `src/app/globals.css`

**What was done:**
- [x] `buildProjectApprovalsNarrative()` composes "The project **[Name]** is a **[Sub-typology] ([Category])**, having a total site area of **X sqm** and total built-up area of **Y sqm** across **N** building(s), operating on a schedule of **[daily]**, **[weekly]**, as per the details selected in Project Information and Project Details" from `project_info` + `project_typology` (localStorage), followed by an HTML details table (Project Name / Location / Climate Zone / Typology / Buildings / Areas / Schedule), plus a second per-building Name/Built-up-Area table when there's more than one building
- [x] Wired only into appraisal `1.1.1` (Project Approvals) via a `DYNAMIC_NARRATIVE_BUILDERS` map keyed by code — other appraisals are untouched
- [x] Auto-seeds the narrative on first visit if empty; added a "Generate from Project Details" button in the Narrative card header to re-run it on demand (overwrites current content — it's still freely editable afterwards since it's just HTML fed into the existing `RichTextEditor`)
- [x] Added `.rich-text-content table/th/td` CSS (border-collapse, muted header row, bordered cells) since the editor previously had no table styling
- [x] Verified with Playwright: seeded Project Info/Details render correctly into the sentence and both tables with correct sums; editing the narrative then clicking regenerate correctly overwrites the manual edit
- [x] Build passed; committed to `claude/new-session-fqgdu4`

**Blockers / next steps:**
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-19 05:10 IST] Claude (claude-sonnet-5) — Site/Built-up Area moved to Project Details; Number of Buildings added

**Files changed:**
- Added: `src/components/AreaList.tsx` (extracted from `src/app/page.tsx`)
- Modified: `src/app/page.tsx`, `src/components/ProjectDetailsSection.tsx`, `src/data/building-typology.ts`

**What was done:**
- [x] Extracted the dashboard's inline `AreaList`/`AreaItem`/`sumAreas`/`fmtSqm`/`newId` into a shared `src/components/AreaList.tsx` so both the dashboard and `ProjectDetailsSection` can use it
- [x] Removed the "Total Site Area" and "Built-up Area" sections from the dashboard's Project Information card entirely, along with `siteAreas`/`builtUpAreas` from the `ProjectInfo` type, `DEFAULT_PROJECT`, and `migrateProjectInfo`
- [x] `ProjectDetailsSection` now has: **Number of Buildings** (numeric input) → drives a **Buildings** list sized to match, each row with Name + Built-up Area (auto-grows/shrinks as the count changes, preserving existing entries); and **Total Site Area** (the same multi-line `AreaList` UX moved over from the dashboard, unchanged)
- [x] `ProjectDetailsState` (in `building-typology.ts`) extended with `siteAreas`, `numberOfBuildings`, `buildings`; every `saveProjectDetails()` call now also mirrors computed `siteArea`/`builtUpArea` totals into the separate `project_info` blob (merged, not overwritten) so the existing Word/PDF download code — which reads `projectInfo.siteArea`/`builtUpArea` — keeps working unchanged
- [x] Fixed a related correctness bug while here: the dashboard's `saveProjectInfo()` used to overwrite the *entire* `project_info` blob on every dashboard edit, which would have silently wiped the site/built-up area totals written from the checklist pages the next time someone touched, say, Climate Zone. It now merges onto whatever's already stored
- [x] Verified with Playwright: dashboard no longer shows Site/Built-up Area; setting "Number of Buildings" to 2/3 grows the Buildings list and preserves already-typed names/areas; Site Area entries and Buildings' Built-up Area correctly sum into `project_info.siteArea`/`builtUpArea`; editing a dashboard-only field (Project Name) no longer clobbers those synced totals
- [x] Build passed; committed to `claude/new-session-fqgdu4`

**Blockers / next steps:**
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-19 04:45 IST] Claude (claude-sonnet-5) — Fixed "Healthcare Facility looks default" on the typology dropdowns

**Files changed:**
- Modified: `src/components/ProjectDetailsSection.tsx`

**What was done:**
- [x] Root cause: with no value selected, Radix Select auto-focuses the first *enabled* item on open for accessibility, and that item's focus-highlight style made "Healthcare Facility" (first category) look like a pre-selected default even though the closed trigger correctly showed "Select a category"
- [x] Fix: added an enabled `PLACEHOLDER` sentinel item ("Select a category" / "Select a sub-type" / "Select daily hours" / "Select weekly days") as the first entry in all four dropdowns, so it — not the first real option — receives the initial focus highlight; `onValueChange` treats the sentinel as clearing back to `''`. (A `disabled` placeholder was tried first but Radix skips disabled items when choosing what to auto-focus, so it didn't work.)
- [x] Verified with Playwright: opening the category dropdown now highlights "Select a category" instead of "Healthcare Facility"; clicking the placeholder itself is a no-op; real selections (e.g. "Retail") still work and persist
- [x] Build passed; committed to `claude/new-session-fqgdu4`

**Blockers / next steps:**
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-19 04:20 IST] Claude (claude-sonnet-5) — Building Typology categories/sub-typologies corrected

**Files changed:**
- Modified: `src/data/building-typology.ts`

**What was done:**
- [x] Removed the standalone "Sports" category — down to exactly 7 categories + Mixed-use Development, per user correction
- [x] Institutional now: Universities, Schools, Colleges, Libraries, Institutes, Sports complex, Research and development buildings, Place of worship (dropped Hostels/Gallery-Museum/Sports and leisure facilities/Auditorium-Theatre)
- [x] Office: "Offices" replaced with "Core & shell buildings" (rest unchanged)
- [x] Residential: "Core & shell buildings" removed, "Hostels" added
- [x] Retail: added Gallery/Museum, Sports and leisure facilities, Auditorium/Theatre
- [x] Build passed; committed to `claude/new-session-fqgdu4`

**Blockers / next steps:**
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-19 04:05 IST] Claude (claude-sonnet-5) — Project Details section (Building Typology + Operation Schedule) added to GRIHA checklist pages

**Files changed:**
- Added: `src/data/building-typology.ts`
- Added: `src/components/ProjectDetailsSection.tsx`
- Modified: `src/app/griha-v6/page.tsx`, `src/app/griha-v2019/page.tsx`, `src/app/griha-v2015/page.tsx`

**What was done:**
- [x] User's initial pasted Building Typology table was garbled from a PDF copy-paste (headers/items interleaved); I reconstructed my best-guess mapping and asked the user to confirm — they came back with a clean, authoritative JSON (7 categories + Sports + Mixed-use Development, plus an Operation Schedule block) which is now the source of truth in `building-typology.ts`
- [x] New `ProjectDetailsSection` card renders before the checklist table on all three GRIHA pages (v6/v2019/v2015 — user asked for "All GRIHA Checklist page"), with brand-matched accent border (orange/green/rose-red)
- [x] Building Typology: category dropdown + dependent sub-typology dropdown; "Mixed-use Development" has no sub-types, so the sub-dropdown is replaced with its description text instead
- [x] Operation Schedule: Daily (8h/24h) and Weekly (5 days/7 days) dropdowns, plus the standard note about projects outside these schedules using an owner-defined one
- [x] State stored under its own new `project_typology` localStorage key (not merged into `project_info`) — deliberately decoupled so the dashboard's `saveProjectInfo()` (which overwrites the whole `project_info` blob) can't silently wipe these fields
- [x] Verified with Playwright: category → sub-type selection, Mixed-use Development's description fallback, cross-page brand coloring (v2019 green), and persistence across a page reload
- [x] Build passed; committed to `claude/new-session-fqgdu4`

**Blockers / next steps:**
- Stop-hook flagged PR #17's squash-merge commit (`994d174`) as unverified — left as-is per the established lesson (amending already-merged commits caused a real conflict before)
- New `project_typology` key not yet listed in AGENTS.md's state-keys table — worth adding next time that file is touched
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-19 03:35 IST] Claude (claude-sonnet-5) — "Open Appraisal" styled as a real button

**Files changed:**
- Modified: `src/app/griha-v6/page.tsx`

**What was done:**
- [x] "Open Appraisal →", shown when an appraisal is marked Attempting, was plain underlined text — now uses the shared `Button` component (`asChild` + `Link`, `size="sm"`, orange brand fill) so it reads as a clickable action, not a text link
- [x] Verified with Playwright: expanding Criterion 1 → `1.1.1` → selecting Attempting shows a solid orange "Open Appraisal →" button
- [x] Build passed; committed to `claude/new-session-fqgdu4`

**Blockers / next steps:**
- Stop-hook flagged PR #16's squash-merge commit (`a244085`, committer `noreply@github.com`) as unverified — left it as-is this time per the lesson from the PR #14/#15 incident (amending it caused a real merge conflict); asked user whether they still want it force-fixed, awaiting reply
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-18 22:00 IST] Claude (claude-sonnet-5) — Mandatory "M" recolored: black in Max, green in Target

**Files changed:**
- Modified: `src/data/griha-v6-appraisals.ts`

**What was done:**
- [x] `appraisalMaxDisplay`'s Mandatory "M" badge changed from green to `text-foreground` (theme-adaptive black/white) so it reads as a neutral label rather than implying compliance status
- [x] `appraisalTargetDisplay`'s Mandatory "M" stays green — that one *does* signal "mandatory requirement met"
- [x] Build passed; committed to `claude/new-session-fqgdu4`

**Blockers / next steps:**
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-18 21:45 IST] Claude (claude-sonnet-5) — PR #15 merged

**What was done:**
- [x] PR #15 (Project Approvals marked Mandatory) squash-merged into `main` (commit `507401e`)
- [x] Hit a merge conflict on the first merge attempt: amending PR #14's squash-merge commit (per the stop-hook fix) had made the dev branch's history diverge from `main`'s actual commit SHA for that same content, so GitHub couldn't fast-forward/merge cleanly. Fixed by resetting the branch straight to `origin/main` and cherry-picking just the two new commits back on top, then force-pushing — merged cleanly after that
- [x] Lesson: don't amend a commit that's already the tip of `main`; if a hook flags an already-merged commit's authorship, it's safe to leave as-is since it drops out of future PR diffs automatically once new commits build on top of the real `main` tip
- [x] Dev branch restarted from the new `main`

**Blockers / next steps:**
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-18 15:35 IST] Claude (claude-sonnet-5) — Project Approvals (1.1.1) marked Mandatory

**Files changed:**
- Modified: `src/data/griha-v6-appraisals.ts`

**What was done:**
- [x] `1.1.1` (Project Approvals) now has `type: 'Mandatory'`, so its Max badge shows "M" (green) like `1.1.2`, and it's excluded from criterion 1's scored max/total per the existing Mandatory handling
- [x] Also fixed the tip-commit authorship flagged by the stop hook (amended `#14`'s squash-merge commit to `Claude <noreply@anthropic.com>` and force-pushed to the dev branch only, not `main`)
- [x] Build passed; committed to `claude/new-session-fqgdu4`

**Blockers / next steps:**
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-18 15:20 IST] Claude (claude-sonnet-5) — Nested appraisal table header removed, columns aligned with criterion table

**Files changed:**
- Modified: `src/app/griha-v6/page.tsx`

**What was done:**
- [x] Removed the appraisal mini-table's own `<thead>` (No./Appraisal/Max/Target/Compliance) — redundant since it sits nested inside the already-headered outer criteria table
- [x] Added a `<colgroup>` to the nested table with column widths matching the outer criteria table (`w-12`, auto, `w-20`, `w-24`, `w-40`) so the Max/Target/Compliance columns line up vertically with the outer table's columns
- [x] Verified with Playwright: expanding Criterion 1 shows appraisals `1.1.1`/`1.1.2` with no duplicate header row, and Max/Target/Compliance columns visually align with the outer table's columns
- [x] Build passed; committed to `claude/new-session-fqgdu4`

**Blockers / next steps:**
- User said more follow-up instructions are coming next
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-17 20:15 IST] Claude (claude-sonnet-5) — PR #13 merged; auto-merge enabled going forward

**What was done:**
- [x] Verified `npm run build` passes, marked PR #13 ready for review, squash-merged into `main` (commit `58ddb5d`)
- [x] Dev branch restarted from the new `main`
- [x] User instructed: from now on, merge PRs automatically after a successful build rather than waiting for manual review/merge approval each time

**Blockers / next steps:**
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-17 08:20 IST] Claude (claude-sonnet-5) — Mandatory appraisals excluded from scoring

**Files changed:**
- Modified: `src/data/griha-v6-appraisals.ts`

**What was done:**
- [x] `appraisalMaxDisplay` now shows "M" (green) for any Mandatory appraisal's Max badge instead of its numeric points — Mandatory is a compliance gate, not a point source
- [x] `appraisalContribution` returns 0 for Mandatory appraisals regardless of status, so they never add to a criterion's scored total
- [x] `criterionEffectiveMax` now also subtracts Mandatory appraisals' points from the criterion's max (in addition to Exempted ones), so the max shown matches only the points that can actually be scored
- [x] Verified the three functions against `1.1.2` (Tree Preservation, Mandatory) and `1.1.1` (Project Approvals, Optional): Max shows "M", contribution is 0, and a criterion max of 10 correctly reduces to 5 (only the Optional appraisal's points remain scorable)
- [x] Build passed; committed to `claude/new-session-fqgdu4`

**Blockers / next steps:**
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-17 08:05 IST] Claude (claude-sonnet-5) — PR #12 merged

**What was done:**
- [x] Verified `npm run build` passes on `claude/new-session-fqgdu4`
- [x] Marked PR #12 ready for review and squash-merged into `main` (commit `2293d4b`)
- [x] Unsubscribed from PR #12 activity; dev branch restarted from the new `main`

**Blockers / next steps:**
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-17 02:00 IST] Claude (claude-sonnet-5) — Appraisal rows restyled to match criterion table, status as nested accordion
**Files changed:**
- Modified: `src/app/griha-v6/page.tsx`

**What was done:**
- [x] Appraisals inside an expanded criterion now render as a mini table matching the outer criteria table's look (same orange header, No./Appraisal/Max/Target/Compliance columns) instead of loose cards
- [x] Each appraisal row is now itself clickable and expands to reveal its status radio (Attempting/Non-Attempting/Later/Exempted) and "Open Appraisal" link — nested accordion, buttons no longer always visible
- [x] Added `expandedAppraisal` state (single-expand, mirrors `expandedCriterion`'s pattern)
- [x] `complianceBadge()` reused for the appraisal's own Compliance column (defaults to "Optional" badge when `type` is unset, matching existing fallback behavior)
- [x] Verified with Playwright: nested table renders correctly, clicking an appraisal row (e.g. `1.1.1 — Project Approvals`) reveals the status buttons, selecting Attempting shows "Open Appraisal →" inline in the expanded row and still navigates correctly
- [x] Build passed; committed + pushed to `claude/new-session-fqgdu4`; PR opened as draft

**Blockers / next steps:**
- Still waiting on real appraisal names/points/compliance types for all placeholders except `1.1.1`/`1.1.2`
- PR open as draft — user should review and merge
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-17 01:30 IST] Claude (claude-sonnet-5) — Placeholder appraisal for every GRIHA V6 criterion
**Files changed:**
- Modified: `src/data/griha-v6-appraisals.ts`

**What was done:**
- [x] Every criterion (2–30) now gets one placeholder appraisal, code `<criterionId>.1.1`, title "Appraisal 1 (name pending)" — generated with a small loop rather than hand-authoring 29 entries
- [x] This makes all 30 criteria clickable accordions (previously only Criterion 1 had appraisals defined)
- [x] No new page files needed — the existing dynamic route `/griha-v6/appraisal/[code]` already resolves any code via `getAppraisalMeta()`, so every placeholder immediately gets a working Narrative/Calculation/Data detail page
- [x] Verified with Playwright: Criterion 3 ("Design to Mitigate UHIE") expands to show `3.1.1`, marking it Attempting reveals "Open Appraisal →", which navigates correctly to its detail page; spot-checked Criterion 30's appraisal page too (`/griha-v6/appraisal/30.1.1`)
- [x] Build passed; committed + pushed to `claude/new-session-fqgdu4` (added to open PR #11)

**Decisions made:**
- Reused the flat `<criterionId>.1.1` code scheme already established for Criterion 1 (`1.1.1`, `1.1.2`) rather than a Section.Criterion.Appraisal scheme, since the user's own example ("criterion number 3 → appraisal 3.1.1") confirmed criterion-id-first numbering

**Blockers / next steps:**
- All 29 placeholder appraisals need real titles (and eventually points/compliance types) from the user, one at a time as before
- PR #11 open as draft (now also includes this change) — user should review and merge
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-17 01:00 IST] Claude (claude-sonnet-5) — Exempted status (applicability check) + appraisal 1.1.2 Tree Preservation
**Files changed:**
- Modified: `src/data/griha-v6-appraisals.ts`, `src/components/AttemptStatusRadio.tsx`, `src/app/griha-v6/page.tsx`, `src/app/griha-v6/appraisal/[code]/page.tsx`

**What was done:**
- [x] Added a 4th appraisal status, `'exempted'`, gated behind a new `AppraisalMeta.exemptable` flag so it only shows up where explicitly enabled (per user: "exemption is only for limited appraisal only")
- [x] Added `1.1.2 Tree Preservation` under Criterion 1 — type `Mandatory`, `exemptable: true`; no point value yet
- [x] `AttemptStatusRadio` renders a 4th "Exempted" radio only when `exemptable` is passed
- [x] New `appraisalMaxDisplay()`: shows the appraisal's points normally, or **"Ex"** in gold once exempted
- [x] `appraisalTargetDisplay()` extended: Exempted + Mandatory → **"M"** green (exemption counts as compliant); Exempted + Optional → **"Ex"** gold
- [x] New `criterionEffectiveMax()`: a criterion's Max cell now subtracts the points of any of its appraisals marked Exempted (the Target/sum column is unaffected, since exempted items already contribute 0, same as Non-Attempting)
- [x] Wired the same Exempted option + helper text into the appraisal detail page's Status card for consistency
- [x] Verified with Playwright (temporarily set `1.1.2`'s `points: 2` for testing, then reverted): confirmed exactly one "Exempted" radio exists on the page (only for 1.1.2, not 1.1.1), selecting it reduces Criterion 1's Max from 5→3, shows "Ex" gold on 1.1.2's own Max badge, and "M" green as its target
- [x] Build passed; committed + pushed to `claude/new-session-fqgdu4` (added to open PR #11)

**Decisions made:**
- Scoped the Max reduction to the criterion's row only — did not propagate it up into section totals, the "100"/"105" base/grand denominators, or star thresholds, since that's a materially larger recalculation not explicitly requested; flagged as a possible follow-up if the user wants exemptions to affect the overall certification math too

**Blockers / next steps:**
- Still waiting on point values for `1.1.1 Project Approvals` and `1.1.2 Tree Preservation`, plus compliance type for `1.1.1`
- PR #11 open as draft (now includes both the NC/M indicator work and this exemption feature) — user should review and merge
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-17 00:15 IST] Claude (claude-sonnet-5) — Mandatory appraisal target indicators (NC/M) + Points→Target rename
**Files changed:**
- Modified: `src/data/griha-v6-appraisals.ts`, `src/app/griha-v6/page.tsx`

**What was done:**
- [x] `AppraisalMeta` gains an optional `type: 'Mandatory' | 'Optional'` field
- [x] New `appraisalTargetDisplay()` helper: Mandatory+Non-Attempting → "NC" red; Mandatory+(Attempting|Later) → "M" green; Optional+Non-Attempting → "0"; Optional+(Attempting|Later) → full points
- [x] Rendered next to each appraisal's title in the checklist accordion
- [x] Renamed the checklist table's "Points" column header to "Target" per user's note
- [x] Verified with Playwright (temporarily setting `type:'Mandatory', points:5` on 1.1.1, then reverting): NC shows red when Non-Attempting, M shows green when Attempting, and the criterion/grand total correctly reflect the points — confirmed the display and scoring math both work before reverting the test values
- [x] Build passed; committed + pushed to `claude/new-session-fqgdu4`; PR opened as draft

**Decisions made:**
- `1.1.1 Project Approvals` still has no confirmed `type` or `points` from the user — left both undefined so it falls back to the Optional/0-points display until real values are provided

**Blockers / next steps:**
- Still waiting on: compliance type (Mandatory/Optional) and point value for `1.1.1 Project Approvals`, plus further appraisal breakdowns for other criteria
- PR open as draft — user should review and merge
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-16 03:00 IST] Claude (claude-sonnet-5) — GRIHA V6 criterion appraisals (accordion + detail page)
**Files changed:**
- New: `src/data/griha-v6-appraisals.ts`, `src/components/AttemptStatusRadio.tsx`, `src/components/RichTextEditor.tsx`, `src/app/griha-v6/appraisal/[code]/page.tsx`
- Modified: `src/app/griha-v6/page.tsx`, `src/app/globals.css`

**What was done:**
- [x] Criteria can now be broken into official GRIHA V6 "appraisals" (sub-criteria) — starting with Criterion 1 (Green Infrastructure), which has one appraisal so far: `1.1.1 Project Approvals` (points not yet provided by user)
- [x] Criteria with appraisals defined render as an expandable accordion row (click to toggle) instead of a flat point-entry row; other 29 criteria are unaffected
- [x] Each appraisal gets a three-way status: **Attempting** / **Non-Attempting** / **Later** — Attempting and Later both contribute the appraisal's full points (Later = "details shared at final submission, but full points count toward target" per user's spec); Non-Attempting contributes 0
- [x] Criterion's score becomes the sum of its appraisals' contributions, synced into the existing `scores` array so section/grand totals, stars, and downloads all keep working unchanged
- [x] When an appraisal is marked Attempting, an "Open Appraisal →" link appears, navigating to a dedicated detail page at `/griha-v6/appraisal/[code]`
- [x] Detail page has three sections per user's spec: **Narrative** (a minimal Word-style rich text box — bold/italic/underline/bullet/numbered list — built with `contentEditable` + `execCommand`, no new dependency), **Calculation** (blank placeholder — "calculator prefilled from Project Information and rating-specific data" to be wired up per-appraisal later), **Data** (blank placeholder for future file uploads)
- [x] Appraisal status + narrative persist to `localStorage` under `appraisals_v6`, keyed by appraisal code
- [x] Verified with Playwright: accordion expand/collapse, 3-way radio selection, navigation to detail page, narrative typing + bold formatting + persistence across reload, and mobile viewport rendering of the standalone detail page
- [x] Build passed; committed + pushed to `claude/new-session-fqgdu4`; PR opened as draft

**Decisions made:**
- Appraisal registry lives in `src/data/griha-v6-appraisals.ts` (not inlined in the page) since it must be shared between the checklist page and the separate detail-page route — an intentional exception to the "inline sections arrays" convention, scoped narrowly to just the appraisal data
- Rich text editor uses the browser's `document.execCommand` rather than pulling in a WYSIWYG library — matches the user's "simple text box" ask and keeps zero new dependencies
- Single contribution rule (points count if Attempting OR Later) rather than tracking separate "target" vs "achieved" totals — the page's own subtitle already frames all entries as "target points," so this needed no new dual-total concept

**Blockers / next steps:**
- Still waiting on the point value for `1.1.1 Project Approvals` and further appraisal breakdowns (title/points/numbering) for the remaining criteria — user is sharing these incrementally
- Calculation and Data sections are intentionally blank placeholders pending per-appraisal specs (calculator formulas, required documents) from the user
- PR open as draft — user should review and merge
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-16 01:00 IST] Claude (claude-sonnet-5) — Branding moved to its own sidebar-linked page
**Files changed:**
- New: `src/app/branding/page.tsx`
- Modified: `src/components/layout/Sidebar.tsx`, `src/components/layout/ClientLayout.tsx`, `src/components/BrandingSection.tsx`, `src/app/page.tsx`, `src/app/globals.css`

**What was done:**
- [x] `<BrandingSection />` removed from the dashboard (`src/app/page.tsx`)
- [x] New route `/branding` (`src/app/branding/page.tsx`) hosts it standalone with its own page header
- [x] `BrandingSection`'s internal `CardHeader` (title + description) removed — was duplicating the new page-level header
- [x] `Sidebar.tsx` rewritten as a client component with `usePathname()`-driven active-link highlighting; added a "Branding" link (Palette icon) next to "Dashboard" (LayoutDashboard icon)
- [x] `.nav-link.active` style added to `globals.css`
- [x] **Found + fixed a pre-existing bug while testing:** `ClientLayout`'s sidebar-collapsed state was computed from `window.innerWidth` inside `useState`'s lazy initializer — always `true` during SSR (no `window`), but `false` on a real desktop client. This server/client mismatch made React skip patching the `<aside>`'s `className` on hydration ("won't be patched up"), so the sidebar rendered invisible on desktop until toggled *twice*. Fixed by starting both environments at `collapsed=true` and expanding via `useLayoutEffect` on desktop widths (no visible flash, no mismatch)
- [x] Verified with Playwright: sidebar shows expanded by default on a 1440px viewport with both nav links and correct active-state styling; on a 390px mobile viewport it still defaults to collapsed, opens as an overlay, and navigating to Branding works and highlights correctly
- [x] Build passed; committed + pushed to `claude/new-session-fqgdu4`; PR opened as draft

**Decisions made:**
- Fixed the sidebar-collapse hydration bug in-scope since it made the very link this session added functionally invisible on first load — same branch/PR, called out explicitly in the commit message
- Used `useLayoutEffect` (not `useEffect`) for the desktop-expand correction specifically to avoid a visible flash of collapsed-then-expanded

**Blockers / next steps:**
- PR open as draft — user should review and merge
- Sidebar drawer doesn't auto-close after a link tap on mobile (pre-existing behavior, not fixed this session — low priority polish)
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-15 08:00 IST] Claude (claude-sonnet-5) — Fix mobile sizing of document previews
**Files changed:**
- Modified: `src/components/DownloadSection.tsx`, `src/components/PptSlidesPreview.tsx`

**What was done:**
- [x] Found via mobile Playwright screenshots that the exact-preview feature (previous session) broke on narrow viewports: Word preview rendered at fixed desktop width and got cropped, PowerPoint slide mockups (fixed 720px) were cut off on the right, Excel's second table column scrolled off-screen invisibly
- [x] `PptSlidesPreview`: added `useScaleToFit()` — a `ResizeObserver`-driven scale factor capped at 1x (desktop unaffected), applied via the same clip+transform wrapper pattern `CoverPageVisual` already uses
- [x] Word preview: after `docx-preview` renders the real document, measure its natural size and scale it down to fit with the same clip+transform technique
- [x] Excel preview: table switched from `whitespace-nowrap` to `table-fixed` + wrapping cells, so both columns stay visible on narrow screens
- [x] Preview modal height responsive: `70vh` on mobile vs `76vh` on larger screens
- [x] Verified with Playwright: all 4 formats correct on 390×844 mobile viewport (no cropping) and unchanged on 1440px desktop (scale stays 1x)
- [x] Build passed; committed + pushed to `claude/new-session-fqgdu4`; PR #8 opened as draft

**Decisions made:**
- Reused the existing clip-div + `transform: scale()` pattern from `CoverPageVisual` rather than inventing a new responsive technique, for consistency
- Scale factors are measured via `ResizeObserver` (not a one-time calculation) so resizing the browser window while the modal is open stays correct

**Blockers / next steps:**
- PR #8 open as draft — user should review and merge
- Supabase still not wired; chatbot still stub; no auth

---

### [2026-07-15 07:15 IST] Claude (claude-sonnet-5) — Exact document preview before download
**Files changed:**
- New: `src/components/PptSlidesPreview.tsx`
- Modified: `src/components/DownloadSection.tsx`, `src/lib/downloads/pdf.ts`, `src/lib/downloads/excel.ts`, `src/lib/downloads/word.ts`, `src/lib/downloads/ppt.ts`, `package.json`

**What was done:**
- [x] Preview modal now shows the real generated document instead of a cover-page mockup + info table
- [x] PDF: `generatePdfBlob()` builds the actual jsPDF doc and returns it as a Blob; preview renders it in an `<iframe>` via an object URL — this is the literal file, pixel-identical, browser's native PDF viewer (verified: cover + all content pages render correctly)
- [x] Excel: `generateExcelPreview()` returns every sheet (Cover/Summary/Checklist) from the same in-memory `XLSX.WorkBook` used for download, rendered as tabbed HTML tables (`XLSX.utils.sheet_to_html`) — exact cell content, tab-switchable
- [x] Word: `generateDocxBlob()` returns the real `docx` Packer blob; rendered via the new `docx-preview` dependency's `renderAsync()` — real pagination, fonts, colors, tables (verified via scroll: cover page + content page with checklist tables both render correctly)
- [x] PowerPoint: tried `pptx-preview` npm package first — it parsed our pptxgenjs-generated file but detected 0 slides (structural incompatibility, confirmed via debug logging), so it was removed. Replaced with `PptSlidesPreview.tsx`, a content-accurate slide-by-slide mockup (cover, summary, one card per section with its criteria table, final section-summary table) built from the same `data` prop — same order/content as the real deck, with a caption explaining the visual template appears once opened in PowerPoint
- [x] All 4 `lib/downloads/*.ts` modules refactored: internal `build*`/generate* functions return the in-memory document (blob/workbook/presentation) without saving; both the direct-download path and the preview path call the same builder, so there's a single source of truth
- [x] Download button inside the preview modal still triggers a real save (regenerates fresh, cheap for all 4 formats)
- [x] Build passed; verified all 4 formats end-to-end with Playwright (desktop screenshots of every format, scroll-through of Word/PPT multi-page content, mobile viewport check, and a real download triggered from the preview modal's Download button)

**Decisions made:**
- PDF/Excel/Word previews are literally the generated file (or the exact same in-memory data), not a recreation — this is the strongest fidelity guarantee possible
- PPT could not reach the same bar: no reliable client-side .pptx renderer exists that's compatible with pptxgenjs output; rather than ship a blank/broken preview, shipped an honest content-accurate mockup and said so in the UI
- Kept regenerating the file on "Download" from the preview modal (rather than reusing the cached preview blob) for simplicity — the cost is sub-second and avoids stale-cache edge cases

**Blockers / next steps:**
- Supabase still not wired; chatbot still stub; no auth
- If a maintained pptx renderer becomes available (or a server-side conversion step is ever introduced), PPT preview could be upgraded to real rendering like the other 3 formats

---

### [2026-07-15 06:00 IST] Claude (claude-sonnet-5) — Total occupancy readout + project address fields
**Files changed:**
- Modified: `src/app/page.tsx`, `src/types/download.ts`, `src/lib/downloads/pdf.ts`, `src/lib/downloads/ppt.ts`, `src/lib/downloads/word.ts`, `src/lib/downloads/excel.ts`

**What was done:**
- [x] Added read-only "Total Occupancy" field to the dashboard's Project Information card — auto-sums Occupancy Fixed + Occupancy Floating
- [x] Added an Address fieldset: Country (defaults to `India`), State, City — all free-text inputs
- [x] `ProjectInfo` (page.tsx) gains `country`/`state`/`city`; `saveProjectInfo()` now also writes a computed `occupancyTotal` string for backward-compatible download consumption
- [x] `ProjectInfo` type in `src/types/download.ts` gains `occupancyTotal`, `country`, `state`, `city`
- [x] All 4 download formats (PDF, PPT, Word, Excel) updated to show Occupancy (Fixed/Floating/Total) and Address in their project-info tables/slides
- [x] Build passed; verified with Playwright screenshots on desktop (1280px) and mobile (390px) viewports — Total Occupancy computed correctly (200+30=230), Country prefilled to India
- [x] Committed + pushed to `claude/new-session-fqgdu4` (branch reset from latest `main` since PR #5 had merged); PR #6 opened as draft, marked ready, and merged by user

**Decisions made:**
- Total Occupancy is derived/read-only (not a stored independent field) to avoid drift from Fixed/Floating — computed both in the UI and again in `saveProjectInfo()` for the persisted payload
- Country/State/City kept as plain text inputs (not a dropdown) for simplicity; Country pre-fills to `India` by default per project's primary market

**Blockers / next steps:**
- Supabase still not wired; chatbot still stub; no auth
- Could later validate State against Indian state names or offer a country dropdown if multi-country projects are added

---

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

### [2026-07-14 IST] Claude (claude-sonnet-4-6) — Knowledge base + chatbot navigator

**Branch:** `claude/knowledge-base-chatbot`
**PR:** #3 (draft)

**Files changed:**
- `public/docs/index.json` — root index with all 4 rating systems, keywords, section metadata
- `public/docs/GRIHA-V6/` — README + 11 section .md files (01–11)
- `public/docs/GRIHA-V2019/` — README + 11 section .md files (01–11)
- `public/docs/GRIHA-V2015/` — README + 10 section .md files (01–10)
- `public/docs/IGBC-SB-2020/` — README + 7 section .md files (01–07)
- `src/components/layout/Chatbot.tsx` — complete rebuild as knowledge base navigator
- `src/app/globals.css` — added `kb-*` CSS classes for markdown rendering

**What was done:**
- [x] Created `public/docs/` knowledge base: 43 files (index.json + 4 READMEs + 38 section files)
- [x] Each section file contains criteria summary table, points breakdown, mandatory requirements, documentation requirements
- [x] Rebuilt `Chatbot.tsx` from scratch: three-view navigator (home → doc → section), no AI/RAG
- [x] Keyword scoring algorithm (`scoreDoc`, `findSections`) — pure string matching, no vector embeddings
- [x] Inline markdown renderer (regex-based, zero new npm dependencies): tables, headings, bold, code, lists, blockquotes, hr
- [x] Lazy loading: section .md files fetched on demand via `fetch('/docs/{id}/{section}.md')`
- [x] Breadcrumb navigation + back buttons in chatbot footer
- [x] Added `kb-content`, `kb-h1/h2/h3`, `kb-table`, `kb-table-wrap`, `kb-ul`, `kb-p`, `kb-code`, `kb-pre`, `kb-blockquote`, `kb-hr` CSS classes to `globals.css`
- [x] `npm run build` passes clean — 0 TypeScript errors, all 13 pages static

**Decisions made:**
- `public/docs/` chosen over root `docs/` — Next.js serves `public/` directly, accessible via `fetch('/docs/...')` from client components with no API routes needed
- Chatbot returns `null` when collapsed (vs previous CSS `width: 0`) — cleaner, avoids phantom DOM element
- Markdown rendering via inline regex (no new library) — keeps bundle size unchanged

**Blockers / next steps:**
- Chatbot search is keyword-only; no semantic understanding — users must use terms like "energy", "water", "rainwater", etc.
- README files in each folder are not yet surfaced in the chatbot (only used as reference for content authoring); could be added as a "Section Overview" view

---

## Pending / Known Gaps

- [ ] **Supabase not wired** — project is provisioned but no tables created and no client integration in the codebase yet
- [ ] **Chatbot uses keyword search only** — no AI/semantic understanding; future upgrade path is RAG or LLM integration
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
