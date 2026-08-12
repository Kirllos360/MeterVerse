# P58 — SECURITY RISK REPORT
**Date:** 2026-08-12 · **Zero-trust, no credentials printed**

## CRITICAL
| ID | Risk | Evidence | Impact | Mitigation |
|----|------|----------|--------|-----------|
| SEC-01 | **Horizontal privilege escalation** — no area/project data scoping enforced | `requireAccess` 0 uses; viewer role reads ALL customers live | Any user with read perm accesses all tenants' data | OD-01 fix (P0): enforce requireAccess + list scoping |
| SEC-02 | **Mock-only /me BFF** (was) — session restore bypass | `/api/auth/me` decoded fake tokens, real JWT 401 | auth state could be forged via localStorage | FIXED this phase → proxies backend (verified) |

## HIGH
| ID | Risk | Evidence | Impact | Mitigation |
|----|------|----------|--------|-----------|
| SEC-03 | Hardcoded mock creds in `auth-service.ts` | admin/admin, operator/operator in source | gated off by env flag but present in repo | Remove or strictly env-gated (keep current gate) |
| SEC-04 | `Meter/reference/all-last-update` — disguised vault w/ hardcoded creds in README | verified | credential exposure if copied | Never inherit; exclude from backups of business data |
| SEC-05 | `GitPush.cmd` blind `git add -A` | toolchain audit | could commit .env/secrets if present | add secret-scan gate; never commit .env (verified gitignored) |

## MEDIUM
| ID | Risk | Evidence | Impact | Mitigation |
|----|------|----------|--------|-----------|
| SEC-06 | JWT secret is dev-default (`dev-secret-for-local` / `mv-jwt-secret...` fallback) | .env + Start.cmd | predictable tokens if deployed with defaults | require env secret in production (deploy-prod.sh generates random 64-char — good) |
| SEC-07 | CORS allowed origins are localhost only | verified | fine for dev; must widen for prod domains | document prod CORS policy |
| SEC-08 | `X-Dev-Mode: true` header bypass in auth middleware | auth.js dev bypass | dev-only (NODE_ENV != production), but a footgun | confirm it's stripped in prod (verify NODE_ENV gate) |
| SEC-09 | Cloudflare token in gitignored `.env` | verified | local-only, acceptable; rotate before any share | rotate + env-managed secrets in prod |

## LOW / PASS
- `.env` + `.env.local` → gitignored ✅ · only `.env.example` committed ✅
- No `sk-`/`ghp_`/`AKIA`/`BEGIN PRIVATE KEY` secrets in tracked source ✅
- Session revocation works (logout → refresh 401) ✅
- MFA (TOTP via speakeasy) + lockout + rate-limit present ✅
- CSP/HSTS/nosniff headers present (next.config headers) ✅
- Audit trail: AuditEntry with actor/action/resource/before/after/correlationId ✅

## RECOMMENDED (ranked)
1. Fix SEC-01 (P0) — enforcement of area/project scoping
2. Confirm `X-Dev-Mode` bypass cannot reach production (add NODE_ENV guard verification)
3. Remove mock creds or keep strictly env-gated
4. Production: real JWT secret, managed secrets, TLS, CORS whitelist
5. Add automated secret scan to CI (e.g., gitleaks)
