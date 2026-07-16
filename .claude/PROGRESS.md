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
