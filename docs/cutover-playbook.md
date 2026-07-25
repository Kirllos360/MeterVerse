# Cutover Playbook (T118)

## Pre-Cutover Checklist
- [ ] Database backup completed
- [ ] All schema migrations applied
- [ ] API health check passing
- [ ] All 113 tests passing
- [ ] Load test completed (< 500ms avg latency)
- [ ] Security audit reviewed
- [ ] SSL certificates installed
- [ ] Environment variables configured

## Cutover Steps
1. Stop old system
2. Run final data sync: `node scripts/migrate-data.mjs --source=<old_db>`
3. Start new backend: `NODE_ENV=production PORT=3001 node src/server.js`
4. Verify health: `curl http://localhost:3001/api/health`
5. Update DNS to point to new servers
6. Run certification: `node scripts/certification-suite.mjs`
7. Monitor for 1 hour: check error rates, latency, queue depth

## Rollback Plan
If issues detected within 24 hours:
1. Point DNS back to old servers
2. Restore database from pre-cutover backup
3. Investigate and fix

## Post-Cutover
- [ ] Monitor dashboard operational
- [ ] Alert rules active
- [ ] Backup schedule confirmed
- [ ] Team notified of cutover completion
