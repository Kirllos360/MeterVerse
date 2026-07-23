# Wave 01 — Enterprise Hardening

**Status:** PLANNING  
**Target:** Phase 42  
**Duration:** 3 sub-phases (42a, 42b, 42c)

## Objectives
1. Fix domain.js — unblock 18 domain entities
2. Add 20+ database indexes — prevent query degradation
3. Wire remaining 12 notification events
4. Add export for all entities
5. Create customer/meter/invoice detail pages

## Dependencies
- Phase 42a must complete before 42b
- 42b and 42c can run in parallel

## Risk Summary
- Database indexes are non-breaking — safe to add anytime
- domain.js fix is critical path — blocks 18 entities
- Notifications and detail pages are independent
