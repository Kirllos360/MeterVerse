# ChatGPT Enterprise Prompt — MeterVerse Knowledge Base & Wave Plan

**Instructions for ChatGPT:** Read this entire prompt. It contains the complete Enterprise Knowledge Base for MeterVerse, extracted from:
- Planning OS (30 governance layers)
- Prisma schema (78 models)
- 8 Excel files with real business data (1.5M+ records)
- Codebase analysis
- User interviews

## Your Task

1. Read the Knowledge Base below
2. Identify what's KNOWN (confidence 70%+)
3. Identify what's UNKNOWN (confidence < 70%)
4. Identify ASSUMPTIONS that need confirmation
5. Generate a consolidated list of ONLY the remaining questions
6. Propose a complete Wave plan (02-10) covering ALL features

---

## ENTERPRISE KNOWLEDGE BASE

### 01 — Company Profile
**KNOWN:** Property management/utility billing company. Areas: Golf Extension, October, Palm Central, The Crown. Arabic language. EGP currency. Egyptian operations.
**CONFIDENCE:** 80%
**UNKNOWN:** Legal company name. Registration details. Number of employees. Current software stack.

### 02 — Business Model
**KNOWN:** Third-party utility management for residential communities. Monthly billing per meter.
**CONFIDENCE:** 70%
**UNKNOWN:** Revenue model. Margin structure. Client contracts.

### 03 — Areas
**KNOWN:** 4 confirmed areas (Golf, October, Palm, Crown). Area field exists on Customer, Meter, User models.
**CONFIDENCE:** 100%
**UNKNOWN:** Whether each area has separate infrastructure (VM, DB, domain). Total area count.

### 04 — Projects
**KNOWN:** Project model exists with Organization FK. Projects are sub-divisions within areas (e.g., Golf Extension phases).
**CONFIDENCE:** 70%
**UNKNOWN:** Project hierarchy depth. Project-specific tariffs.

### 05 — Meter Types
**KNOWN:** 4 types from Excel: Water, Electricity, Solar, BTU. Meter.type field in schema.
**CONFIDENCE:** 100%
**UNKNOWN:** Full type list. Reading units per type. Installation/maintenance tracking.

### 06 — Customer Types
**KNOWN:** Residential (villa owners), Commercial. Customer model exists.
**CONFIDENCE:** 70%
**UNKNOWN:** Customer segmentation. Business vs residential pricing.

### 07 — Tariff System
**KNOWN:** Tariff model with rates and tiers exists. ChargeRule model exists.
**CONFIDENCE:** 60%
**UNKNOWN:** How tariffs are applied per area/project. Tariff update process (one-update-all-areas?). Tariff control center requirements.

### 08 — Billing Model
**KNOWN:** Monthly invoices per meter. Opening balance tracking. Billing status (Yes/No). Invoice, InvoiceItem, BillCycle, BillRun models exist.
**CONFIDENCE:** 85%
**UNKNOWN:** Invoice calculation formula. Who generates invoices. Late fee policy.

### 09 — Collections
**KNOWN:** 1.5M+ payment records across 4+ years. Payment methods: POS, Cash, Bank Transfer, Online. Water Collection (1,047,034 rows). Electricity Collection (~500,000 rows). Payment, PaymentGateway, PaymentTransaction models exist.
**CONFIDENCE:** 100%
**UNKNOWN:** Reconciliation process. Partial payment handling. Collection workflow (reminders, disconnection).

### 10 — Financial Model
**KNOWN:** Customer ledger concept (balance = invoices - payments). No dedicated ledger model.
**CONFIDENCE:** 60%
**UNKNOWN:** Double-entry accounting needs. GL codes. Financial period closing. Aging reports.

### 11 — External Systems
**KNOWN:** SYMBIOT is the primary external system for meter data. No other systems confirmed.
**CONFIDENCE:** 50%
**UNKNOWN:** Other external systems. Payment gateways. Accounting/ERP integration.

