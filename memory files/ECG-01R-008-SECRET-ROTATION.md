# ECG-01R-008 — Rotate Weak/Reused Secrets

**Platform:** Security (Secrets Management)  
**Priority:** P1  
**Estimated Effort:** 1 day  
**Depends on:** None  

## Objective

Eliminate password reuse across areas and weak passwords from all `.env` files.

## Scope

### Files: All `.env` files

**backend\.env:**
- Generate unique `SYMBIOT_PASSWORD` per area (Areas 1, 2, 3, 8 currently share `H$gVFED$x+vSqQ3K`)
- Generate unique `SBILL_PASSWORD` per area (Areas 2, 3, 8 currently use `admin`)
- Generate strong random passwords (32+ characters, mixed case + digits + symbols)

**sync-gateway\instances\gateway-4*.env** (9 files):
- Generate unique `SYMBIOT_PASS` per gateway instance (all currently use `admin`)
- Generate unique `BILLING_PASS` per gateway

**admin-portal\.env** and **admin-console\.env**:
- Replace weak JWT secrets (`admln_portal_2026_enterprise_governance`, `admln_sec_2026_enterprise_governance`) with cryptographically random 64-byte values

### Audit

- After rotation, run `grep -r 'admin' .env` to verify no `admin` passwords remain
- Run `grep -ri 'password' .env --include='*.env'` to verify all passwords are unique spans

## Verification

- No two areas share the same Symbiot or sBill password
- No password is `admin`, `password`, `iskra`, or any dictionary word
- All JWT secrets are ≥64 character random strings
- All sync gateways still connect successfully after rotation
