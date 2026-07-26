# Visual Audit Summary

**Date:** 2026-07-26T20:38:17.452Z
**Base URL:** http://localhost:7400
**Total Pages:** 30
**Passed:** 20
**Failed:** 10
**Pass Rate:** 66.7%

## Results

| Status | Path | HTTP | Title | Has Content | Notes |
|--------|------|------|-------|-------------|-------|
| ✅ | `/` | 200 | MeterVerse Enterprise OS | true | |
| ✅ | `/admin` | 200 | MeterVerse Enterprise OS | true | |
| ✅ | `/admin/customers` | 200 | MeterVerse Enterprise OS | true | |
| ✅ | `/admin/meters` | 200 | MeterVerse Enterprise OS | true | |
| ✅ | `/admin/invoices` | 200 | MeterVerse Enterprise OS | true | |
| ✅ | `/admin/payments` | 200 | MeterVerse Enterprise OS | true | |
| ✅ | `/admin/monitoring` | 200 | MeterVerse Enterprise OS | true | (10 console error(s)) |
| ✅ | `/admin/users` | 200 | MeterVerse Enterprise OS | true | |
| ✅ | `/admin/roles` | 200 | MeterVerse Enterprise OS | true | |
| ✅ | `/admin/audit` | 200 | MeterVerse Enterprise OS | true | |
| ✅ | `/admin/projects` | 200 | MeterVerse Enterprise OS | true | |
| ✅ | `/admin/zones` | 200 | MeterVerse Enterprise OS | true | (9 console error(s)) |
| ✅ | `/admin/units` | 200 | MeterVerse Enterprise OS | true | (7 console error(s)) |
| ❌ | `/admin/reports` | ERR | — | false | (1 console error(s)) |
| ❌ | `/admin/settings` | ERR | — | false | (1 console error(s)) |
| ❌ | `/admin/sim` | ERR | — | false | (1 console error(s)) |
| ❌ | `/admin/readings` | ERR | — | false | (1 console error(s)) |
| ❌ | `/admin/tariffs` | ERR | — | false | (1 console error(s)) |
| ❌ | `/admin/rca-workspace` | ERR | — | false | (1 console error(s)) |
| ❌ | `/admin/accounting` | ERR | — | false | (1 console error(s)) |
| ❌ | `/admin/sync` | ERR | — | false | (1 console error(s)) |
| ❌ | `/admin/upload` | ERR | — | false | (1 console error(s)) |
| ❌ | `/admin/collections` | ERR | MeterVerse Enterprise OS | false | (timeout) |
| ✅ | `/admin/workflows` | 200 | MeterVerse Enterprise OS | true | |
| ✅ | `/admin/alerts` | 200 | MeterVerse Enterprise OS | true | |
| ✅ | `/admin/documents` | 200 | MeterVerse Enterprise OS | true | |
| ✅ | `/admin/accounting/accounts` | 200 | MeterVerse Enterprise OS | true | |
| ✅ | `/admin/accounting/journal` | 200 | MeterVerse Enterprise OS | true | |
| ✅ | `/admin/accounting/ledger` | 200 | MeterVerse Enterprise OS | true | |
| ✅ | `/admin/accounting/trial-balance` | 200 | MeterVerse Enterprise OS | true | |

## Console Errors

### `/admin/monitoring`
```
Error: <path> attribute d: Unexpected end of attribute. Expected number, "… 4h13.856c1.54 0".
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
WebSocket connection to 'ws://localhost:7400/_next/webpack-hmr?id=oO9BGDpzf2LyEcXNERnwo' failed: 
```

### `/admin/zones`
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
WebSocket connection to 'ws://localhost:7400/_next/webpack-hmr?id=oO9BGDpzf2LyEcXNERnwo' failed: 
```

### `/admin/units`
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
WebSocket connection to 'ws://localhost:7400/_next/webpack-hmr?id=oO9BGDpzf2LyEcXNERnwo' failed: 
```

### `/admin/reports`
```
page.goto: net::ERR_ABORTED at http://localhost:7400/admin/reports
Call log:
[2m  - navigating to "http://localhost:7400/admin/reports", waiting until "networkidle"[22m

```

### `/admin/settings`
```
page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:7400/admin/settings
Call log:
[2m  - navigating to "http://localhost:7400/admin/settings", waiting until "networkidle"[22m

```

### `/admin/sim`
```
page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:7400/admin/sim
Call log:
[2m  - navigating to "http://localhost:7400/admin/sim", waiting until "networkidle"[22m

```

### `/admin/readings`
```
page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:7400/admin/readings
Call log:
[2m  - navigating to "http://localhost:7400/admin/readings", waiting until "networkidle"[22m

```

### `/admin/tariffs`
```
page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:7400/admin/tariffs
Call log:
[2m  - navigating to "http://localhost:7400/admin/tariffs", waiting until "networkidle"[22m

```

### `/admin/rca-workspace`
```
page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:7400/admin/rca-workspace
Call log:
[2m  - navigating to "http://localhost:7400/admin/rca-workspace", waiting until "networkidle"[22m

```

### `/admin/accounting`
```
page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:7400/admin/accounting
Call log:
[2m  - navigating to "http://localhost:7400/admin/accounting", waiting until "networkidle"[22m

```

### `/admin/sync`
```
page.goto: Navigation to "http://localhost:7400/admin/sync" is interrupted by another navigation to "chrome-error://chromewebdata/"
Call log:
[2m  - navigating to "http://localhost:7400/admin/sync", waiting until "networkidle"[22m

```

### `/admin/upload`
```
page.goto: Navigation to "http://localhost:7400/admin/upload" is interrupted by another navigation to "http://localhost:7400/admin/sync"
Call log:
[2m  - navigating to "http://localhost:7400/admin/upload", waiting until "networkidle"[22m

```

### `/admin/collections`
```
page.goto: Timeout 30000ms exceeded.
Call log:
[2m  - navigating to "http://localhost:7400/admin/collections", waiting until "networkidle"[22m

```

## Screenshots

All screenshots saved to `docs/screenshots/visual-audit/`.
