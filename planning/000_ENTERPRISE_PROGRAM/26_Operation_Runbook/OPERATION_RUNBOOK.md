# Operation Runbook

**Purpose:** How to operate, monitor, and recover the system in production.

## Daily Operations

| Task | Frequency | Owner |
|------|-----------|-------|
| Check health endpoint | Continuous | Monitoring |
| Review error logs | Daily | Engineering |
| Verify KPI snapshots | Daily | Product Owner |
| Check pending queue jobs | Daily | Engineering |
| Review failed notifications | Daily | Support |
| Backup verification | Weekly | DevOps |
| SSL certificate expiry | Monthly | DevOps |
| Dependency audit | Monthly | Engineering |

## Incident Response

| Severity | Response Time | Escalation |
|----------|---------------|------------|
| P1 — System down | 15 minutes | Engineering + Management |
| P2 — Feature broken | 1 hour | Engineering |
| P3 — Minor issue | 24 hours | Team |
| P4 — Cosmetic | Next release | Product Owner |

## Recovery Procedures

### Database Recovery
```
1. Identify failure point
2. Restore from latest backup
3. Apply WAL logs for point-in-time recovery
4. Verify data integrity
5. Resume service
```

### Application Recovery
```
1. Check health endpoint
2. Review error logs
3. Check database connectivity
4. Verify environment variables
5. Restart service
6. Verify functionality
```
