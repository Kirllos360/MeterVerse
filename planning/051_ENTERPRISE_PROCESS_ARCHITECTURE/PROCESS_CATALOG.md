# Enterprise Process Catalog

**File:** `| `**120**planning/051_ENTERPRISE_PROCESS_ARCHITECTURE/PROCESS_CATALOG.md`| `**120**

---

## By Business Domain

### Meter Lifecycle (7 processes)
| ID | Process | Trigger | Duration | Frequency |
|----|---------|---------|----------|-----------|
| P-001 | Meter Registration | New meter arrives | 2min | Daily |
| P-002 | Meter Assignment | Customer request | 30min | Daily |
| P-003 | Meter Replacement | Fault/move | 2hrs | Weekly |
| P-004 | Meter Disconnect | Non-payment | 1hr | Weekly |
| P-005 | Meter Reconnect | Payment received | 1hr | Weekly |
| P-006 | Meter Retirement | End of life | 1hr | Monthly |
| P-009 | Meter Testing | Quality check | 30min | Quarterly |
| P-010 | Meter Calibration | Schedule | 1hr | Annually |

### Reading Management (10 processes)
| ID | Process | Trigger | Duration | Frequency |
|----|---------|---------|----------|-----------|
| P-011 | Reading Import | AMI push | 1min | Real-time |
| P-012 | Manual Reading | Field visit | 5min | Monthly |
| P-013 | Bulk Reading Upload | File import | 30min | Daily |
| P-014 | Reading Validation | Reading received | 1s | Real-time |
| P-015 | Reading Approval | Auto/manual | 1s | Real-time |
| P-016 | Reading Rejection | Validation fail | 1s | Real-time |
| P-017 | Reading Correction | Error found | 10min | Weekly |
| P-018 | Consumption Calculation | Bill run | 2s | Monthly |
| P-019 | Abnormal Detection | Variance found | 5s | Real-time |
| P-020 | Leak Detection | Continuous flow | 1min | Real-time |

### Customer Management (5 processes)
| ID | Process | Trigger | Duration | Frequency |
|----|---------|---------|----------|-----------|
| P-021 | Customer Registration | Application | 30min | Daily |
| P-022 | Customer Restore | Request | 1hr | Weekly |
| P-023 | Customer Archive | Request | 1hr | Monthly |
| P-024 | Customer Merge | Duplicate found | 4hrs | Quarterly |
| P-025 | Customer Migration | Area change | 1hr | Monthly |

### Billing & Invoicing (10 processes)
| ID | Process | Trigger | Duration | Frequency |
|----|---------|---------|----------|-----------|
| P-030 | Bill Cycle Creation | Schedule | 1hr | Monthly |
| P-031 | Bill Cycle Execution | Automated | 4hrs | Monthly |
| P-033 | Invoice Generation | Bill run | 2hrs | Monthly |
| P-034 | Invoice Approval | Review needed | 1hr | Monthly |
| P-036 | Invoice Distribution | After issue | 30min | Monthly |
| P-037 | Invoice Email | Automated | 10min | Monthly |

### Payment Processing (6 processes)
| ID | Process | Trigger | Duration | Frequency |
|----|---------|---------|----------|-----------|
| P-045 | Payment Registration | Payment received | 1min | Daily |
| P-046 | Payment Allocation | Auto | 5s | Real-time |
| P-047 | Partial Payment | Insufficient funds | 5s | Real-time |
| P-048 | Refund | Overpayment | 24hrs | Weekly |
| P-049 | Credit Note | Adjustment | 1hr | Weekly |

### Collections (5 processes)
| ID | Process | Trigger | Duration | Frequency |
|----|---------|---------|----------|-----------|
| P-051 | Collection Assignment | Invoice overdue | 1hr | Daily |
| P-052 | Collection Visit | Assignment | 2hrs | Daily |
| P-053 | Collection Completion | Payment | 30min | Daily |
| P-054 | Collection Escalation | No resolution | 1hr | Weekly |

### Accounting & GL (5 processes)
| ID | Process | Trigger | Duration | Frequency |
|----|---------|---------|----------|-----------|
| P-056 | General Ledger Posting | Invoice/Payment | 5min | Daily |
| P-057 | Journal Posting | Any transaction | 5min | Real-time |
| P-058 | Bank Reconciliation | Statement import | 4hrs | Monthly |
| P-059 | Month Close | End of period | 8hrs | Monthly |
| P-060 | Year Close | End of year | 24hrs | Yearly |

### Operations (12 processes)
| ID | Process | Trigger | Duration | Frequency |
|----|---------|---------|----------|-----------|
| P-061 | SIM Assignment | Meter activation | 30min | Weekly |
| P-066 | Synchronization Job | Schedule/event | 15min | Hourly |
| P-068 | Area Synchronization | Data change | 5min | Real-time |
| P-069 | Notification Delivery | Event | 1s | Real-time |

### Administration (21 processes)
| ID | Process | Trigger | Duration | Frequency |
|----|---------|---------|----------|-----------|
| P-073 | Login | User request | 3s | Daily |
| P-078 | User Registration | New hire | 30min | Weekly |
| P-080 | Role Assignment | Role change | 15min | Monthly |
| P-086 | Health Check | Timer | 5s | Every 30s |
| P-088 | Backup Creation | Schedule | 1hr | Daily |
| P-090 | Disaster Recovery | Incident | 4hrs | Rare |

### Intelligence (7 processes)
| ID | Process | Trigger | Duration | Frequency |
|----|---------|---------|----------|-----------|
| P-094 | AI Root Cause Analysis | Meter event | 30s | Daily |
| P-098 | Alert Generation | Threshold breach | 5s | Real-time |
| P-100 | Analytics Report | Schedule | 30min | Daily |

---

## Process Classification Summary

| Category | Count | P0 | P1 | P2 | Automated | Manual |
|----------|-------|-----|-----|-----|-----------|--------|
| Meter Lifecycle | 7 | 4 | 2 | 1 | 5 | 2 |
| Reading Management | 10 | 7 | 3 | 0 | 8 | 2 |
| Customer Management | 5 | 1 | 2 | 2 | 3 | 2 |
| Billing & Invoicing | 10 | 8 | 2 | 0 | 9 | 1 |
| Payment Processing | 6 | 4 | 2 | 0 | 5 | 1 |
| Collections | 5 | 4 | 1 | 0 | 3 | 2 |
| Accounting & GL | 5 | 3 | 1 | 1 | 4 | 1 |
| Operations | 12 | 6 | 5 | 1 | 10 | 2 |
| Administration | 21 | 12 | 7 | 2 | 16 | 5 |
| Intelligence | 7 | 3 | 2 | 2 | 6 | 1 |
| Integration | 8 | 3 | 4 | 1 | 7 | 1 |
| Support | 12 | 4 | 6 | 2 | 6 | 6 |
| **Total** | **120** | **59** | **37** | **12** | **82** | **26** |

