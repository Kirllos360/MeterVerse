# METERVERSE vs LEGACY CAPABILITY MATRIX — P59-C/LR-1

**MeterVerse authoritative. Legacy = source material.**

## Capability Comparison

| Capability | Collection | IMS | SBill/Symbiot | MeterVerse | Verdict |
|------------|-----------|-----|--------------|-----------|---------|
| Customer mgmt | ✅ | ✅ (UI) | ✅ | ✅ | MeterVerse wins |
| Meter mgmt | ✅ | ✅ (UI) | ✅ | ✅ | MeterVerse wins |
| Readings | ✅ (register-based) | ❌ | ✅ (MPRTFk/5.8.0) | ✅ (single value) | **Gap: OBIS registers** |
| Reading review | ✅ (thresholds) | ❌ | partial | ✅ (ValidationRule) | MeterVerse wins |
| Tariff (tiered/flat) | ✅ | ✅ (UI) | ✅ | ✅ | Parity |
| Charge types (STATIC/PER_UNIT/ZERO) | ✅ (6 types) | ❌ | partial | partial (2 rule types) | **Legacy ahead — extract** |
| Settlement engine | ✅ (3 types) | ❌ | partial | ❌ | **MISSING — recover** |
| Solar wallet / net metering | ✅ | ❌ | ❌ | ❌ | **MISSING — recover** |
| Cheque processing | ✅ | ❌ | partial | ❌ | **MISSING — evidence-gated** |
| POS terminals | ✅ | ❌ | ❌ | ❌ | **MISSING — evidence-gated** |
| Payment centers/banks | ✅ | ❌ | ✅ | ❌ | **MISSING — evidence-gated** |
| Chilled-water settlement | ✅ | ❌ | ❌ | ❌ | **MISSING — evidence-gated** |
| Payments | ✅ | ❌ | ✅ | ✅ | MeterVerse wins |
| Customer ledger | ✅ | ❌ | ✅ | ✅ | Parity |
| Journal/GL | ✅ (simple) | ❌ | ✅ | ✅ (rich) | MeterVerse wins |
| RBAC | ✅ (roles) | ❌ | ✅ | ✅ (JWT+perms) | MeterVerse wins |
| Reporting | ✅ (PDF/Excel) | ✅ (UI) | ✅ (Jasper) | ✅ (engine) | MeterVerse wins |
| Notifications | ✅ (queue) | ❌ | ✅ (Fawry/Firebase/SMTP) | ✅ (rich) | MeterVerse wins |
| Import/export | ✅ (Excel) | ❌ | partial | ✅ (ImportJob) | Parity — **reuse templates** |
| Symbiot/meter protocols | partial (SEP job) | ❌ | ✅ (Symbiot MDM) | partial (gateways) | **Extract protocol knowledge** |
| Workflow/approvals | ✅ (simple) | ❌ | ❌ | ✅ (rich) | MeterVerse wins |
| Tenancy | area string | ❌ | per-area DBs | ✅ (Area + fail-closed) | MeterVerse wins |
| AI/analytics | ❌ | ❌ | ❌ | ✅ (rich) | MeterVerse wins |
| Governance | ❌ | ❌ | ❌ | ✅ (rich) | MeterVerse wins |

## Genuine MeterVerse Gaps (recovery candidates, ranked)

1. **Solar wallet / net metering** (Collection) — high value, medium effort
2. **Settlement engine** (Collection) — high value, low effort
3. **Charge types STATIC/PER_UNIT/ZERO caps** (Collection) — medium value, low effort
4. **Solar Excel import templates** (Collection) — medium value, low effort
5. **Symbiot protocol inventory** (New folder 2) — medium value, medium effort
6. **Cheque / POS / payment-center** (Collection) — medium value, medium effort (evidence-gated)
7. **Chilled-water settlement** (Collection) — medium value, high effort (business-gated)
8. **SBill tax configs (15%/1%/14%)** (SBill) — low value, low effort

## MeterVerse Superior (do not touch)

RBAC · reporting · ledger/GL · notifications · workflows · tenancy · AI · governance · dashboard · documents · customer portal.

## Conclusion

MeterVerse is architecturally ahead on **10+ capability families** and behind on **3-4 legacy-only capabilities** (solar, settlements, cheque/POS, chilled-water). The reuse strategy targets exactly those gaps — nothing else.
