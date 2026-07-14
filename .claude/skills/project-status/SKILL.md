---
description: Show current project status, architecture, and progress log for Harshz Green Building Automation. Use this at the start of any session to understand what's been done and what's pending.
---

# /project-status

Read `.claude/PROGRESS.md` and output a concise briefing covering:

1. **Project identity** — app name, GitHub repo, Vercel deployment, Supabase project
2. **What's built** — routes, features, state model, integrations
3. **Session log** — who worked on it, when, and what they did (newest first)
4. **Pending / known gaps** — what still needs to be done

After the briefing, ask: "What would you like to work on today?"

---

## MANDATORY: Log your session before ending

**Every AI — Claude, GPT, Gemini, Cursor, or any other — MUST add a session entry to `.claude/PROGRESS.md` before finishing work.** No exceptions.

### How to get the current IST timestamp

```bash
date -u -d '+5 hours 30 minutes' '+%Y-%m-%d %H:%M IST'
```

### Entry format — paste at the TOP of the Session Log section

```markdown
### [YYYY-MM-DD HH:MM IST] <AI name and model> — <one-line goal>
**Files changed:** list every file you touched
**What was done:**
- [x] Completed item
- [x] Another completed item
- [ ] Started but not finished

**Decisions made:** architectural or design choices made this session
**Blockers / next steps:** what to do next or what is blocked
```

### Rules

- Use IST (UTC+5:30) for all timestamps
- Include your AI name and model (e.g. `Claude (claude-sonnet-4-6)`, `GPT-4o`, `Gemini 2.5 Pro`)
- Place the new entry at the TOP of the Session Log (newest first)
- Move resolved items out of **Pending / Known Gaps** into your session entry
- Commit the updated PROGRESS.md along with your code changes
