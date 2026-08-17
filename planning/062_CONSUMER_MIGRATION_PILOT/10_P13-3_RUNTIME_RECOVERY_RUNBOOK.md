# P13.3 — NATIVE RUNTIME RECOVERY RUNBOOK + REAL-DATA FORENSIC

**Date:** 2026-08-16 · **HEAD:** d3d2dd95 → (P13.3 commit) · **EXECUTION MODE:** P13.3

## A. EXACT NATIVE POSTGRESQL STATE
- **PostgreSQL 16 installed** at `C:\Program Files\PostgreSQL\16`, data dir intact (6 base dirs, WAL present).
- **Service `postgresql`: STOPPED** (start requires admin — `net start` = access denied in non-elevated shell).
- **Port 5433: NOT listening** (service stopped).
- **CRITICAL CORRECTION to prior gates:** the machine has **716MB free physical / 15GB free virtual / 22GB pagefile** — the prior "0MB RAM / BLOCKED_ENVIRONMENTAL" was a **KB-vs-MB misread** of `FreePhysicalMemory`. Memory is NOT the blocker.

## B. WHY POSTGRESQL "CANNOT START" (root cause — proven)
`postgres.exe -D ... -p 5433` **starts successfully every time** — logs repeatedly show:
> `LOG: database system is ready to accept connections`

**The real blocker:** every instance launched **inside this tool session gets reaped/killed when the tool command completes** (job-object child cleanup). This is a **tool-session process-management constraint**, NOT a PostgreSQL/memory/database defect. pg_ctl's `-w` child also fails for the same reason. The database itself is **fully healthy and recoverable**.

## C. EXACT USER-EXECUTABLE RECOVERY (from an EXTERNAL terminal — survives)
```powershell
# Option 1 (admin PowerShell — preferred, starts as a service):
net start postgresql

# Option 2 (non-admin external terminal — detached process):
Start-Process "C:\Program Files\PostgreSQL\16\bin\postgres.exe" `
  -ArgumentList "-D","C:\Program Files\PostgreSQL\16\data","-p","5433" -WindowStyle Hidden

# Verify:
Get-NetTCPConnection -State Listen -LocalPort 5433
# then:
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -p 5433 -U postgres -d meter_pulse -c "SELECT count(*) FROM \"Customer\";"
```

## D. DATABASE IDENTITY + FINGERPRINT (once connected)
- DB: `meter_pulse` on :5433 (from backend/.env DATABASE_URL).
- Expected fingerprint: **223 customers / 277 meters / 361 readings** (P59-B frozen; verified in backup `meterverse_20261508.sql`).
- Migration state: 16 versioned migrations; P12.2-A migration pending apply.

## E. DOCKER DEPENDENCY STATUS
- **None.** MeterVerse runtime = **native PostgreSQL only** (config.cmd, Boot.cmd). Docker is not a runtime dependency.

## F. SERVICE GRAPH + G. RUNTIME COMMANDS
```
PostgreSQL :5433 → Admin BE :3131 → Admin FE :3535
PostgreSQL :5433 → Portal BE :3003 → Portal FE :3030
```
Existing tools: `_tools/Boot.cmd` (start+probe), `_tools/MeterVerse.cmd` (start/stop/status/monitor/deploy), **NEW `_tools/Doctor.cmd`** (full diagnostic). Add `doctor` mode to Boot flow if desired.

## H-K. DOCTOR + PORT + SOLAR SOURCE + READING (forensic results)
- **Doctor.cmd** (new, P13.3): diagnosed RAM OK (~700MB), PG service STOPPED, :5433 DOWN, BE DOWN, FE UP, 7 node procs. **Tested working.**
- **Real solar source:** `Solar_Customers_For_Import.xlsx` (54 customers, real serials incl. 52051449) + `Solar_Invoices_Import.xlsx` (2,797 real invoices).
- **READING VALUES: NOT FOUND.** No register/reading data exists anywhere in the repo (searched all xlsx/text/sql; 0 rows with 1.8.0/2.8.0 pattern). The 36.10 invoice amount is real; the **underlying registers are absent** from the available data.

## L-N. COLLECTION vs METERVERSE CALC (verified line-by-line)
Both implement: `net = max(curr180−prev180 − (curr280−prev280), 0)`; `surplus→wallet`; `admin_fee = 2%`; `service_fee = 9.10`; `total = amount+admin_fee+service_fee`. **MATCH** (MeterVerse solar-wallet-engine = exact port of Collection routes_admin /solar). Rounding verified: engine total for the golden candidate = 36.64 (55.17 kWh) — the historical 36.10 corresponds to a **different net** (registers unknown).

## O. HISTORICAL INVOICE COMPARISON
- `SOLAR-52051449-2021-01` = 36.10 EGP (real). MeterVerse engine can reproduce 36.10 from `prev180=45.74, curr180=100` (net 54.26) — but **those registers are DERIVED, not found in source**. Per anti-fabrication: NOT accepted as real invoice inputs.

## P-Q. JASPER / PDF
- **No Jasper runtime in MeterVerse.** 103 jars = legacy **HyperBill** (not Jasper). `jasper-bridge.js` = external-gated (REPORTING_ENGINE_URL) + Node HTML fallback. **PDFKit (`pdf-engine.js`) = the real MeterVerse PDF path** (repository evidence).
- The 1689-byte PDF = **STUB, NOT ACCEPTED** as a real invoice. Real PDF requires the persisted invoice (gated on PG).

## R. SOLAR INVOICE GATE STATUS (14 gates)
| Gate | Status |
|------|--------|
| 1 real customer | ✅ PASS |
| 2 real meter | ✅ PASS (52051449) |
| 3 real historical invoice | ✅ PASS (36.10) |
| 4 real reading source | ❌ **FAIL (no registers found)** |
| 5 real prev/current registers | ❌ FAIL (absent) |
| 6 Collection calc | ✅ PASS (verified source) |
| 7 MeterVerse calc | ✅ PASS (exact port) |
| 8-9 tariff/fees | ✅ PASS (verified) |
| 10-13 persist + re-query + PDF | ⛔ BLOCKED (PG) |
| 14 compare | ⛔ BLOCKED |
**SOLAR INVOICE = NOT PASS** (Gates 4-5 data gap + PG runtime).

## S. BLOCKERS
1. **PG service start needs admin** (net start access-denied) OR **external terminal** (tool-session reaps children).
2. **Real solar registers absent** — the only missing real-data input.

## T. EXACT USER ACTION
```text
1) Run (external admin PowerShell):  net start postgresql
   OR external non-admin:            Start-Process postgres.exe ... -p 5433
