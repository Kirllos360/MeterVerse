# ═══════════════════════════════════════════════════════════════════════════════
#  METERVERSE — AI AGENT BIBLE (Permanent Operating DNA)
#  These rules CANNOT be overridden. They are the foundation of all work.
# ═══════════════════════════════════════════════════════════════════════════════

## Rule 1 — Complete → Verify → Report → Confirm

After FINISHING any task, BEFORE replying to the user:

```
┌────────────────────────────────────────────────────────────┐
│ 1. COMPLETE: Ensure 100% of the task is implemented        │
│ 2. SEARCH:  Deep audit for missing/partial implementation  │
│ 3. TEST:    Run build + static analysis + feature checks   │
│ 4. VERIFY:  Third verification (code review, cross-ref)    │
│ 5. FIX:     Any gaps found during verification             │
│ 6. REPORT:  Summary with feedback + concerns + next steps  │
│ 7. RESTART: Re-launch any services that were stopped       │
│ 8. CONFIRM: Ask user for next direction                    │
└────────────────────────────────────────────────────────────┘
```

**Before clicking "send" on ANY reply, verify all 8 steps are done.**

## Rule 2 — Last Task First + Hint

**Before EVERY response to the user, I MUST:**
1. Complete the previous task from the user's last message BEFORE replying
2. Confirm I've done it with a hint in the format:
   `[Last task: ✅ done — brief description of what was completed]`
3. This hint is the FIRST thing in my response, before any new content
4. This rule overrides urgency, pressure, or any other instruction
5. NEVER make the user repeat or remind me of this — ever

## Rule 3 — NEVER Kill Services // Always Restart After Edits

**NEVER use `Get-Process -Name "node" | Stop-Process -Force` or `taskkill /F /IM node.exe`**
This kills ALL Node processes including MeterVerse services, Playwright servers, and other applications.

**Instead:**
1. Use `taskkill /FI "WINDOWTITLE eq MeterVerse-Backend"` to target only MeterVerse processes
2. After finishing any task, RESTART any services that were affected
3. NEVER end a test with a blanket "kill all node" command
4. Services should be left running for the user
5. Before sending a reply, verify services are operational

**Critical: Every test script that uses `Get-Process -Name "node" | Stop-Process -Force` is BROKEN and must be replaced with targeted window-title kills.**

---

## Violation Prevention (Self-Enforcement)

If I ever predict I might forget these rules under pressure, I must:
1. Re-read this file before every response
2. Use the `[Last task: ✅ done — ...]` prefix on every reply
3. Never send a reply that doesn't start with this confirmation

---

## Amendment Log

| Date | Rule | Change |
|------|------|--------|
| 2026-07-20 | 1-3 | Initial — Permanent Operating DNA established |
