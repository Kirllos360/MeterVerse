# Post-Release Monitoring

**Purpose:** What to monitor after every release to ensure stability.

## First 24 Hours (Critical)

| Metric | Threshold | Action |
|--------|-----------|--------|
| Error rate | < 0.1% | Investigate if exceeded |
| Response time P99 | < 500ms | Performance review |
| API success rate | > 99.5% | Rollback if below |
| Active users | No drop | Check for regressions |
| Database connections | < 80% pool | Scale if needed |

## First 7 Days

| Check | Frequency |
|-------|-----------|
| Error log review | Daily |
| Performance comparison (before/after) | Daily |
| User feedback collection | Daily |
| KPI trend analysis | Daily |
| Security scan results | Weekly |

## Rollback Criteria
Rollback immediately if:
1. Error rate exceeds 1% for 5+ minutes
2. Any P1 security vulnerability discovered
3. Data integrity issue detected
4. Performance degrades > 50%
5. Critical business rule broken
