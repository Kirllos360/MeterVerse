# Enterprise Process Library

**File:** `planning/051_ENTERPRISE_PROCESS_ARCHITECTURE/PROCESS_LIBRARY.md`

---

## Master Process Registry

Total: 120 processes across 7 groups and 5 classifications.

## Classification

### By Business Value

| Class | Count | Examples |
|-------|-------|----------|
| **Revenue-generating** | 15 | P-031 Bill Execution, P-033 Invoice Gen, P-045 Payment Reg |
| **Compliance-mandatory** | 12 | P-059 Month Close, P-060 Year Close, P-056 GL Posting |
| **Operational-critical** | 48 | P-001 Meter Reg, P-014 Reading Validation |
| **Customer-facing** | 25 | P-021 Customer Reg, P-073 Login, P-036 Invoice Dist |
| **Background** | 20 | P-086 Health Check, P-088 Backup, P-066 Sync Job |

### By Automation Level

| Level | Count | Description |
|-------|-------|-------------|
| **Fully Automated** | 65 | No human intervention |
| **Semi-Automated** | 35 | Human approval at decision points |
| **Manual** | 20 | Human-executed end-to-end |

### By Execution Frequency

| Frequency | Count |
|-----------|-------|
| Real-time (event-driven) | 45 |
| Hourly | 5 |
| Daily | 25 |
| Weekly | 15 |
| Monthly | 20 |
| Quarterly | 5 |
| Yearly | 3 |
| On-demand | 2 |

---

## Critical Processes (P0 — Must never fail)

| ID | Process | Failure Impact | Mitigation |
|----|---------|---------------|------------|
| P-011 | Reading Import | Revenue loss | Dual-write, queue |
| P-014 | Reading Validation | Billing errors | Async, retry |
| P-031 | Bill Cycle Execution | No invoices | Idempotent, resume |
| P-033 | Invoice Generation | No revenue | Batch, retry |
| P-045 | Payment Registration | Revenue loss | Atomic, audit |
| P-056 | GL Posting | Books unbalanced | Double-entry, reconcile |
| P-059 | Month Close | Financial report delay | Manual override |
| P-073 | Login | No system access | HA, failover |
| P-086 | Health Check | No monitoring | Redundant |
| P-088 | Backup | Data loss | Off-site replication |

## Supporting Processes (P1 — Important)

50 processes including Contract, Collection, SIM, Notification, Configuration.

## Background Processes (P2 — Non-critical)

22 processes including Firmware Upgrade, Plugin Management, Calendar Maintenance.

## Scheduled Processes

| ID | Process | Schedule | Duration |
|----|---------|----------|----------|
| P-031 | Bill Cycle | Monthly (1st) | 4 hours |
| P-059 | Month Close | Monthly (last day) | 8 hours |
| P-060 | Year Close | Dec 31 | 24 hours |
| P-086 | Health Check | Every 30 seconds | 5 seconds |
| P-088 | Backup | Daily (2AM) | 1 hour |
| P-066 | Sync Job | Every 15 minutes | 15 minutes |
| P-100 | Analytics Report | Daily (6AM) | 30 minutes |

## AI-Automated Processes

| ID | Process | AI Model | Human Oversight |
|----|---------|----------|-----------------|
| P-094 | AI RCA | LLM + Rule Engine | Required for high confidence |
| P-019 | Abnormal Detection | Anomaly Detection | Auto-alert, manual review |
| P-020 | Leak Detection | Pattern Recognition | Auto-alert |
| P-096 | AI Recommendation | LLM | Required before action |
| P-097 | AI Automation | LLM + Workflow | Optional |
