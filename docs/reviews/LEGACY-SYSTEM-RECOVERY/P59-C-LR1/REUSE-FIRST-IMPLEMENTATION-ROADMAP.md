# REUSE-FIRST IMPLEMENTATION ROADMAP — P59-C/LR-1

**Principle:** maximum recovery + minimum new design/duplication/code. MeterVerse architecture preserved.

## Priority Order (P0–P4)

| Priority | Component | Classification | Depends On | Adapt Effort | From-Scratch Effort | Time Saved | Risk | Next Action |
|----------|-----------|---------------|------------|--------------|---------------------|------------|------|-------------|
| P0 | OBIS register model decision | — | OBIS-DECISION-MATRIX | 0.5d | 0.5d | ~0 | Medium | Approve Option A/E for Reading registers |
| P0 | P59-B tenancy decisions #2–#6 | — | stakeholder | — | — | — | High | Obtain approval (blocked) |
| **P1** | **Solar wallet / net metering** | B ADAPT | OBIS decision, Tariff | 3d | 8d | ~5d | Medium | Design spec (P59-C/LR-2) |
| **P1** | **Settlement engine** (FIXED/PERCENT/ONE_TIME) | B ADAPT | InvoiceItem pipeline | 1d | 3d | ~2d | Low | Design + implement (small) |
| P2 | Charge types STATIC/PER_UNIT caps/ZERO | B ADAPT | ChargeRule | 1d | 2d | ~1d | Low | Extend ChargeRule type enum |
| P2 | Solar Excel templates → ImportJob | A DIRECT | ImportJob | 0.5d | 1d | ~0.5d | Low | Adopt column schemas |
| P2 | Symbiot protocol inventory → SEP bridge doc | C EXTRACT | none | 1d | 3d | ~2d | Medium | Produce protocol inventory doc |
| P2 | SBill tax seed (15%/1%/14%) | C EXTRACT | none | 0.5d | 0.5d | ~0 | Low | Seed config |
| P3 | Cheque / POS / payment centers | F→B | evidence read | 2d | 4d | ~2d | Medium | Read full models + lifecycle |
| P3 | Chilled-water settlement | F→B | business scope | 3d | 6d | ~3d | High | Business confirmation |
| P3 | SBill data migration | B (migrate) | P59-B + OBIS | 5d+ | 5d+ | ~2d | High | After approvals |
| P4 | Energy360 portal UX | D REFERENCE | — | — | — | — | — | Reference only |
| P4 | Water balance | D REFERENCE | — | — | — | — | — | Reference only |

## Implementation Gate Criteria (only components meeting ALL)

| Component | Missing? | Valuable? | Evidence understood? | Faster than redesign? | No arch conflict? | No P59-B dep? | Security understood? | Test strategy? | **IMPLEMENT?** |
|-----------|----------|-----------|----------------------|-----------------------|-------------------|---------------|----------------------|----------------|----------------|
| Solar wallet | ✅ | ✅ | ✅ (runtime captured) | ✅ | ✅ (new service) | ⚠️ OBIS decision needed | ✅ | ✅ | **GATED — needs OBIS decision** |
| Settlement engine | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **YES (phase B candidate)** |
| Charge types | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **YES (small)** |
| Solar templates | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **YES (adapt)** |
| Cheque/POS | ✅ | ✅ | ⚠️ (models only) | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | **NO — more evidence** |
| Chilled water | ✅ | ✅ | ⚠️ (tests only) | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | **NO — business scope** |
| Symbiot protocols | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Doc only (C)** |

## Recommended First Implementation (Phase B candidates)

**Settlement Engine** (smallest, fully-qualified, no OBIS dependency) and **Charge-type extensions**:
- new `Settlement` Prisma model + `settlement-engine.js`
- extend `ChargeRule` type enum (add `zero`, add `upperLimit`)
- Solar wallet **design spec first** (needs OBIS decision — do NOT implement schema before it)

## Guardrails

- Never create a second ledger/invoice/tariff engine.
- Never import legacy Python/Flask architecture.
- Never touch the 639 P59-B records.
- Every implementation behind P59-C/LR-1 requires its own small implementation gate with tests.
- OBIS model decision must precede solar schema work.
