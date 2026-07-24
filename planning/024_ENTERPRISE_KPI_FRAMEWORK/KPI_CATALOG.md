# Enterprise KPI Framework — Planning

## Existing KPIs (in kpi-engine.js)
| KPI | Formula | Target | Status |
|:----|---------|:------:|:------:|
| Total Customers | count(customer) | 10,000 | ✅ |
| Active Meters | count(meter where active) | 15,000 | ✅ |
| Readings Today | count(reading where today) | 5,000 | ✅ |
| Invoices Generated | count(invoice) | 1,000 | ✅ |
| Payments Collected | sum(payment.amount) | 500,000 | ✅ |
| Avg Response Time | avg(api response) | 200ms | ✅ |

## Missing KPIs (Must Add)

### Operational KPIs
| KPI | Formula | Target | Priority |
|:----|---------|:------:|:--------:|
| Bill Run Success Rate | completed / total runs × 100 | 99% | P1 |
| Payment Allocation Accuracy | auto-allocated / total payments | 95% | P1 |
| Reading Validation Rate | valid / total readings | 95% | P1 |
| Tariff Coverage | meters with tariff / total meters | 100% | P1 |

### Business KPIs
| KPI | Formula | Target | Priority |
|:----|---------|:------:|:--------:|
| On-time Payment Rate | paid before due / total invoices | 90% | P1 |
| Average Collection Period | avg(days to pay) | 30 days | P1 |
| Outstanding Balance | sum(unpaid invoices) | — | P1 |
| Customer Churn | terminated / total customers | <5% | P2 |

### Technical KPIs
| KPI | Formula | Target | Priority |
|:----|---------|:------:|:--------:|
| API Uptime | uptime / total time | 99.9% | P1 |
| API Error Rate | 5xx / total requests | <0.1% | P1 |
| Database Connection Pool | used / total connections | <80% | P2 |
| Cache Hit Rate | cache hits / total lookups | >80% | P2 |
| Test Coverage | lines covered / total lines | >80% | P1 |

### Security KPIs
| KPI | Formula | Target | Priority |
|:----|---------|:------:|:--------:|
| Failed Logins | count(login failures) per hour | <10/hr | P1 |
| Permission Violations | count(403 responses) | <1/day | P1 |
| MFA Adoption | MFA enabled / total users | 100% admin | P2 |

### AI KPIs (Future)
| KPI | Formula | Target | Priority |
|:----|---------|:------:|:--------:|
| Forecast Accuracy | predicted / actual consumption | >90% | P2 |
| Anomaly Detection Rate | detected anomalies / total | >95% | P2 |
