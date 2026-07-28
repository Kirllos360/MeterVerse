# Enterprise Risk Report

| ID | Risk | Probability | Impact | Risk Score | Mitigation |
|:--:|------|:-----------:|:------:|:----------:|------------|
| R001 | SYMBIOT API docs never provided | HIGH | CRITICAL | 9 | Plan alternative meter data ingestion |
| R002 | SMTP/Twilio/Firebase credentials never provided | HIGH | HIGH | 8 | Build offline fallback (notification queue) |
| R003 | Billing pipeline incorrect → financial loss | MEDIUM | CRITICAL | 8 | Add reconciliation steps, dual-run validation |
| R004 | Data migration data loss | MEDIUM | CRITICAL | 8 | Full backup before migration, reconciliation scripts |
| R005 | No DR plan → extended outage | HIGH | HIGH | 8 | Write DR plan before production deployment |
| R006 | Permission key explosion → unmanageable | MEDIUM | HIGH | 6 | Add permission key governance + retirement process |
| R007 | Test gap → regression in billing | MEDIUM | HIGH | 6 | Prioritize billing test coverage |
| R008 | No contract tests → API drift | MEDIUM | HIGH | 6 | Add contract test harness |
| R009 | No load testing → production crash | MEDIUM | HIGH | 6 | Schedule load test before Wave 03 completion |
| R010 | No security scan → vulnerability | MEDIUM | HIGH | 6 | Add automated security scanning |
