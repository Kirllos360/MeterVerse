# Process KPI & SLA Matrix

**File:** `planning/051_ENTERPRISE_PROCESS_ARCHITECTURE/PROCESS_KPI_SLA_MATRIX.md`

---

## KPI Definitions

| KPI ID | KPI Name | Process | Target | Measurement | Frequency |
|--------|----------|---------|--------|-------------|-----------|
| KPI-001 | Meter Registration Time | P-001 | < 30s | p95 latency | Daily |
| KPI-002 | Meter Assignment Accuracy | P-002 | > 99.5% | % correct assignments | Monthly |
| KPI-003 | Reading Validation Rate | P-014 | > 95% auto-approve | % auto-approved | Daily |
| KPI-004 | Reading Submission-to-Bill Time | P-018 | < 24hrs | End-to-end latency | Monthly |
| KPI-005 | Bill Run Duration | P-031 | < 4hrs | Total run time | Per run |
| KPI-006 | Invoice Generation Accuracy | P-033 | > 99.9% | % error-free invoices | Monthly |
| KPI-007 | Invoice Delivery Rate | P-036 | > 98% | % successfully delivered | Monthly |
| KPI-008 | Payment Allocation Time | P-046 | < 5min | Auto-allocation % | Daily |
| KPI-009 | First-Call Resolution | P-052 | > 70% | % resolved on first visit | Monthly |
| KPI-010 | Collection Effectiveness | P-053 | > 85% | % collected within 90 days | Monthly |
| KPI-011 | Month Close Duration | P-059 | < 5 business days | Calendar time | Monthly |
| KPI-012 | Sync Latency | P-066 | < 5min | p95 sync time | Real-time |
| KPI-013 | System Uptime | P-086 | > 99.9% | Availability % | Monthly |
| KPI-014 | Backup RPO | P-088 | < 1hr | Data loss window | Per backup |
| KPI-015 | Backup RTO | P-089 | < 4hrs | Recovery time | Per restore |
| KPI-016 | AI RCA Accuracy | P-094 | > 80% | % correct root cause | Monthly |
| KPI-017 | Alert Response Time | P-098 | < 15min | Mean time to acknowledge | Real-time |
| KPI-018 | Incident Resolution | P-110 | < 4hrs (P1) | Mean time to resolve | Real-time |

## SLA Matrix

| Process ID | Process Name | Availability | Max Latency | Max Throughput | Severity |
|-----------|-------------|-------------|-------------|----------------|----------|
| P-001 | Meter Registration | 99.9% | 2s (single) | 1000/hr | P3 |
| P-002 | Meter Assignment | 99.9% | 5s | 500/hr | P2 |
| P-004 | Meter Disconnect | 99.95% | 30s | 100/hr | P1 |
| P-011 | Reading Import | 99.99% | 1s | 10000/min | P0 |
| P-014 | Reading Validation | 99.99% | 500ms | 10000/min | P0 |
| P-018 | Consumption Calculation | 99.95% | 2s per meter | 10000/batch | P0 |
| P-031 | Bill Cycle Execution | 99.9% | 4hrs total | 100000/batch | P0 |
| P-033 | Invoice Generation | 99.9% | 2hrs total | 100000/batch | P0 |
| P-045 | Payment Registration | 99.99% | 3s | 500/hr | P0 |
| P-056 | GL Posting | 99.95% | 5s | 1000/hr | P0 |
| P-066 | Sync Job | 99.9% | 5min | 100000/job | P1 |
| P-069 | Notification Delivery | 99.95% | 1s | 1000/min | P1 |
| P-073 | Login | 99.99% | 3s | 100/min | P0 |
| P-086 | Health Check | 99.99% | 5s | Per 30s | P0 |
| P-088 | Backup Creation | 99.9% | 1hr | Daily | P0 |
| P-090 | Disaster Recovery | 99.5% | 4hrs RTO | — | P0 |
| P-094 | AI RCA | 99.5% | 60s | 100/hr | P2 |
| P-098 | Alert Generation | 99.95% | 5s | 1000/min | P1 |

## Severity Definitions

| Severity | Response Time | Resolution Time | Escalation |
|----------|--------------|-----------------|------------|
| P0 — Critical | < 5min | < 1hr | VP Engineering |
| P1 — High | < 15min | < 4hrs | Engineering Manager |
| P2 — Medium | < 1hr | < 24hrs | Team Lead |
| P3 — Low | < 24hrs | < 1 week | Self-service |
