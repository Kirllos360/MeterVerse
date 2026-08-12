# P58 — TOOLCHAIN REPORT
**Date:** 2026-08-12 · **Scope:** all startup/operations tools audited

## TOOL INVENTORY & STATUS
| Tool | Ports | Env | Profile | Failure handling | Verdict |
|------|-------|-----|---------|------------------|---------|
| _tools/Start.cmd | 3131/3535/3003/3030 ✅ | **P58-FIXED** (NEXT_PUBLIC_API_URL, NODE_ENV, JWT_SECRET, CORS_ORIGIN, PORT trailing-space) | admin+portal ✅ | health waits, logs ✅ | ✅ CLEAN |
| _tools/MainControl.cmd | DB 5433 ✅ | **P58-FIXED** (PORT ×3) | admin ✅ | pre-flight, auto-heal monitor, sleep-recovery ✅ | ✅ CLEAN |
| _tools/Stop.cmd | uses config vars ✅ | — | safe window-title taskkill ✅ | — | ✅ CLEAN |
| _tools/config.cmd | DB_PORT=5433 ✅, app ports ✅ | — | — | — | ✅ CLEAN |
| _tools/GitPush.cmd | — | — | blind `git add -A` | — | ⚠️ RISK (no secret gate) |
| _tools/Deploy.cmd | BE_PORT=3131 ✅ | prisma db push | — | health wait ✅ | ✅ CLEAN |
| _tools/DisasterRecovery.cmd | 3131/3535 hardcoded ✅ | — | backup/restore | — | ✅ CLEAN (verify pg path 5433) |
| _tools/SafetyCheck.cmd | — | — | pre-flight | — | ✅ CLEAN |
| _tools/FixTool.cmd | — | — | repair helper | — | ✅ CLEAN |
| _tools/StressTest.cmd | DB ✅, BE ✅ | **P58-FIXED** (PORT) | — | cycle loop ✅ | ✅ CLEAN |
| _tools/AdvancedTest.cmd | BE_PORT ✅ | — | extended tests | — | ✅ CLEAN |
| root Start.cmd | — | — | (legacy summary) | — | ✅ |
| scripts/start-all.mjs | all ✅ DB 5433 ✅ | `set X=value&&` correct already | admin+portal ✅ | waitHealthy ✅ | ✅ CLEAN |

## P58 FIXES APPLIED
1. `_tools/Start.cmd`: `set NEXT_PUBLIC_API_URL=http://localhost:%PORT% &&` → `&&` (×4) + NODE_ENV/JWT_SECRET/CORS_ORIGIN/PORT (×2 lines)
2. `_tools/MainControl.cmd`: `set PORT=%BE_PORT% &&` → `&&` (×3)
3. `_tools/StressTest.cmd`: `set PORT=%BE_PORT% &&` → `&&` (×1)

## VERIFIED SIMULATIONS
- Normal startup: 4 services up, health 200 ✅
- Portal gating: admin routes 404 on :3003 ✅
- CORS: Access-Control-Allow-Origin matches origin ✅
- BFF login both profiles ✅

## RISKS
- GitPush.cmd blind commit → add review gate
- DisasterRecovery.cmd hardcodes 3131/3535 (fine) but verify pg_dump path uses 5433 (was updated in P57)
- Turbopack dev-cache corruption remains a known dev fragility (clean + restart procedure)

## RECOMMENDATION
Add a **launcher regression check** (e.g., a `_tools/CheckLaunchers.cmd` or CI job) that scans for the `set X=value &&` trailing-space pattern and for stale ports, to prevent recurrence of the OD-class bug.
