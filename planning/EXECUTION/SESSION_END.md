# SESSION END — Completion Protocol

**Rule:** Every session must complete this file before finishing.

---

## Session Summary

| Field | Required |
|-------|:--------:|
| Session ID | YES |
| AI Model | YES |
| Duration | YES |
| Execution Ticket | YES |
| Steps Completed | YES |
| Steps Failed | YES |

## Completion Record

Every completion must include ALL fields. If any is missing, the session is incomplete.

| Field | Required | Value |
|-------|:--------:|-------|
| **Implementation** | YES | What was implemented |
| **Verification** | YES | How it was verified |
| **Evidence** | YES | Links to evidence files |
| **Remaining Risks** | YES | Any residual risks |
| **Known Limitations** | YES | What doesn't work yet |
| **Next Ticket** | YES | EXEC-XXXX for next session |
| **Confidence %** | YES | 0-100 |

## Information Classification Review

| Classification | Count | Action Taken |
|:--------------:|:-----:|--------------|
| KNOWN | | Used |
| ASSUMED | | Validated |
| UNKNOWN | | Resolved |
| BLOCKED | | Documented |

## State Update Checklist

- [ ] `CURRENT_PROJECT_STATE.md` updated (completion %, hash, next ticket)
- [ ] `CURRENT_TARGET.md` updated (new ticket number)
- [ ] `CURRENT_STATE.md` reset for next step
- [ ] `SESSION_CONTEXT.md` finalized
- [ ] `STATUS.yaml` files updated (STEP, TASK, PHASE)
- [ ] `AUDIT_ENGINE/` record created (mini audit)
- [ ] All evidence committed
- [ ] Repository pushed to GitHub

## Final Word

| Question | Answer |
|----------|--------|
| Was the ticket completed? | YES/NO/PARTIAL |
| Is the system better than before? | YES/NO |
| What would you do differently? | |
