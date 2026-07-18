# RP8 — Executive Remediation Plan

**Date:** 2026-06-17
**Source:** RP1-RP7
**Mode:** Enterprise Planning — No Implementation

---

## Executive Summary

The Operational Reality Certification (OR1-OR11) identified **32 operational gaps** across 10 domains. This remediation plan converts those gaps into **34 actionable tasks** across **4 implementation waves** with an estimated **25-week timeline**.

### Key Numbers

| Metric | Value |
|--------|-------|
| Operational gaps identified | 32 |
| Existing tasks reused | 13 |
| New tasks required | 17 |
| Non-task fixes (governance) | 2 (G013, G027) |
| Total remediation tasks | 34 |
| Estimated duration | 25 weeks (~6 months) |
| Critical path | 10 weeks (Database Foundation) |
| Parallel tracks | 7 maximum |
| Priority P0 gaps | 10 |
| Priority P1 gaps | 11 |
| Priority P2 gaps | 9 |
| Priority P3 gaps | 2 |

---

## 4-Wave Strategy

### Wave 1: Foundation & Governance (Week 1-10)
*10 tasks, ~10 weeks critical path*

**Focus:** Governance (T200), Database Foundation (T086→T087→T088), Document Output (T202→T201), Infrastructure (T211→T209), Symbiot (T091), CI/CD (T116)

**Must complete before Wave 2:**
- T200 — SYSTEM_DNA.md (governance blocker)

### Wave 2: Billing & Operations (Week 9-13)
*13 tasks, ~3 weeks*

**Focus:** Bill Cycle Governance (T203), Customer Resolution (T204), Duplicate Prevention (T206), Safe Regen (T208), QR+Hash (T212+T213), Contract Recon (T083), Quality (T080+T112+T113), DevOps (T210+T216), Due Date (T214)

**Must complete before Wave 3:**
- T203, T206, T208 — Core billing reliability
- T080 — E2E framework for frontend tests

### Wave 3: Standard Features (Week 14-17)
*6 tasks, ~4 weeks*

**Focus:** 16-Profile RBAC (T089), Cancel Invoice (T207), Meter Detail Wire (T205), RTL Tests (T215), 32 Reports (T102), Tasks.md (G013)

### Wave 4: Migration & Cutover (Week 18-25)
*4 tasks, ~8 weeks*

**Focus:** Solar Wallet (T107), SBill Palm Hills (T108), SBill Estates (T109), Collection Tracker (T110)

---

## Task Inventory Complete

| Task | Description | Priority | Effort | Wave | Gap(s) |
|------|-------------|----------|--------|------|--------|
| T200 | SYSTEM_DNA.md | P0 | 2d | 1 | G001 |
| T086 | Core DB Schema | P0 | 1w | 1 | — |
| T202 | Template Engine V3 | P0 | 2w | 1 | G006 |
| T087 | Features DB Schema | P0 | 2w | 1 | — |
| T211 | Production Environment | P0 | 1w | 1 | G021 |
| T209 | SSL/HTTPS | P0 | 2d | 1 | G019 |
| T088 | Area DB Template (×15) | P0 | 4w | 1 | G003, G004, G023 |
| T091 | Symbiot Bridge | P0 | 4w | 1 | G030 |
| T201 | PDF Generation Engine | P0 | 2w | 1 | G005 |
| T116 | CI/CD Pipeline | P0 | 3d | 1 | G009 |
| T203 | Bill Cycle Governance | P1 | 1w | 2 | G007 |
| T204 | Fix Customer/Unit Resolution | P1 | 1d | 2 | G012 |
| T206 | DB Unique Constraint | P1 | 4h | 2 | G016 |
| T208 | Safe Invoice Regeneration | P1 | 2d | 2 | G018 |
| T212 | QR Code Generation | P1 | 2d | 2 | G024 |
| T213 | Invoice Hash/Verification | P1 | 2d | 2 | G025 |
| T083 | Contract Reconciliation | P1 | 2d | 2 | G008 |
| T080 | E2E Coverage Expansion | P1 | 1w | 2 | G028 |
| T112 | Security Audit | P1 | 1w | 2 | G010 |
| T113 | Load Test | P1 | 3d | 2 | G011 |
| T210 | Monitoring/Alerting | P1 | 3d | 2 | G020 |
| T216 | Backup Automation | P1 | 1d | 2 | G032 |
| T214 | Invoice Due Date | P2 | 1d | 2 | G026 |
| T089 | 16-Profile RBAC | P2 | 1w | 3 | G022 |
| T207 | Cancel Invoice Endpoint | P2 | 1d | 3 | G017 |
| T205 | Wire Meter Detail Page | P2 | 1d | 3 | G015 |
| T215 | RTL/Responsive Tests | P2 | 2d | 3 | G029 |
| T102 | 32 Reports | P2 | 4w | 3 | — |
| G013 | Tasks.md Update | P2 | 1h | 3 | G013 |
| T107 | Solar Wallet Migration | P0 | 2w | 4 | G002, G031 |
| T108 | SBill Palm Hills Migration | P0 | 2w | 4 | G031 |
| T109 | SBill Estates Migration | P0 | 2w | 4 | G031 |
| T110 | Collection Tracker Migration | P0 | 2w | 4 | G031 |
| G027 | Smoke Script PATH Fix | P3 | 1h | — | G027 |

