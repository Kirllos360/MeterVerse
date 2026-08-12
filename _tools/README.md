# MeterVerse OS — Unified Control Center

**File:** `_tools/MeterVerse.cmd` (replaces 9 fragmented tools)

## Why this exists
P58 toolchain audit found 11 fragmented `_tools/*.cmd` with:
- **Fake/wrong tools:** `Deploy.cmd` + `DisasterRecovery.cmd` used Docker for a DB that is actually **native PostgreSQL on :5433** (produced 0-byte backups, wrong recovery path)
- **Risky tools:** `GitPush.cmd` did blind `git add -A`
- **Obsolete:** `FixTool.cmd` repaired a kill-all-node pattern that no longer exists
- **Fragmented:** Start/Stop/MainControl/AdvancedTest/StressTest each did one thing, often admin-only

## The single tool
`MeterVerse.cmd` merges everything into one command with 11 modes.

## Usage
```
MeterVerse.cmd [start|stop|status|monitor|test|deploy|backup|restore|push|logs|help]
```
(no argument = interactive menu)

| Mode | What it does |
|------|-------------|
| **start** | DB check (:5433) → Admin BE (:3131) → Admin FE (:3535) → Portal BE (:3003) → Portal FE (:3030) → health-wait all 4 |
| **stop** | Safe stop all 4 (window-title taskkill + port free) |
| **status** | Health of all 4 services + DB |
| **monitor** | Auto-heal monitor, 30s loop (merged from MainControl, now covers all 4 services) |
| **test** | 7-test suite: 4 health + DB + portal-gate + 20x flood |
| **deploy** | git pull → backup → deps → prisma generate → db push → build → status |
| **backup** | Native `pg_dump` to `_tools/backups/` (real data — was 0-byte with Docker) |
| **restore** | Native `psql` restore from `_tools/backups/` |
| **push** | Safe git commit+push (shows status, runs tests, asks before commit) |
| **logs** | View tool logs |
| **help** | This help |

## Config
`config.cmd` — single source of truth for ports (3131/3535/3003/3030/5433), DB creds, git remote/branch.

## Safety
`SafetyCheck.cmd` — refuses to run if any `_tools` file contains a kill-all-node (`taskkill /IM node.exe`) command.

## Note
- **Database is NATIVE PostgreSQL** (`postgresql-x64-18` service on :5433), NOT Docker. All DB ops use native `psql`/`pg_dump`.
- Ports: Admin BE 3131, Admin FE 3535, Portal BE 3003, Portal FE 3030.
- `set X=value&&` (no space before `&&`) — never `set X=value &&` (cmd trailing-space bug class).
