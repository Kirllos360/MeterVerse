# Open Issues

**Date:** 2026-06-17
**Auditor:** OpenCode (DeepSeek V4 Flash)

## Open Issues

| ID | Severity | Description | Affected Tasks | Status |
|----|----------|-------------|----------------|--------|
| ISS-001 | HIGH | Payment reversal endpoint not implemented | T066 | ✅ RESOLVED |
| ISS-002 | HIGH | Customer statement endpoint not implemented | T067 | ✅ RESOLVED |
| ISS-003 | HIGH | US3 frontend pages on mock data (invoices, payments, balances) | T068-T072 | ✅ RESOLVED |
| ISS-004 | HIGH | No E2E tests for billing flows | T080, T084 | ✅ RESOLVED |
| ISS-005 | HIGH | No backup/restore drill performed | T084a | ✅ RESOLVED |
| ISS-006 | MEDIUM | Water-balance endpoint returns 404 (needs water meter data) | T048a | OPEN |
| ISS-007 | MEDIUM | project_thresholds table missing from DB | T046 | OPEN |
| ISS-008 | MEDIUM | refresh_tokens table missing from DB | T009 | OPEN |
| ISS-009 | MEDIUM | login_attempts table missing from DB | T009 | OPEN |
| ISS-010 | LOW | 1 HACK pattern in test file | — | OPEN |
| ISS-011 | LOW | endpoint-access test expects [200,404] but reversal returns 400 for non-UUID | T066 | OPEN |
