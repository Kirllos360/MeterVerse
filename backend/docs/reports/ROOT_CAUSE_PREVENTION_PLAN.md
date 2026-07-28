# Root Cause Prevention Plan — Meter Verse

**Date:** 2026-07-03  

---

## Problem: "Why didn't Port 6262 change?"

### Root Cause

Work was done in the NestJS backend and Next.js frontend, but Port 6262 served a **completely separate legacy Express application**.

### Prevention Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **RP-01** | Every application must declare its port in a single canonical registry | PORT_OWNERSHIP.md must be read before any port change |
| **RP-02** | Before starting work on any port, verify what process is actually listening | `netstat -ano \| findstr :PORT` |
| **RP-03** | After any frontend change, verify the correct URL renders the new content | Open browser to confirm |
| **RP-04** | No new application may listen on a port without updating the port registry | Commit check |
| **RP-05** | Legacy applications must be stopped before changes to their replacement take effect | Part of deployment checklist |

## Prevention Checklist (Before Every Implementation)

```
[ ] Read HANDSHAKE.md for current state
[ ] Verify target port is free (netstat)
[ ] Verify target process is correct (Get-Process)
[ ] Verify target URL renders expected UI (browser or curl)
[ ] Verify runtime API is accessible (curl /api/v1/health)
[ ] Verify dependent services are running (PostgreSQL, Redis)
[ ] Update PORT_OWNERSHIP.md if adding new port
```

---

*Prevention plan — 2026-07-03*
