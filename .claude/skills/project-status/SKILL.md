---
description: Show current project status, architecture, and progress log for Harshz Green Building Automation. Use this at the start of any session to understand what's been done and what's pending.
---

# /project-status

Read `.claude/PROGRESS.md` and output a concise briefing:

1. **Project identity** — app name, GitHub repo, Vercel deployment, Supabase project
2. **What's built** — routes, features, state model, integrations
3. **Completed work** — sessions log with what was done
4. **Pending / known gaps** — what still needs to be done

After reading the file, summarise it clearly for the current session.

Then ask the user: "What would you like to work on today?" and remind them to update `.claude/PROGRESS.md` with any new work done before ending the session.

## Updating progress

After completing any meaningful work, append a new session entry to `.claude/PROGRESS.md` under **Completed Work** using this format:

```markdown
### Session: YYYY-MM-DD (Claude — <short description of session goal>)
- [x] Thing you completed
- [x] Another thing completed
- [ ] Thing that was started but not finished
```

Also move any items from **Pending / Known Gaps** to the session entry if they were resolved.
