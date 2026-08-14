# P59-C/LR-4 — APPROVAL CLOSURE PACKAGE

**Date:** 2026-08-14 · **Purpose:** concise, decision-ready approval requests for the two pending
technical approvals. **No approval is assumed. These are requests, not decisions.**

---

## REQUEST 1 — OBIS MODEL DECISION (blocks Solar Wallet)

**Status: PENDING (no explicit approval exists).**

### Why it matters
Solar net metering needs **directional** readings: import (consumption) vs export (production).
The legacy Collection System stores these as OBIS registers **1.8.0** (import) and **2.8.0**
(export). MeterVerse's core `Reading` model stores a single `value` — it cannot represent the
directional split required to compute solar surplus.

### Options

| Option | Change | Pros | Cons | Solar-compatible | Migration cost | Risk |
|--------|--------|------|------|------------------|----------------|------|
| **A** | Add nullable `obis180` + `obis280` fields to `Reading` | Minimal; direct solar support | Only directional, not combined | ✅ | Low (additive columns) | Low |
| **E** | Add directional fields AND support combined (5.8.0 = 1.8.0+2.8.0 aggregate) | Full fidelity (both concepts) | More columns, more mapping | ✅✅ | Medium | Low |

### Recommendation
**Option A short-term** (smallest safe change; enables solar wallet immediately), with **Option E**
as the long-term target (both directional + combined). Option A is additive and backward-compatible
— existing `Reading.value` is untouched.

### What approval unlocks
- Add `Reading.obis180`/`obis280` columns (additive migration).
- Implement `solar-wallet-engine.js` (net metering math, tiered tariff, wallet credit).
- Solar reading capture with registers.

### What stays blocked without approval
Solar wallet runtime + directional reading capture. Solar **import** and **settlement** are NOT
affected (they don't need OBIS).

---

## REQUEST 2 — SOLAR IMPORT EXECUTE APPROVAL (gated production mutation)

**Status: PENDING (no explicit approval exists).**

### Why it matters
The Solar Excel ImportJob (implemented + tested in LR-3) has a **preview** path (safe, non-mutating,
live-proven on 2796 rows / 0 invalid) and an **execute** path that writes Customer/Meter/Invoice/
Payment records to production.

### The distinction

| Path | Mutates production? | Validation | Rollback | Audit |
|------|--------------------|------------|----------|-------|
| **PREVIEW** (`POST /imports/upload/:type`) | **NO** — parse + row-validate + store job only | Schema + row validation | n/a (no write) | `import.preview` |
| **EXECUTE** (`POST /imports/jobs/:id/execute`) | **YES** — creates Customer/Meter/Invoice/Payment | Re-validates each row; failures counted | Manual (log of created IDs); partial-failure tolerated | `import.executed` |

### Approval scope requested
Approve EXECUTE for the **three solar import types only** (solar_customers, solar_invoices,
solar_payments), with these guarantees:
1. Every row re-validated before apply.
2. Failures logged per-row; partial success reported.
3. Idempotent: job status preview→completed, 409 on re-execute.
4. Does **NOT** touch the P59-B 639 frozen records.
5. Does **NOT** create OBIS/directional data (stays within existing models).
6. All writes audited; permission `documents.*` required.

### What stays blocked without approval
Production mutation via import. Preview remains available (safe).

---

## Consolidated decision table

| Request | Decision needed | Current status | If approved, unblocks |
|---------|-----------------|----------------|-----------------------|
| OBIS Option A | Add Reading.obis180/280 | **PENDING** | Solar wallet + directional reading |
| OBIS Option E (long-term) | Full directional+combined | **PENDING** | Future-proof register model |
| Import EXECUTE | Allow 3 solar import types to write | **PENDING** | Bulk solar customer/invoice/payment loading |

## Do NOT infer approval from this document
This file is a **request**. A decision requires explicit stakeholder confirmation (in conversation
or a signed artifact). Until then: solar wallet stays designed-only, import EXECUTE stays locked.