### 12 — SYMBIOT
**KNOWN:** SYMBIOT connects to physical meters, collects daily readings, stores them in its own database. MeterVerse connects as an admin user via API.
**CONFIDENCE:** 90%
**UNKNOWN:** Auth method. API endpoints. Data format. Push vs pull. One SYMBIOT per area or central.

### 13-15 — Personas (Admin, User, Field Operator)
**KNOWN:** Admin (System A — 53 pages), User (System B — 19 dashboard pages), Field Operator (implied by meter reading workflows).
**CONFIDENCE:** 80%
**UNKNOWN:** Field operator mobile app requirements. Customer self-service portal. Offline reading collection.

### 16 — Mobile
**KNOWN:** No mobile app built. Wave 06 plans mobile API.
**CONFIDENCE:** 70%
**UNKNOWN:** Native app vs PWA. Offline support. Field reading capture. Photo/document capture.

### 17 — Permissions
**KNOWN:** 57 permission keys. requirePermission() middleware. 5 roles. Only 8/21 routes use it. 9 operation types needed (view, add, edit, activate, deactivate, terminate, archive, delete, future).
**CONFIDENCE:** 95%
**UNKNOWN:** Custom role creation. Per-user vs per-role. Area-based permissions.

### 18 — Workflows
**KNOWN:** Customer Onboarding workflow documented. Meter-to-Payment workflow documented. State machines for Invoice, Customer, Meter.
**CONFIDENCE:** 80%
**UNKNOWN:** Approval workflows (who approves invoices, contracts, tariffs, refunds). SLA policies.

### 19 — Reports
**KNOWN:** ReportDefinition model. KpiDefinition model. 6 KPI targets. Excel-based reports currently.
**CONFIDENCE:** 70%
**UNKNOWN:** Standard report list. Report formats (PDF, Excel). Scheduled report requirements.

### 20 — AI Knowledge
**KNOWN:** ai-engine.js exists. KPI engine exists. Alert engine exists. Monitoring middleware exists.
**CONFIDENCE:** 80%
**UNKNOWN:** AI feature roadmap (forecasting, anomaly detection, chatbot). ML model requirements.

---

## OPERATIONAL POLICIES NEEDED

| Policy | Current Status |
|--------|---------------|
| Who approves invoices? | ❌ Not defined |
| Who approves contracts? | ❌ Not defined |
| Who approves tariffs? | ❌ Not defined |
| Who can delete readings? | ❌ Not defined |
| Who can cancel invoices? | ❌ Not defined |
| Who can terminate service? | ❌ Not defined |
| Who can reopen invoices? | ❌ Not defined |
| Who approves refunds? | ❌ Not defined |
| Who can archive customers? | ❌ Not defined |
| Who can activate customers? | ❌ Not defined |
| Who approves payment adjustments? | ❌ Not defined |
| Maximum reading delay SLA | ❌ Not defined |
| Invoice generation deadline | ❌ Not defined |
| Payment grace period | ❌ Not defined |
| System uptime requirement | ❌ Not defined |
| Backup frequency | ❌ Not defined |

---

## NON-FUNCTIONAL REQUIREMENTS NEEDED

| Requirement | Current |
|-------------|---------|
| Expected total customers | Unknown |
| Expected total meters | Unknown |
| Expected readings per day | Unknown |
| Expected invoices per month | Unknown |
| Expected concurrent users | Unknown |
| Expected uptime | Unknown |
| Expected response time | Unknown |
| Expected backup/restore time | Unknown |

---

## COMPLETE WAVE PLAN (Updated)

### Wave 01 — Enterprise Hardening ✅ COMPLETE
8 phases, 37 tasks, 185 steps. All verified.

### Wave 02 — User Experience & Communication 🔄 IN PROGRESS
Phase 43a: User Workspace (Tasks, Search, Command Palette, Preferences) — ✅ DONE
Phase 43b: Communication (WebSocket, Email, SMS, Push) — ⏳ T05 done, T06-T08 pending
Phase 43c: Documents & Files
Phase 43d: UX & Admin Control Panels (15 tasks)
Phase 43e: SYMBIOT Integration (NEW)

