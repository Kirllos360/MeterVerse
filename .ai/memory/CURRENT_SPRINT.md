# MeterVerse - Current Sprint

## P12.2-D Outbox Dispatcher + Ledger Consumer — CERTIFIED (2026-08-17)

**Goal:** complete the P12.2 outbox pipeline (producer → dispatcher → consumer).  
**Status:** CERTIFIED — stabilization + full live certification passed

| Item | Result |
|------|--------|
| Dispatcher | `backend/src/services/outbox-dispatcher.js` — claim (at-least-once via lock), dispatch to registered consumers, per-consumer EventDelivery, DeadLetter, backoff retry |
| Consumer | `backend/src/services/ledger-consumer.js` — idempotency, financialReplayGuard, shadow/active modes |
| Integration | `server.js` startup registers ledger consumer + periodic dispatch (guarded) |
| Migration | 20260817020000_add_event_deadletter_unique (one DeadLetter per event+consumer) applied LIVE |
| Fixes | EventDeadLetter @@unique (was missing — upsert failed); per-consumer delivery independent of PUBLISHED; ledger consumer logger import + call-time flags |
| Unit tests | 9 (dispatcher claim/publish/dead + consumer idempotency/shadow/guard/active/key/register) |
| Live cert | 10/10: enqueue→claim→dispatch→consumer→EventDelivery DELIVERED→PUBLISHED; no GL mutation in shadow; failure→DeadLetter DEAD; FK-ordered cleanup 0 remain |
| Runtime | one process per service (3131/3535/3003/3030 single listener), clean restart, no EADDRINUSE |
| Regression | 464 (446/18) |
| Verified | Graph 12/0/0, SpecKit 100%, FE tsc 0; browser Admin renders; Solar download 200 (23,649 B %PDF-) |
| Next | P12.2-E or next feature |


