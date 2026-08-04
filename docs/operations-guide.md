# Operations Guide (T119)

## Daily Operations
```bash
# Check system health
curl http://localhost:3131/api/health
curl http://localhost:3131/api/admin/health

# Check queue depth
curl http://localhost:3131/api/admin/queue

# Monitor active sessions
curl http://localhost:3131/api/admin/sessions
```

## Backup
```bash
# Full backup
node scripts/backup-db.mjs

# Schema only
pg_dump "$DATABASE_URL" --schema-only -f backup/schema.sql
```

## Deployment
```bash
# Production deploy
bash scripts/deploy-prod.sh
```

## Monitoring
- Health endpoint: GET /api/health
- Monitor dashboard: GET /api/monitor/
- Prometheus metrics: GET /api/monitor/metrics/prometheus
- Deep health: GET /api/monitor/health/deep

## Alerts
- Alert rules configured in admin UI at /admin/alerts
- Email notifications via SMTP config
- Alert escalation policies in SLA config
