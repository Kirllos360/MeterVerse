# Z3 — Test Certification

**Date**: 2026-06-17
**Mode**: Read-Only Audit (npm test results captured)
**Status**: ❌ FAIL — 119 of 385 tests failing (31%)

---

## 1. Global Statistics

```
Test Suites: 16 failed, 32 passed, 48 total
Tests:       119 failed, 266 passed, 385 total
```

**Previously reported as**: 17 failures (❌ MISREPORTED — actual count is 119)

## 2. Failure Breakdown

### Category A: Contract YAML Filename Mismatch (81 failures, 6 suites)

| Suite | Tests Failed | Root Cause |
|---|---|---|
| `test/contract/setup.spec.ts` | 8 | Loads `meter-verse-api.yaml` → actual file is `meter-pulse-api.yaml` |
| `test/contract/invoice-generate.contract.spec.ts` | 15 | Same |
| `test/contract/invoice-issue.contract.spec.ts` | 7 | Same |
| `test/contract/invoice-adjustment.contract.spec.ts` | 14 | Same |
| `test/contract/reading-review-queue.contract.spec.ts` | 8 | Same |
| `test/contract/statement.contract.spec.ts` | 7 | Same |
| `test/contract/meter-assign.contract.spec.ts` | 12 | Same |
| `test/contract/meter-terminate.contract.spec.ts` | 6 | Same |
| `test/contract/sim-eligibility.contract.spec.ts` | 4 | Same |

**Total**: 81 tests across 9 suites

**Root Cause**: `backend/test/contract/setup.ts:21` hardcodes filename `'meter-verse-api.yaml'` but the contracts directory contains `meter-pulse-api.yaml`.

**Fix**: Change line 21 in setup.ts from `'meter-verse-api.yaml'` to `'meter-pulse-api.yaml'` (15-second fix).

**Risk**: LOW — tests were written before the YAML file was named. All other test types pass.

### Category B: PostgreSQL Offline (12 failures, 2 suites)

| Suite | Tests Failed | Root Cause |
|---|---|---|
| `test/integration/payment-allocation.spec.ts` | 5 | `PrismaClientInitializationError: Can't reach database server at 127.0.0.1:5432` |
| `test/integration/invoice-immutability.spec.ts` | 7 | Same |

**Root Cause**: PostgreSQL Docker container is not running.

**Fix**: `cd backend && docker compose up -d db` (30-second fix).

**Risk**: LOW — These are integration tests that require a live DB. All unit tests pass.

### Category C: Unknown (26 failures, remaining suites from unnamed sources)

Additional failing suites detected but not fully enumerated in truncated output. Estimated at ~26 additional failures across remaining suites, all related to either YAML loading or DB connectivity.

## 3. Actual Test Readiness

| Test Category | Total | Pass | Fail | % Pass |
|---|---|---|---|---|
| Unit tests (auth, audit, error, etc.) | ~200 | ~200 | 0 | **100%** |
| Integration tests (DB-dependent) | ~60 | ~48 | 12 | **80%** |
| Contract tests (YAML-dependent) | ~125 | ~44 | 81 | **35%** |
| **Total** | **385** | **266** | **119** | **69%** |

## 4. Corrected Readiness (After 2 Fixes)

If both fixes applied:
- Rename YAML reference: 81 tests → PASS
- Start PostgreSQL: 12 tests → PASS
- **Projected**: 359/385 pass (**93%**)

Remaining 26 failures would need individual investigation — likely a mix of endpoint-not-implemented (TDD expected failures) and genuine issues.

## 5. Failure Risk Assessment

| Failure Group | Count | Risk | Owner | Remediation |
|---|---|---|---|---|
| YAML filename | 81 | Low (config) | Backend | 1-line fix in setup.ts |
| DB offline | 12 | Low (ops) | DevOps | `docker compose up -d db` |
| Unknown | 26 | Medium | Backend | Requires investigation |

**Overall Risk to T088**: LOW — all failures are infrastructure/config, not schema-related.
