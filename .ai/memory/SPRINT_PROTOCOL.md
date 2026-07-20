# MeterVerse — Sprint Execution Protocol (required for all future sprints)

## Mandatory Sequence

Do NOT start coding until step 6 is complete.

### Step 1 — Read AI Memory
Read ALL files under `.ai/memory/`:
- `PROJECT_STATE.md`
- `CURRENT_SPRINT.md`
- `CHAT_HISTORY.md`
- `DESIGN_RULES.md`
- `ARCHITECTURE_RULES.md`

### Step 2 — Read Documentation
Read ALL relevant reports under `docs/reviews/` to understand context, previous decisions, and known issues.

### Step 3 — Regression Scan
Scan the entire repository for regressions:
- Verify all key files exist
- Check git status (no dirty working tree)
- Run `git log --oneline -5` to confirm last commits
- Verify build still passes (`npx next build`)

### Step 4 — Gap Analysis
For the requested sprint area, produce a structured gap analysis:
- What exists vs what's missing
- What was previously claimed vs what is actually delivered
- List every gap with evidence (file paths, line counts)

### Step 5 — Present Plan
Present a structured plan with:
- **Phases**: Ordered implementation steps
- **Risks**: What could go wrong and how to mitigate
- **Dependencies**: What must exist before each phase
- **Expected outcomes**: Measurable deliverables

### Step 6 — Wait for Approval
Stop and wait for user approval before writing any code.

### Step 7 — Implement
Execute the approved scope only. Do not add scope creep.

### Step 8 — Verify
- Run `npx next build` — must pass with 0 errors
- Run TypeScript check
- Test new pages render (HTTP 200)
- Verify no regressions in existing features

### Step 9 — Update Memory & Docs
- Update `PROJECT_STATE.md` with new sprint results
- Update `CURRENT_SPRINT.md` with sprint status
- Generate sprint report in `docs/reviews/`

### Step 10 — Commit & Push
- Use conventional commit format: `sprint N: description`
- Push to `origin clean-main:main`