---

## Resource Requirements

### Estimated Effort by Domain

| Domain | Effort | % of Total |
|--------|--------|------------|
| Database Foundation | ~8 weeks | 32% |
| Migration & Cutover | ~8 weeks | 32% |
| Document Output | ~4 weeks | 16% |
| Billing Core | ~2 weeks | 8% |
| Quality & Testing | ~2 weeks | 8% |
| DevOps & Infrastructure | ~1 week | 4% |

### Team Recommendations

| Role | Count | Primary Responsibilities |
|------|-------|------------------------|
| Backend (NestJS/Prisma) | 2 | Database, PDF, Billing, Symbiot |
| Frontend (React/TypeScript) | 1 | Meter Detail, Reports, Tests |
| DevOps | 1 | CI/CD, Production, Monitoring, Backup |
| QA | 1 | Contract Tests, E2E, RTL, Load Tests |
| **Total** | **5** | — |

---

## Success Criteria

### End of Wave 1
- [ ] SYSTEM_DNA.md published and reviewed
- [ ] CI/CD pipeline operational
- [ ] Database schema foundation in place (T086+T087)
- [ ] Template Engine V3 ported to NestJS
- [ ] Production environment provisioned with SSL
- [ ] PDF generation engine producing test documents

### End of Wave 2
- [ ] Bill cycle governance workflow verified
- [ ] Invoice customer/unit resolution correct
- [ ] Duplicate invoice prevention enforced
- [ ] Invoice regeneration uses safe pattern
- [ ] QR codes and verification hashes on invoices
- [ ] All contract tests passing
- [ ] E2E test suite expanded
- [ ] Security audit passed
- [ ] Monitoring and alerting operational
- [ ] Automated backups verified

### End of Wave 3
- [ ] 16-profile RBAC operational
- [ ] Cancel invoice endpoint working
- [ ] Meter Detail Page fully wired
- [ ] RTL/responsive tests passing
- [ ] 32 reports available for export
- [ ] Tasks.md reflects actual state

### End of Wave 4
- [ ] Solar Wallet migrated and producing invoices
- [ ] SBill Palm Hills data migrated and verified
- [ ] SBill Estates data migrated and verified
- [ ] Collection Tracker data migrated and verified

---

## Overall Readiness Score Progression

| Phase | Score | Calculation |
|-------|-------|-------------|
| Current (before remediation) | 23% | OR10 board |
| End of Wave 1 | 35% | Foundation + Governance |
| End of Wave 2 | 65% | Billing + Quality + DevOps |
| End of Wave 3 | 80% | Polish + RBAC + Reports |
| End of Wave 4 | 100% | Migration complete |
