# REUSE AND CLONE CANDIDATES

**Decision framework:** every component classified exactly one of A–F (Direct Reuse / Adaptable / Clone / Reference / Obsolete / Business Review).

---

## Main Decision Table — "WHAT CAN WE TAKE?"

| Capability | Legacy Source | Evidence | Current MeterVerse | Reuse Type | Value | Risk | Recommendation |
|------------|---------------|----------|--------------------|------------|-------|------|----------------|
| Solar wallet / net metering | Collection System | business-rule-discovery.md (CR 2047 Excel, exact formulas) | Missing | **CLONE** | High | Medium | Recover algorithm → implement in MeterVerse tariff/ledger stack |
| Settlement engine (FIXED/PERCENT/ONE_TIME) | Collection System | charge_engine.py:74-112 | Missing (Settlement entity absent) | **CLONE** | High | Low | Port logic to MeterVerse billing engine |
| Tiered charge engine (STEPS/FLAT/STATIC/PER_UNIT/ZERO) | Collection System | charge_engine.py:1-50 | Partial (TariffTier/TariffRate) | **CLONE** | High | Low | Verify STATIC/PER_UNIT/ZERO; extend MeterVerse Tariff |
| Cheque processing | Collection System | models.py (`Cheque`) | Missing | **ADAPTABLE** | Medium | Medium | Add Cheque model + workflow |
| POS / payment centers | Collection System | models.py (`POSTerminal`, `PaymentCenter`, `BankAccount`) | Missing | **ADAPTABLE** | Medium | Medium | Add collection-center model |
| Chilled-water settlement | Collection System | ChilledWaterConfig/Settlement + operational PDFs | Missing | **BUSINESS REVIEW** | Medium | High | Confirm business scope before cloning |
| Reading review / thresholds | Collection System | ReadingReview, ReadingThreshold | Present (ValidationRule, Reading status) | **REFERENCE** | Low | Low | Keep current; borrow review-queue UX |
| Water balance | Collection System | WaterBalance | Partial (Consumption) | **REFERENCE** | Low | Low | — |
| Excel import templates (solar inv/pay) | Collection System | Solar_*_Import.xlsx | Present (ImportJob/ExcelJob) | **ADAPTABLE** | Medium | Low | Reuse XLSX templates/schema |
| Tax/fee composition (15% labour / 1% / 14% VAT) | SBill | architecture report | Partial (TariffTax, InvoiceTax) | **ADAPTABLE** | Medium | Medium | Mirror Palm-Hills rates as seed data |
| Fawry payment gateway | Energy360 | SBill architecture | Partial (PaymentGateway) | **ADAPTABLE** | Medium | Medium | Gateway config/flow reference |
| Symbiot protocol/MDM inventory | Symbiot (New folder 2) | sys_n README (5,952 files, 25+ protocols) | Planned (gateways) | **ADAPTABLE** | High | Medium | Use as source for SEP bridge protocol layer |
| SBill historical data (PalmHills/Energy360_V4) | SBill | database-analysis | — | **MIGRATE DATA** | High | Medium | Already-planned migration source |
| IMS UI pages | IMS | HTML pages | Present (superior UI) | **REFERENCE** | Low | Low | Theme/layout reference only |
| Collection RBAC (flask-login) | Collection | routes_api.py | Present (JWT+RBAC) | **OBSOLETE** | — | — | Reject |
| Collection report engine (fpdf2) | Collection | requirements | Present (reporting-engine) | **REFERENCE** | Low | Low | Reject code; reuse report content rules |

## Top Clone Candidates (highest value / lowest risk)

1. **Solar wallet algorithm** — exact formulas documented; missing in MeterVerse.
2. **Settlement engine** (FIXED/PERCENT/ONE_TIME) — small, self-contained, portable.
3. **Charge-type coverage** (STATIC/PER_UNIT/ZERO) — verify against MeterVerse Tariff engine.
4. **Excel solar import templates** — direct asset reuse.
5. **Symbiot protocol inventory** → SEP bridge design input.

## Top Components to Reject

1. Collection flask-login RBAC (MeterVerse JWT+permissions superior).
2. Collection fpdf2 reporting (MeterVerse reporting-engine superior).
3. IMS frontend code (MeterVerse shadcn/ui pages superior).
4. Collection SQLite stubs (empty).
5. Any 1.8.0/2.8.0 reading model merging into 5.8.0 (OBIS conflict — flagged).
