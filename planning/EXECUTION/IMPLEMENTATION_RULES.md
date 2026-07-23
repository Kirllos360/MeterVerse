# IMPLEMENTATION RULES

**Rule:** Every implementation must follow these rules. No exceptions.

---

## Rule 1: One Ticket Only
Only implement the current Execution Ticket. Never implement future tickets.

## Rule 2: Never Skip Stages
Follow EXECUTION_ORDER.md lifecycle exactly. PRE-READ → UNDERSTAND → VERIFY → PLAN → IMPLEMENT → VERIFY → TEST → EVIDENCE → COMMIT → VERIFY → UPDATE → GATE.

## Rule 3: Information Classification
Every piece of information is EXACTLY ONE of:
- **KNOWN** — Verified by code or documentation
- **ASSUMED** — Reasonable inference, must validate
- **UNKNOWN** — Missing information, STOP
- **BLOCKED** — Cannot continue, STOP

## Rule 4: Never Implement on ASSUMED or UNKNOWN
If any information needed for implementation is ASSUMED or UNKNOWN, STOP. Validate first.

## Rule 5: Implementation Priority
1. Database (models, migrations)
2. Backend (services, routes, middleware)
3. API contracts (request/response)
4. Permissions
5. Frontend (components, pages)
6. Runtime (engines, events)
7. Tests
8. Documentation

## Rule 6: Scope Boundary
- Only implement the current Step
- Never implement future Steps in the same Task
- Never implement another Task
- Never implement another Phase
- Never refactor outside scope

## Rule 7: Never Say "Done"
Every completion must include ALL of:
- Implementation summary (what was done)
- Verification (how it was verified)
- Evidence (proof)
- Remaining Risks
- Known Limitations
- Next Ticket
- Confidence % (0-100)

If any field is missing, the step is automatically incomplete.

## Rule 8: Prefer Existing Patterns
- Frontend: GenericAdminPage config, shadcn/ui, React Query
- Backend: Express route pattern, Zod validation, requirePermission, auditLog
- Database: Prisma models, UUID PKs, @@index, soft delete

## Rule 9: No Guessing
If uncertain → check documentation. If still uncertain → STOP and ask.

## Rule 10: No Temporary State
- Never leave TODO, FIXME, HACK, or commented code
- Never leave console.log in production code
- Never leave dead code or unused imports
- Never commit without evidence