### Wave 03 — Enterprise Billing & Tariff
Phase 44a: Tariff Engine
Phase 44b: Billing Pipeline
Phase 44c: Collections & Payments
Phase 44d: Billing Compliance
→ **UPDATE: Add Tariff Control Center (one-update-all-areas)**

### Wave 04 — Platform Hardening & Scale
Phase 45a: Performance
Phase 45b: Security
Phase 45c: Multi-Tenancy
Phase 45d: Observability
Phase 45e: Disaster Recovery

### Wave 05 — AI & Intelligence
Phase 46a: AI Engine
Phase 46b: Analytics
Phase 46c: Automation
Phase 46d: Integrations

### Wave 06 — Mobile & Enterprise Release
Phase 47a: Mobile API
Phase 47b: Enterprise Release
Phase 47c: Post-Launch

### Wave 07 — Enterprise Financials (NEW)
Phase 48a: Customer Ledger
Phase 48b: Accountant Ledger
Phase 48c: Payment Center
Phase 48d: Collection Automation
Phase 48e: Financial Reports

### Wave 08 — Meter Infrastructure (NEW)
Phase 49a: SYMBIOT Full Integration
Phase 49b: Meter Control Center
Phase 49c: SIM Card Management
Phase 49d: Measurement Point Management
Phase 49e: Reading Pipeline Automation

### Wave 09 — Multi-Area Platform (NEW)
Phase 50a: Multi-Area Infrastructure
Phase 50b: Arabic/English UI
Phase 50c: Area-Specific Configuration
Phase 50d: Cross-Area Reporting

### Wave 10 — Enterprise Intelligence (NEW)
Phase 51a: Smart Alert System
Phase 51b: Chat Engine
Phase 51c: Reminder/Note Engine
Phase 51d: Predictive Analytics
Phase 51e: Digital Twin Foundation

---

## THE ONLY REMAINING QUESTIONS

After extracting everything known, here are the UNKNOWNS that require your input:

### Priority 1 — Blocks Wave 02 Completion
1. SMTP credentials for email sending? (T06)
2. Twilio/Vonage account for SMS? (T07)
3. Firebase project for push notifications? (T08)

### Priority 2 — Blocks Wave 03 (Billing)
4. How are invoice amounts calculated? (Consumption × Tariff + Fees?)
5. Who approves invoices before they're sent?
6. Are late fees applied? How calculated?
7. What is the billing cycle? (Monthly confirmed?)

### Priority 3 — Blocks Wave 08 (Meter Infrastructure)
8. SYMBIOT API documentation — can you share it?
9. Does each area have its own SYMBIOT instance?
10. Are there SIM cards in the meters that need management?

### Priority 4 — Blocks Wave 07 (Financials)
11. Do you need double-entry accounting (debit/credit)?
12. What financial reports are required?
13. Is there an existing accounting system to integrate with?

### Priority 5 — Long-term
14. Target customer count in 5 years?
15. Target countries beyond Egypt?
16. Mobile app — native or web-based?
17. Customer self-service portal required?
18. Field operator mobile app required?

---

## EXECUTION INSTRUCTION

1. Read the Knowledge Base above
2. Generate ONLY the unanswered questions from Priority 1 as a clean list
3. Create the complete Wave 02-10 directory structure in planning/001_WAVES/
4. Each wave must have WAVE_VISION.md, phases with PHASE_STATUS.yaml, tasks with TASK_STATUS.yaml, steps with STEP_STATUS.yaml and 20 planning documents
5. Each T99 phase audit must be present
6. Each task must have completion criteria
7. Push all changes to https://github.com/Kirllos360/MeterVerse/tree/clean-main

---

*Generated from Enterprise Knowledge Base — 31_ENTERPRISE_KNOWLEDGE_BASE/*
