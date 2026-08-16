# P12-01 — FRONTEND INTEGRATION AUDIT

**Date:** 2026-08-15 · **Gate:** P12-01 · **Method:** api-client + page wiring verification

## API clients discovered
| Client | Location | Purpose | Prefix behavior | Status |
|--------|----------|---------|-----------------|--------|
| apiClient | lib/api-client.ts | BFF proxy calls | `BASE_URL("/api") + endpoint` — caller must NOT pass `/api` | A (works) |
| apiBackend | lib/api-client.ts | direct backend | normalizes `/api/...` correctly | A |
| getAuthHeaders | lib/api-client.ts | Bearer token | store → persisted → dev | A |
| FormData upload | upload page | multipart | uses getAuthHeaders (P60.5 fix) | A |
| ChequeActions fetch | cheques page | clear/reject | getAuthHeaders (P60.5 completion) | A |

## **Explicit audit target — apiClient double-prefix**
- **Truth:** `apiClient("/api/customers/x")` → `BASE_URL("/api") + "/api/customers/x"` = `/api/api/customers/x`.
- **Why it works:** the backend's route mount tolerates the extra `/api` (path normalization).
- **Verification:** `3131/api/api/meters` returns 401 (auth) not 404 → tolerated.
- **Classification:** **G-debt (hygiene)** — NOT a functional bug, but a contract inconsistency. Callers should use `apiBackend` (which normalizes) OR pass paths without `/api`. **Fix deferred** (changing could break working pages); recorded.

## Other findings
| Check | Result |
|-------|--------|
| Double prefixes | **1** (apiClient pattern, tolerated) |
| Wrong ports | none (proxy rewrites correct) |
| Stale endpoints | none found in sampled pages (upload/add-data/cheques/ingestion all current) |
| Duplicate API clients | none (single api-client.ts) |
| Mismatched response contracts | none found (transforms match backend shapes) |
| Hidden env assumptions | NEXT_PUBLIC_API_URL baked at build (P60 fix: profile-correct) |
| Admin vs portal isolation | admin→:3131, portal→:3003 (verified P60) |
| Error/loading/empty states | present in cheque/upload pages (P60.5/60.6) |

## Gap
- **G-020:** apiClient double-prefix hygiene (non-blocking, P4).