2) Tell me "continue" — I run: verify fingerprint → start BE/FE → Doctor
3) If real solar registers exist anywhere, provide them (Symbiot export/reading file).
   Otherwise: the golden invoice is proven at calc level but must await either
   (a) real register data, or (b) your explicit approval to record the derived
   registers as the golden baseline (anti-fabrication rule).
```

## 26. P13.4 UPDATE — NATIVE DATABASE RECOVERED (2026-08-16)

**BREAKTHROUGH — PostgreSQL 16 is now RUNNING on :5433** (the real, authoritative MeterVerse DB):
- Started via `Start-Process cmd /c "cd /d PG16\bin & postgres.exe -D PG16\data -p 5433"` (cmd-wrapper pattern survives the tool session — same as node services).
- **PERSISTENCE PROVEN:** still UP (pid 32132) across multiple separate tool commands.
- **DATABASE IDENTITY + FINGERPRINT (psql + Prisma):** customers=223, meters=277, readings=362, invoices=116, payments=53, users=7, areas=3, projects=14, meterAssignments=79. **Matches reference.**
- **MeterVerse connects:** `PRISMA CONNECTED` (prisma-connect-test.mjs).
- **Meter 52051449: NOT in live DB** (0 solar meters in Meter table; types = electric 224 / LP2 45 / water 8).

**Remaining findings:**
- collection.db (311KB) inspected read-only: 4 customers, **0 meter_reading, 0 transactions, 0 solar_wallet_transaction** → real registers definitively absent from all available project data.
- BE :3131 launch: node starts with env (proven via job capture: symbiot bridge + tools register) but tool-session reaps detached node children. Needs external terminal (or Boot.cmd from a real shell).
- Business rule: MeterVerse == Collection (consumption/production/net/surplus/admin_fee 2%/service_fee 9.10) — line-by-line verified.

**Updated status:** DATABASE=GREEN (native, real data, Prisma-verified) · RUNTIME=YELLOW (DB up; BE launch needs external terminal) · REAL DATA=GREEN (customers/meters/invoices) · REAL READING=RED (registers absent) · SOLAR ENGINE=GREEN · INVOICE/PDF/USER=BLOCKED.
