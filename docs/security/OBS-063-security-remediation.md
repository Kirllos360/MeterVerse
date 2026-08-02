# OBS-063 — Security Remediation: Hardcoded Credentials in Legacy Repository

**Date:** 2026-08-01 · **Severity:** CRITICAL · **Status:** Tracked / No code imported

---

## 1. Issue Description

The legacy `Mete` repository (github.com/Kirllos360/Mete.git) contains **hardcoded production database credentials** committed to source:

- **File:** `backend/src/sync/sync-orchestrator.service.ts`
- **Contents:** a `SYMBIOT_DB` map with server names (`VM1`, `10.50.30.x`), database names (`PalmHills_October`, `PalmHills_NewCairo`, `SODIC`, `ABRAJ_UVENUS`), user `sa`, and the plaintext `sa` password (`H$gVFED...`), plus sBill admin credentials (iskra/admin).
- **Impact:** Any actor with repo access (or a compromised clone/fork) obtains live Symbiot SQL Server credentials → database read/write, meter data, billing integrity.

## 2. Confirmation: No Code Imported Into MeterVerse

- MeterVerse (`D:\meter`) is the canonical platform (Express + Prisma + Next.js).
- The `Mete` clone was used **read-only** for the P49.5 audit and **deleted from disk** afterward.
- **No sync-orchestrator code, no credentials, no `Mete` source was copied into MeterVerse.**
- MeterVerse's Symbiot connectivity uses `connection-profiles.js` + `credential-vault.js` (encrypted, env-based) — **never** hardcoded credentials.

**Verified:** grep of `D:\meter\backend` for the leaked patterns returned no matches (no `H$gVFED`, no `sa` password constants in MeterVerse source).

## 3. Remediation Steps

1. **Rotate credentials:** Change the Symbiot `sa` password and all sBill admin credentials immediately (they are compromised by being in git history).
2. **Purge `Mete` from git history** (or archive + delete the repo) — the secret is in commit history, not just HEAD.
3. **Scan all repos** for the leaked values (`git log -S 'H$gVFED' --all`) and purge via `git filter-repo` if present elsewhere.
4. **Do NOT reuse `Mete` sync code** as-is; if the sync bridge pattern is needed, reimplement against `credential-vault.js` + env vars.
5. **Add secret-scanning CI** (gitleaks/trufflehog in `.github/workflows` — MeterVerse already runs audit; add a dedicated secret scan gate).
6. **Update dependents:** any team member/documentation referencing the leaked repo credentials.

## 4. MeterVerse Secret-Management Policy

1. **Never commit secrets.** `.env` files are gitignored (verified); production config comes from environment variables.
2. **Use the credential vault** (`credential-vault.js` — AES encryption, env-derived key) for connection profiles.
3. **Connection profiles** (`connection-profiles.js`) store credentials encrypted; never plaintext in DB or code.
4. **CI secret-scan gate** on every PR (trufflehog/gitleaks) — fail on any secret pattern.
5. **Rotation policy:** any suspected leak → rotate immediately + log a Security incident.
6. **Repo governance:** legacy repos containing secrets are read-only references, never merged; deleted clones must not be restored.

## 5. Evidence

- P49.5 audit flagged `Mete` hardcoded creds (OBS-063).
- MeterVerse `backend/src/services/credential-vault.js` — encrypted credential storage.
- MeterVerse `connection-profiles.js` — encrypted DB connection config.
- `.gitignore` includes `.env`, `backend/.env`.
