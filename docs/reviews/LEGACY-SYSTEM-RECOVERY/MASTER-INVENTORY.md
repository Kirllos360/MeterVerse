# LEGACY SYSTEM RECOVERY — MASTER INVENTORY

**Date:** 2026-08-14
**Gate:** P59-B / Pre-Repair — Legacy Asset Discovery (READ-ONLY, no production repair)
**Baseline commit:** 41338a9e (main, clean)

---

## 1. Archive Verification

| # | User Archive | Size | Modified | Encrypted? | Extracted Source Found |
|---|--------------|------|----------|-----------|------------------------|
| 1 | `D:\Collection System.rar` | 3,362.65 MB | 2026-06-29 06:39 | **YES** (password) | `D:\meter\Meter\reference\collection-system\` (560 files) |
| 2 | `D:\IMS.rar` | 4,921.62 MB | 2026-06-29 10:03 | **YES** (password) | `D:\meter\Meter\reference\ims\` (HTML/JS prototype) + nested `IMS\IMS.rar` (unencrypted, listable) |
| 3 | `D:\New folder (2).rar` | 834.87 MB | 2026-07-04 01:53 | **YES** (password) | `D:\meter\Meter\reference\all-last-update\` + `reference\sbill\` + `reference\symbiot\` |

**IMPORTANT:** All three RAR archives are password-protected (verified: `UnRAR lb -p-` → "Incorrect password", exit 11/12). **No archive content was extracted directly** (per extraction-safety rules). The discovery proceeded via the **already-extracted legacy reference trees** on disk, which contain the same systems.

## 2. Extraction / Reading Method

- Archives listed with `UnRAR lb` → all require password → **not extracted**
- Legacy content read from:
  - `D:\meter\Meter\reference\collection-system\` (Collection System — full Flask source)
  - `D:\meter\Meter\reference\ims\` + nested `IMS\IMS.rar` (unencrypted, listed)
  - `D:\meter\Meter\reference\sbill\` (SBill / October Billing — analysis docs + OctBilling-Complete)
  - `D:\meter\Meter\reference\all-last-update\sys_n\` (Symbiot AMI/MDM reimplementation resource)
  - `D:\meter\Meter\reference\symbiot\`, `D:\meter\Meter\reference\energy-360\`, `D:\meter\Meter\reference\meter-department\`
- **No binaries executed, no installers run, no DB connected, no production writes.**

## 3. System-to-Archive Mapping

| Legacy System | User Archive | Extracted Location | Tech Stack |
|---------------|-------------|--------------------|-----------|
| **Collection System** ("Collection Tracker v1.2.1") | `Collection System.rar` | `reference\collection-system\` | Flask 3 + SQLAlchemy + PostgreSQL + Redis + alembic + Jinja2 |
| **IMS** (UI prototype) | `IMS.rar` | `reference\ims\IMS\` | Static HTML/CSS/JS + Express static server (Node) |
| **SBill / October Billing** (Energy360) | `New folder (2).rar` (partial) | `reference\sbill\` | Spring Boot (JARs) + Angular + SQL Server (`PalmHills_Billing`, `Energy360_V4`) |
| **Symbiot** (AMI/MDM reimplementation resource) | `New folder (2).rar` | `reference\all-last-update\sys_n\` | .NET (SymbiotMonitorAPI/OperatorAPI) + 25+ meter protocols |
| **Energy 360** (customer portal + admin) | `New folder (2).rar` (partial) | `reference\sbill\`, `reference\energy-360\` | .NET Core 2.2 + Angular (Fawry payments, Firebase) |

## 4. File Inventory Summary

### Collection System (`reference\collection-system\`) — 560 files

| Category | Count | Examples |
|----------|-------|----------|
| Source (Python) | 55 | `app/models.py` (844 lines, ~60 models), `charge_engine.py`, 20 `routes_*.py` |
| Templates (HTML/Jinja2) | 79 | dashboard, customers, payments, collection, reports |
| Docs | 157 | business-rule-discovery, gap analysis, API reference, specs |
| Tests | 6 | pytest |
| Scripts | 8 | setup, start, backup |
| Database | 2 | `DBS/october.db`, `DBS/sodic_ednc.db` (SQLite stubs) + alembic migration |
| Static | 3 | CSS/assets |

### IMS (`reference\ims\IMS\`) — ~25 files

| Category | Count | Examples |
|----------|-------|----------|
| HTML pages | 8 | customers, meters, invoices, tariffs, reports, dashboard, superadmin, units |
| CSS | 5 | theme-green-pro, base, components, layout, utilities |
| JS | 2 | theme-injector, server.js (Express static) |
| Screenshots | 7 | page demos |
| Docs | 1 | HOWTO-apply-theme |

### SBill / Symbiot / Energy360 — analysis docs (previously extracted)

| System | Evidence |
|--------|----------|
| SBill | `reference\sbill\database-analysis\04-database-intelligence-report.md` (SQL Server, Energy360_V4), OctBilling-Complete (jars/db/frontend/templates) |
| Symbiot | `reference\all-last-update\sys_n\README.md` (895 files, 178MB, 25+ protocols), 01_Installation..08_Desktop_Configs |
| Energy360 | `reference\energy-360\meter-pulse\` |

## 5. Technology Stacks (evidence-based)

| System | Language | Backend | Frontend | DB | ORM | Auth | Reports |
|--------|----------|---------|----------|----|----|------|---------|
| Collection System | Python 3 | Flask 3 | Jinja2 | PostgreSQL (+SQLite stubs) | SQLAlchemy + alembic | flask-login + roles | fpdf2, JRXML refs |
| IMS | JS/Node | Express (static) | HTML/CSS/JS multi-page | none | none | none (prototype) | HTML |
| SBill | Java/.NET | Spring Boot JARs + .NET Core | Angular (JHipster/IIS) | SQL Server | JHipster | JWT | JasperReports |
| Symbiot | .NET | WCF/WebAPI | Desktop→web replan | MSSQL | — | — | — |

## 6. What Was NOT Read (honest record)

| Item | Reason | Attempted | Tool Needed | Impact |
|------|--------|-----------|-------------|--------|
| `D:\Collection System.rar` contents | password-protected | `UnRAR lb -p-` → incorrect password | RAR password from user | Low — extracted source found on disk |
| `D:\IMS.rar` contents | password-protected | `UnRAR lb -p-` → incorrect password | RAR password | Low — extracted source found on disk |
| `D:\New folder (2).rar` contents | password-protected | `UnRAR lb -p-` → incorrect password | RAR password | Low — extracted source found on disk |
| Collection `docs/specs/*` full text | volume | sampled key files | — | Low — core rules already extracted |

## 7. Unreadable-File Register

All three user RARs are unreadable directly (encrypted). Extracted equivalents were verified present on disk. If the user provides the archive password, a byte-level diff of archive vs extracted tree could confirm fidelity — **recommended as a follow-up control** but not blocking this discovery gate.
