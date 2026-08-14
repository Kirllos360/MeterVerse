# METERVERSE — SPEC KIT MASTER ROADMAP (P59-C/LR-2A)

**Spec Kit version:** 1.0.0 (validator.mjs) · **Reconciled with:** Master Graph v1.0.0 · **Date:** 2026-08-14
**Lifecycle:** CONSTITUTION → SPECIFY → CLARIFY → PLAN → CHECKLIST → TASKS → ANALYZE → IMPLEMENT → CONVERGE

## 1. Master Control Loop

```
CHANGE REQUEST → GRAPH IMPACT ANALYSIS → SPEC → PLAN → TASKS → DEPENDENCY CHECK
→ IMPLEMENT → TEST → GRAPH REVALIDATION → CONVERGE → SECURITY VALIDATION
→ OPERATIONAL VALIDATION → COMMIT → PUSH → POST-COMMIT GRAPH VALIDATION
```

## 2. Capability Roadmap (dependency-aware; reconciled with IMPLEMENTATION-DEPENDENCY graph)

| ID | Capability | Dependency | Target | Spec Type | Status |
|----|-----------|-----------|--------|-----------|--------|
| C-SETTLE | Settlement engine (FIXED/PERCENT/ONE_TIME) | none | settlement-engine.js + Settlement/InvoiceSettlement | vertical slice | **DONE (LR-2)** |
| C-CHARGE | ChargeRule per_unit/zero + cap | none | generateCharges + ChargeRule.upperLimit | cross-cutting | **DONE (LR-2)** |
| C-ISOLATE | Production/Test DB isolation | none | db-guard + live-guard | security hardening | **DONE (4D + LR-2)** |
| C-IMPORT | Solar Excel ImportJob (3 types) | none (no OBIS) | import-engine.js + routes/imports.js + xlsx | feature | **DONE (LR-3) — preview live-proven; EXECUTE gated on approval** |
| C-TENANCY | P59-B tenancy repair (639) | approvals #2-#6 | Customer/Meter/Reading/Invoice/Payment areaId | data repair | BLOCKED (stakeholder) |
| C-SOLAR | Solar wallet / net metering | OBIS decision | solar-wallet-engine.js | vertical slice | BLOCKED (OBIS) |
| C-SYMB | Symbiot/SEP protocol bridge | none | gateways service | infrastructure | PENDING (knowledge extract) |
| C-TAX | SBill tax seed config | none | TariffTax/InvoiceTax seed | migration | PENDING (safe) |
| C-CHEQUE | Cheque/POS/payment centers | settlement | Cheque/POSTerminal models | vertical slice | PENDING (evidence) |
| C-CHILLED | Chilled-water settlement | settlement + business scope | ChilledWater models | vertical slice | PENDING (business) |
| C-MIGRATE | SBill data migration | P59-B + OBIS | ImportJob/migration | migration | BLOCKED |

## 3. Spec Type → Lifecycle Mapping

| Spec Type | Flow |
|-----------|------|
| simple feature | SPECIFY → PLAN → TASKS → IMPLEMENT → CONVERGE |
| vertical slice | + CLARIFY + ANALYZE |
| cross-cutting | + dependency check + regression |
| infrastructure | + security + operational validation |
| migration | + rollback/recovery + data validation |
| security hardening | + attack-path validation |
| data repair | + freeze/approval gate + historical protection |
| legacy recovery | + graph impact + reuse classification |

## 4. Task Template (every task)

- ID, capability, dependency, exact file/module target, prerequisite, expected output, test, acceptance criteria, rollback/recovery, parallelism flag.

## 5. Consistency Rule

If GRAPH says A→B, Spec Kit must not execute B before A. If they disagree → STOP and resolve.
Graph revalidation runs after every converged change: `node docs/architecture/graph/validate-graph.mjs`.
