# Final Recommendations

## Critical (must fix before production)
1. **Load testing** — Schedule before Wave 03 goes to production
2. **Penetration testing** — Security audit before production deployment
3. **DR plan + drill** — Database backup/restore must be verified
4. **Production environment** — Provision server, SSL, monitoring (T211)

## High (should fix within 2 waves)
5. **Contract tests** — Add T012 harness for API contract verification
6. **E2E test expansion** — Add Playwright journeys for billing flows (T080)
7. **RBAC expansion** — Add action-level permission gating (T077)
8. **i18n keys** — Inventory Arabic/English UI strings (T090)

## Medium (defer to Wave 05+)
9. **PDF generation** — Invoice/statement PDF output (T201)
10. **QR codes** — Invoice verification codes (T212)
11. **Data migration** — SBill → new system (T108)
12. **Constitution ratification** — Governance formalization (T085)
