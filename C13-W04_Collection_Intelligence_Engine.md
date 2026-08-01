<!-- Status Block
====================================================================
Design: [x] Complete | Implementation: [ ] In Progress (CollectionCase/PTP exist) | Certification: [ ] Not Certified | Wave: W2 | Commit: d2439752
====================================================================
-->

# C13-W04 â€” Enterprise Collection Intelligence & Receivables Management Engine
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY â€” GOVERNANCE PLANNING ONLY â€” NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Program:** C13 Enterprise Financial & Billing Intelligence Platform  
**Wave:** W04 (Collection Intelligence â€” builds on W01-W03 billing, revenue, and tariff foundation)  

---

## PART 1: CURRENT STATE AUDIT

### 1.1 Existing Collections Infrastructure

| Component | Location | Status | Capability |
|-----------|----------|--------|------------|
| **CollectionCase** model | `schema.prisma:1386` | âœ… Complete | customerId, invoiceId, status, priority, totalAmount, paidAmount, assignedTo |
| **CollectionAction** model | `schema.prisma:1412` | âœ… Complete | type, result, notes, actedBy |
| **PromiseToPay** model | `schema.prisma:1427` | âœ… Complete | promisedDate, promisedAmount, status (pending/kept) |
| **CustomerLedgerEntry** model | `schema.prisma:1493` | âœ… Complete | Overpayments, credits, refunds |
| **SLA** model | `schema.prisma:1549` | âœ… Complete | responseTime, resolutionTime |
| **SLABreach** model | `schema.prisma:1566` | âœ… Complete | Breach tracking |
| **SLAEscalation** model | `schema.prisma:1582` | âœ… Complete | Escalation levels |
| **EscalationPolicy** + **EscalationStep** | `schema.prisma:1646-1675` | âœ… Complete | Policy + step definitions |
| **collection-cases CRUD** | `routes/domain.js:139` | âœ… Complete | Generic CRUD via factory |
| **customer aging** | `routes/payments.js:101-108` | âœ… Basic | Per-customer invoice-level aging |
| **aging report** | `routes/reports.js:41-49` | âœ… Basic | Top-level outstanding per customer |
| **W01 FinancialEvent** | Planned | âŒ W01 | Revenue event for collection linking |
| **W02 Revenue Rules** | Planned | âŒ W02 | Scoring for collection priority |
| **W03 Tariff Intelligence** | Planned | âŒ W03 | Usage data for customer profiling |

### 1.2 Current Collection Case Lifecycle

```
CollectionCase (status field):
  "open" â†’ "in_progress" â†’ "resolved" â†’ "closed"
```

**Current:** Simple status-based lifecycle with no stages, no escalation automation, no AI.

### 1.3 Current Aging Capability

```javascript
// payments.js:101 â€” GET /customers/:id/aging
// Returns per-invoice: daysOverdue, outstanding, dueDate
â†’ No aggregation by aging bucket
â†’ No portfolio-level view
â†’ No trend analysis
â†’ No segmentation
```

### 1.4 Current Dunning Capability

**None.** Collection actions are manual (log entries via CollectionAction). No automated dunning, no multi-channel orchestration, no escalation engine.

### 1.5 Gap Summary

| Capability | Current | W04 Target |
|------------|---------|------------|
| Case lifecycle | 4 states | 12-state lifecycle with stages |
| Aging engine | Per-customer basic | Multi-dimensional, real-time |
| Dunning automation | âŒ None | 7-stage multi-channel engine |
| Payment probability | âŒ None | AI scoring 0-100 |
| Collection priority | Manual priority field | AI-driven priority score |
| Promise-to-Pay | Basic create/track | Full lifecycle with reminders |
| Installment plans | âŒ None | Full plan management |
| Dispute management | âŒ None | Full dispute workflow |
| Bad debt provisioning | âŒ None | Automated provision calculation |
| Write-off governance | âŒ None | Approval workflow |
| Collector workbench | âŒ None | Full frontend workbench |
| AI Collection Agent | âŒ None | Next-best-action recommendations |
| Performance KPIs | âŒ None | Collector + portfolio metrics |

---

## PART 2: ENTERPRISE RECEIVABLES ARCHITECTURE

### 2.1 High-Level Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    COLLECTION INTELLIGENCE PLATFORM                                            â”‚
â”‚                                                                                               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  RECEIVABLES INTELLIGENCE LAYER                                                         â”‚    â”‚
â”‚  â”‚                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚    â”‚
â”‚  â”‚  â”‚ Aging Engine â”‚  â”‚ Risk Scoring â”‚  â”‚ Payment      â”‚  â”‚ Collection Strategy       â”‚   â”‚    â”‚
â”‚  â”‚  â”‚ (real-time)  â”‚  â”‚ (AI-driven)  â”‚  â”‚ Probability  â”‚  â”‚ Engine (segment-based)   â”‚   â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  COLLECTION OPERATIONS LAYER                                                            â”‚    â”‚
â”‚  â”‚                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚    â”‚
â”‚  â”‚  â”‚ Dunning      â”‚  â”‚ Promise-to-  â”‚  â”‚ Installment  â”‚  â”‚ Payment      â”‚  â”‚ Dispute  â”‚ â”‚    â”‚
â”‚  â”‚  â”‚ Engine       â”‚  â”‚ Pay Engine   â”‚  â”‚ Plan Engine  â”‚  â”‚ Arrangement  â”‚  â”‚ Workflow â”‚ â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚    â”‚
â”‚  â”‚                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”               â”‚    â”‚
â”‚  â”‚  â”‚ Escalation   â”‚  â”‚ Campaign     â”‚  â”‚ Bad Debt     â”‚  â”‚ Write-off    â”‚               â”‚    â”‚
â”‚  â”‚  â”‚ Engine       â”‚  â”‚ Management   â”‚  â”‚ Provisioning â”‚  â”‚ Governance   â”‚               â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜               â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  COLLECTOR WORKBENCH & DASHBOARDS                                                      â”‚    â”‚
â”‚  â”‚                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚    â”‚
â”‚  â”‚  â”‚ Collector Workbench  â”‚  â”‚ Supervisor Dashboard â”‚  â”‚ Executive Dashboard       â”‚    â”‚    â”‚
â”‚  â”‚  â”‚ (my cases, actions)  â”‚  â”‚ (team perf, queue)   â”‚  â”‚ (portfolio, trends, KPIs) â”‚    â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  AI COLLECTION INTELLIGENCE AGENT                                                        â”‚    â”‚
â”‚  â”‚                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚    â”‚
â”‚  â”‚  â”‚ Next-Best-Action     â”‚  â”‚ Payment Probability  â”‚  â”‚ Churn Prediction         â”‚    â”‚    â”‚
â”‚  â”‚  â”‚ Recommendation       â”‚  â”‚ Scoring              â”‚  â”‚ (collection-related)     â”‚    â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚    â”‚
â”‚  â”‚                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚    â”‚
â”‚  â”‚  â”‚ Revenue Recovery     â”‚  â”‚ Collection Strategy  â”‚  â”‚ Performance               â”‚    â”‚    â”‚
â”‚  â”‚  â”‚ Forecasting          â”‚  â”‚ Optimization         â”‚  â”‚ Analytics                 â”‚    â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                                               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  INTEGRATION LAYER                                                                      â”‚    â”‚
â”‚  â”‚                                                                                        â”‚    â”‚
â”‚  â”‚  Invoice â”€â”€â†’ Auto-create collection case when overdue                                  â”‚    â”‚
â”‚  â”‚  Payment â”€â”€â†’ Update collection case when payment received                             â”‚    â”‚
â”‚  â”‚  W01 GL â”€â”€â”€â†’ Bad debt provision journal entries                                       â”‚    â”‚
â”‚  â”‚  W02 Rev â”€â”€â†’ Revenue assurance flags priority cases                                   â”‚    â”‚
â”‚  â”‚  W03 Tariffâ”€â†’ Usage data for customer profiling                                       â”‚    â”‚
â”‚  â”‚  C12-W07 â”€â”€â†’ AIRecommendation + LearnedPattern integration                           â”‚    â”‚
â”‚  â”‚  Notifications â†’ Multi-channel reminders (Email/SMS/WhatsApp/Push)                   â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Collection Case Lifecycle â€” 12 States

```
INVOICE OVERDUE (by 1 day past dueDate)
    â”‚
    â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  AUTO_CREATED  â”‚  System creates CollectionCase automatically
â”‚  (Stage 0)    â”‚  Priority assigned, risk scored
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚
       â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  OPEN         â”‚  Case ready for assignment
â”‚  (Stage 1)    â”‚  Can be self-assigned or auto-assigned
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚
       â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  IN_PROGRESS  â”‚  Collector actively working the case
â”‚  (Stage 2)    â”‚  Actions logged, PTP may be created
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚
       â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  CONTACTED    â”‚  Customer reached â€” discussing resolution
â”‚  (Stage 3)    â”‚  Outcome: PTP | Arrangement | Dispute | No response
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚
  â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
  â”‚                    â”‚                           â”‚
  â–¼                    â–¼                           â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ PTP_SET  â”‚   â”‚ ARRANGEMENT  â”‚           â”‚  DISPUTED    â”‚
â”‚ (Stage 4)â”‚   â”‚ (Stage 4)    â”‚           â”‚ (Stage 4)    â”‚
â”‚ Promise  â”‚   â”‚ Installment  â”‚           â”‚ Customer     â”‚
â”‚ to pay   â”‚   â”‚ plan created â”‚           â”‚ disputes inv â”‚
â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜           â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
     â”‚                â”‚                          â”‚
     â–¼                â–¼                          â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                     â”‚
â”‚ PTP_KEPT â”‚    â”‚ PLAN_ACT â”‚                     â”‚
â”‚ (Stage 5)â”‚    â”‚ (Stage 5)â”‚                     â”‚
â”‚ Paid!    â”‚    â”‚ Paying   â”‚                     â”‚
â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜                     â”‚
     â”‚                â”‚                          â”‚
     â–¼                â–¼                          â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                     â”‚
â”‚ RESOLVED â”‚    â”‚ RESOLVED â”‚                     â”‚
â”‚ (Stage 6)â”‚    â”‚ (Stage 6)â”‚                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                     â”‚
                                                  â”‚
             â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
             â”‚              â”‚               â”‚
             â–¼              â–¼               â–¼
      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
      â”‚ PTP_MISS â”‚   â”‚ PLAN_DEF â”‚    â”‚ DISPUTE_DONE â”‚
      â”‚ (Escalate)â”‚  â”‚ (Escalate)â”‚   â”‚ (resolve)    â”‚
      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
             â”‚              â”‚               â”‚
             â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜               â”‚
                    â–¼                       â”‚
             â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”               â”‚
             â”‚ AUTO_ESCALATE â”‚              â”‚
             â”‚ (Stage +1)   â”‚              â”‚
             â”‚ Dunning fires â”‚              â”‚
             â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜              â”‚
                    â”‚                       â”‚
                    â–¼                       â–¼
             â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
             â”‚ More stages... â”‚        â”‚  RESOLVED    â”‚
             â”‚ (up to 6)    â”‚        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
             â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                    â”‚
               â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”
               â”‚         â”‚
               â–¼         â–¼
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚ WRITE_OFFâ”‚ â”‚ RECOVERY â”‚
        â”‚ (Stage 7)â”‚ â”‚ (Stage 7)â”‚
        â”‚ Approved â”‚ â”‚ Post-WO  â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.3 Aging Engine Design

```
AgingEngine.getAging(customerId):
  1. LOAD all invoices for customer
     WHERE archivedAt IS NULL
     AND status IN ("issued", "overdue", "partial")
  
  2. FOR each invoice:
     daysOverdue = TODAY - invoice.dueDate
     outstanding = invoice.amount - invoice.paidAmount
     bucket = classify(daysOverdue)
     
     RETURN bucket
    
  3. AGGREGATE by bucket:
     current:   daysOverdue <= 0      (not yet due)
     bucket_30: daysOverdue 1-30
     bucket_60: daysOverdue 31-60
     bucket_90: daysOverdue 61-90
     bucket_120: daysOverdue 91-120
     bucket_120plus: daysOverdue > 120

  4. COMPUTE metrics:
     totalOutstanding = SUM(all buckets)
     agingPercentByBucket = bucketAmount / totalOutstanding Ã— 100
     weightedAvgDays = SUM(daysOverdue Ã— outstanding) / totalOutstanding
     collectionEffectiveness = totalPaidLastMonth / totalDueLastMonth Ã— 100

AgingEngine.portfolioAging(filters):
  â†’ Same logic but aggregated across all customers
  â†’ Supports filters: areaId, projectId, customerGroup, collectorId
  â†’ Returns: portfolio summary + per-bucket breakdown + trend data
```

### 2.4 Aging Bucket Classification

```javascript
function classify(daysOverdue) {
  if (daysOverdue <= 0)    return { key: "current",     label: "Current",        maxDays: 0 }
  if (daysOverdue <= 30)   return { key: "bucket_30",   label: "1-30 Days",     maxDays: 30 }
  if (daysOverdue <= 60)   return { key: "bucket_60",   label: "31-60 Days",    maxDays: 60 }
  if (daysOverdue <= 90)   return { key: "bucket_90",   label: "61-90 Days",    maxDays: 90 }
  if (daysOverdue <= 120)  return { key: "bucket_120",  label: "91-120 Days",   maxDays: 120 }
  return                       { key: "bucket_120plus", label: "120+ Days",     maxDays: Infinity }
}
```

---

## PART 3: DATA MODEL DESIGN

### 3.1 Enhanced CollectionCase (NEW fields on existing model)

| New Field | Type | Purpose |
|-----------|------|---------|
| `stage` | Int @default(0) | Current dunning stage (0-7) |
| `dunningLastAt` | DateTime? | Last dunning action |
| `nextDunningAt` | DateTime? | Next scheduled dunning |
| `paymentProbability` | Float? | AI score 0.0-1.0 |
| `priorityScore` | Float? | AI score 0-100 |
| `riskBucket` | String? | LOW | MEDIUM | HIGH | CRITICAL |
| `collectorId` | String? | FK â†’ User (assigned collector) |
| `collectionStrategy` | String? | SOFT | STANDARD | AGGRESSIVE | LEGAL |
| `expectedResolutionDate` | DateTime? | Target resolution |
| `lastContactAt` | DateTime? | Last customer contact |
| `contactMethod` | String? | EMAIL | SMS | CALL | WHATSAPP | VISIT |
| `ptpCount` | Int @default(0) | Number of PTPs on this case |
| `missedPtpCount` | Int @default(0) | Consecutive missed PTPs |
| `disputeReason` | String? | If disputed, why |
| `disputeStatus` | String? | OPEN | INVESTIGATING | RESOLVED |
| `writeOffAmount` | Float? | Amount written off |
| `writeOffReason` | String? | Reason for write-off |
| `writeOffApprovedBy` | String? | FK â†’ User |
| `writeOffApprovedAt` | DateTime? | |

### 3.2 CustomerRiskProfile (NEW)

**Purpose:** Store AI-computed risk and payment behavior profile per customer.

```
CustomerRiskProfile
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ customerId: String (FK, UNIQUE)
â”œâ”€â”€ paymentProbability: Float?          â† AI score 0.0-1.0
â”œâ”€â”€ riskScore: Float?                   â† 0-100
â”œâ”€â”€ riskBucket: String?                 â† LOW | MEDIUM | HIGH | CRITICAL
â”œâ”€â”€ avgPaymentDays: Int?                â† Avg days to pay after due date
â”œâ”€â”€ onTimePaymentRate: Float?           â† % of payments made on time
â”œâ”€â”€ totalPaidLast12Months: Float?
â”œâ”€â”€ totalBilledLast12Months: Float?
â”œâ”€â”€ missedPtpCount: Int @default(0)     â† Lifetime missed PTPs
â”œâ”€â”€ keptPtpCount: Int @default(0)       â† Lifetime kept PTPs
â”œâ”€â”€ ptpReliability: Float?              â† kept / (kept + missed)  [0-1]
â”œâ”€â”€ lastRiskCalculatedAt: DateTime?
â”œâ”€â”€ lastPaymentAt: DateTime?
â”œâ”€â”€ createdAt, updatedAt

Relations:
  customer â†’ Customer
```

### 3.3 DunningRule (NEW â€” or reuse existing EscalationStep)

**Purpose:** Define dunning escalation rules by customer segment and overdue stage.

```
DunningRule
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ name: String
â”œâ”€â”€ customerSegment: String             â† ALL | RESIDENTIAL | COMMERCIAL | GOVERNMENT
â”œâ”€â”€ triggerDaysOverdue: Int             â† Days past due to trigger this stage
â”œâ”€â”€ stage: Int                          â† 0-7
â”œâ”€â”€ action: String                      â† SEND_NOTIFICATION | ASSIGN_COLLECTOR | ESCALATE
â”œâ”€â”€ channel: String                     â† EMAIL | SMS | WHATSAPP | PUSH | CALL | LETTER | VISIT
â”œâ”€â”€ templateId: String?                 â† FK â†’ NotificationTemplate
â”œâ”€â”€ priority: Int @default(0)           â† Lower = higher priority
â”œâ”€â”€ active: Boolean @default(true)
â”œâ”€â”€ createdAt, archivedAt
```

### 3.4 InstallmentPlan (NEW)

**Purpose:** Manage payment installment plans.

```
InstallmentPlan
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ collectionCaseId: String (FK)
â”œâ”€â”€ customerId: String (FK)
â”œâ”€â”€ totalAmount: Float
â”œâ”€â”€ downPayment: Float @default(0)
â”œâ”€â”€ installmentCount: Int
â”œâ”€â”€ installmentAmount: Float            â† (totalAmount - downPayment) / installmentCount
â”œâ”€â”€ frequency: String                   â† WEEKLY | BIWEEKLY | MONTHLY
â”œâ”€â”€ firstDueDate: DateTime
â”œâ”€â”€ status: String                      â† PENDING | ACTIVE | COMPLETED | DEFAULTED
â”œâ”€â”€ missedInstallments: Int @default(0)
â”œâ”€â”€ createdAt, archivedAt, updatedAt

Relations:
  collectionCase â†’ CollectionCase
  customer â†’ Customer
  installments â†’ PlanInstallment[]
```

### 3.5 PlanInstallment (NEW)

```
PlanInstallment
â”œâ”€â”€ id, planId (FK), dueDate: DateTime, amount: Float
â”œâ”€â”€ status: String                      â† PENDING | PAID | MISSED | WAIVED
â”œâ”€â”€ paidAt: DateTime?
â”œâ”€â”€ paidAmount: Float?
â”œâ”€â”€ paymentId: String?                  â† FK â†’ Payment (when paid)
â”œâ”€â”€ createdAt

Unique: [planId, dueDate]
```

### 3.6 Dispute (NEW)

```
Dispute
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ collectionCaseId: String? (FK)
â”œâ”€â”€ invoiceId: String (FK)
â”œâ”€â”€ customerId: String (FK)
â”œâ”€â”€ reason: String                      â† BILLING_ERROR | METER_ERROR | TARIFF_DISPUTE |
â”‚                                           SERVICE_QUALITY | FINANCIAL_HARDSHIP | OTHER
â”œâ”€â”€ description: String
â”œâ”€â”€ status: String                      â† OPEN | INVESTIGATING | RESOLVED | REJECTED
â”œâ”€â”€ evidence: String? (JSON)
â”œâ”€â”€ resolution: String?
â”œâ”€â”€ resolvedAt: DateTime?
â”œâ”€â”€ resolvedBy: String?
â”œâ”€â”€ createdAt, archivedAt, updatedAt
```

### 3.7 ProvisionRule (NEW)

**Purpose:** Define bad debt provisioning rules per aging bucket.

```
ProvisionRule
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ name: String
â”œâ”€â”€ agingBucket: String                 â† current | bucket_30 | bucket_60 | bucket_90 | bucket_120 | bucket_120plus
â”œâ”€â”€ provisionRate: Float                â† 0.02 for 2%
â”œâ”€â”€ active: Boolean @default(true)
â”œâ”€â”€ createdAt, archivedAt
```

### 3.8 BadDebtProvision (NEW)

```
BadDebtProvision
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ periodId: String (FK â†’ FinancialPeriod)
â”œâ”€â”€ totalOutstanding: Float
â”œâ”€â”€ totalProvision: Float
â”œâ”€â”€ provisions: String (JSON)           â† [{ bucket, outstanding, rate, provision }]
â”œâ”€â”€ journalEntryId: String? (FK â†’ JournalEntry)
â”œâ”€â”€ status: String                      â† DRAFT | POSTED
â”œâ”€â”€ createdAt, archivedAt

Relations:
  period â†’ FinancialPeriod
  journalEntry â†’ JournalEntry
```

### 3.9 WriteOffRequest (NEW)

**Purpose:** Governed write-off approval workflow.

```
WriteOffRequest
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ collectionCaseId: String (FK)
â”œâ”€â”€ customerId: String (FK)
â”œâ”€â”€ amount: Float
â”œâ”€â”€ reason: String
â”œâ”€â”€ status: String                      â† PENDING | APPROVED | REJECTED
â”œâ”€â”€ requestedBy: String (FK â†’ User)
â”œâ”€â”€ reviewedBy: String? (FK â†’ User)
â”œâ”€â”€ reviewedAt: DateTime?
â”œâ”€â”€ rejectReason: String?
â”œâ”€â”€ journalEntryId: String? (FK â†’ JournalEntry)  â† Write-off JE posted on approval
â”œâ”€â”€ createdAt, archivedAt
```

### 3.10 New Models Summary

| # | Model | Lines | Purpose |
|---|-------|-------|---------|
| 1 | CustomerRiskProfile | ~18 | AI-computed payment behavior profile |
| 2 | DunningRule | ~14 | Dunning escalation rules |
| 3 | InstallmentPlan | ~18 | Payment installment plans |
| 4 | PlanInstallment | ~10 | Individual installments |
| 5 | Dispute | ~18 | Invoice/case dispute management |
| 6 | ProvisionRule | ~10 | Bad debt provision rates |
| 7 | BadDebtProvision | ~14 | Period-end provisions |
| 8 | WriteOffRequest | ~16 | Write-off approval |
| **Total** | **8 new models** | **~118 lines** | |

**Enhanced existing:** CollectionCase (~20 new fields), PromiseToPay (~5 new fields)

---

## PART 4: COLLECTION STRATEGY FRAMEWORK

### 4.1 Customer Segmentation for Collections

| Segment | Criteria | Strategy | Dunning Tone |
|---------|----------|----------|-------------|
| **Premium** | Government, Corporate Large, High-value residential | SOFT â€” personalized outreach, relationship management | Polite reminder, account manager CC'd |
| **Standard** | Corporate Small, Residential standard | STANDARD â€” automated dunning, self-service options | Firm but professional |
| **At Risk** | Low payment probability (< 0.4), missed PTPs | AGGRESSIVE â€” intensive dunning, field visit, escalation | Urgent, escalating |
| **Hardship** | Disputed invoice, financial hardship case | SOFT â€” payment arrangement, installment plan | Supportive, flexible |
| **Legal** | High amount (> 100K), 120+ days, no contact | LEGAL â€” final notice, legal proceedings | Legal warning |

### 4.2 Strategy Engine

```
CollectionStrategyEngine.getStrategy(customer, case):
  1. LOAD CustomerRiskProfile for customer
  2. CHECK paymentProbability:
     IF probability < 0.2 â†’ "AGGRESSIVE"
     IF probability < 0.4 â†’ "STANDARD"
  
  3. CHECK dispute status:
     IF case.disputeStatus == "OPEN" â†’ "HARDSHIP"
  
  4. CHECK amount + aging:
     IF case.totalAmount > 100000 AND stage >= 5 â†’ "LEGAL"
  
  5. CHECK customer segment:
     IF segment == "GOVERNMENT" AND probability > 0.6 â†’ "SOFT"
  
  6. DEFAULT: "STANDARD"
  
  7. RETURN strategy name + dunning rules for that segment
```

### 4.3 Dunning Escalation â€” 7 Stages

```
STAGE 0: DAY 1 (overdue by 1 day)
  Channel: Email
  Template: Payment reminder â€” polite
  Action: Auto-send
  PTP: Optional

STAGE 1: DAY 7
  Channel: SMS + Email
  Template: Overdue notice â€” firm
  Action: Auto-send
  PTP: Encouraged

STAGE 2: DAY 15
  Channel: SMS + Email + WhatsApp
  Template: Second notice â€” urgent
  Action: Auto-send
  PTP: Requested

STAGE 3: DAY 30
  Channel: SMS + Email + WhatsApp + Call
  Template: Final notice
  Action: Auto-send + collector assigned
  PTP: Required to proceed
  Escalation: Case assigned to collector

STAGE 4: DAY 45
  Channel: Letter (registered mail) + Call
  Template: Pre-disconnection warning
  Action: Collector dispatches field visit
  PTP: Required â€” missed PTP â†’ escalate
  Escalation: Supervisor notified

STAGE 5: DAY 60
  Channel: Letter + Field Visit
  Template: Disconnection notice
  Action: Field visit by technician
  PTP: Final opportunity
  Escalation: Manager approval required for next stage

STAGE 6: DAY 75+
  Channel: Legal notice (registered mail)
  Template: Legal proceedings warning
  Action: Prepare write-off or legal case
  PTP: N/A
  Escalation: CFO/legal team
```

### 4.4 Dunning Rule Evaluation

```
DunningEngine.evaluate():
  1. FOR each active CollectionCase:
     a. SKIP if status == RESOLVED or WRITE_OFF or CLOSED
     b. SKIP if has active InstallmentPlan (plan handles comms)
     
     c. daysOverdue = TODAY - dueDate (from linked invoice)
     d. currentStage = case.stage
     
     e. Find matching DunningRule:
        WHERE customerSegment == customer.segment
        AND triggerDaysOverdue <= daysOverdue
        AND stage > currentStage
        ORDER BY triggerDaysOverdue ASC
        LIMIT 1
     
     f. IF rule found:
        - Execute action (send notification via channel)
        - Update case: stage, dunningLastAt, nextDunningAt
        - Log CollectionAction: type = "dunning_auto", result = "sent"
     
     g. IF rule.action == "ASSIGN_COLLECTOR":
        - Auto-assign to available collector (round-robin or least-loaded)
     
     h. IF rule.action == "ESCALATE":
        - Notify supervisor
        - Log SLA escalation event

  2. SCHEDULE: Run every 6 hours (or configurable interval)
```

---

## PART 5: AI COLLECTION INTELLIGENCE AGENT

### 5.1 Agent Design

**Agent Name:** Collection Intelligence Agent  
**Framework:** C12-W07 Operational Intelligence (AIRecommendation model)  
**Autonomy Level:** âš¡ Semi-autonomous  

| Capability | Autonomy | Human Approval |
|------------|----------|----------------|
| Payment probability scoring | âœ… Full | None (read-only score) |
| Next-best-action recommendation | âš¡ Semi | Required for execution |
| Collection priority scoring | âœ… Full | None (read-only score) |
| Churn prediction | âœ… Full | None (alert only) |
| Strategy optimization | âš¡ Semi | Recommended strategies |
| Revenue recovery forecasting | âœ… Full | None (forecast only) |

### 5.2 Payment Probability Scoring

```
ALGORITHM: scorePaymentProbability(customerId):
  profile = CustomerRiskProfile.findUnique(customerId)
  
  // Factors:
  score = 0.5  // base
  
  // 1. Payment history weight: 30%
  IF profile.onTimePaymentRate > 0.8:      score += 0.15
  ELSE IF profile.onTimePaymentRate > 0.6:  score += 0.10
  ELSE IF profile.onTimePaymentRate > 0.4:  score += 0.05
  ELSE:                                      score -= 0.10
  
  // 2. PTP reliability weight: 20%
  IF profile.ptpReliability > 0.8:          score += 0.10
  ELSE IF profile.ptpReliability > 0.5:     score += 0.05
  ELSE IF profile.ptpReliability < 0.3:     score -= 0.10
  
  // 3. Customer tenure weight: 10%
  daysSinceCreation = TODAY - customer.createdAt
  IF daysSinceCreation > 730:               score += 0.05      // 2+ years
  ELSE IF daysSinceCreation > 365:           score += 0.02      // 1+ year
  ELSE IF daysSinceCreation < 90:            score -= 0.05      // new customer
  
  // 4. Invoice amount vs historical weight: 15%
  avgInvoice = profile.totalBilledLast12Months / 12
  currentInvoiceRelative = currentAmount / MAX(avgInvoice, 1)
  IF currentInvoiceRelative > 3:             score -= 0.10      // unusually high
  ELSE IF currentInvoiceRelative > 2:        score -= 0.05
  
  // 5. Recent contact weight: 10%
  daysSinceLastContact = TODAY - case.lastContactAt
  IF daysSinceLastContact < 7:               score += 0.05      // recently contacted
  ELSE IF daysSinceLastContact > 30:          score -= 0.03      // no recent contact
  
  // 6. Seasonality weight: 5%
  // (Historical pattern for this month)
  
  // 7. Dispute weight: 10%
  IF case.disputeStatus == "OPEN":           score -= 0.10
  
  // Normalize: 0.0 - 1.0
  score = Math.max(0, Math.min(1, score))
  
  RETURN score
```

### 5.3 Next-Best-Action Recommendations

```
ALGORITHM: recommendNextAction(case):
  probability = case.paymentProbability
  strategy = CollectionStrategyEngine.getStrategy(customer, case)
  stage = case.stage
  amount = case.totalAmount
  
  IF probability > 0.7:
    RETURN { action: "SEND_REMINDER", channel: "EMAIL", urgency: "LOW",
             reason: "High probability â€” simple reminder sufficient" }
  
  IF probability > 0.5 AND probability <= 0.7:
    IF stage < 2:
      RETURN { action: "SEND_REMINDER", channel: "SMS+EMAIL", urgency: "MEDIUM",
               reason: "Moderate probability â€” standard dunning" }
    ELSE:
      RETURN { action: "REQUEST_PTP", channel: "CALL", urgency: "MEDIUM",
               reason: "Moderate probability â€” PTP may resolve" }
  
  IF probability > 0.3 AND probability <= 0.5:
    IF !case.assignedTo:
      RETURN { action: "ASSIGN_COLLECTOR", urgency: "HIGH",
               reason: "Low probability â€” needs collector intervention" }
    ELSE:
      RETURN { action: "FIELD_VISIT", urgency: "HIGH",
               reason: "Low probability â€” field visit recommended" }
  
  IF probability <= 0.3:
    IF amount > 10000:
      RETURN { action: "ESCALATE_TO_MANAGER", urgency: "CRITICAL",
               reason: "Very low probability + high amount â€” escalate" }
    ELSE:
      RETURN { action: "PREPARE_WRITE_OFF", urgency: "HIGH",
               reason: "Very low probability â€” consider write-off" }
  
  IF disputeStatus == "OPEN":
    RETURN { action: "REVIEW_DISPUTE", urgency: "HIGH",
             reason: "Active dispute â€” resolve before collection" }
```

### 5.4 Churn Prediction

```
ALGORITHM: predictChurnRisk(customerId):
  profile = CustomerRiskProfile.findUnique(customerId)
  
  riskFactors = []
  
  // 1. Payment behavior
  IF profile.missedPtpCount > 3:
    riskFactors.push({ factor: "REPEATED_MISSED_PTPS", weight: 0.3 })
  IF profile.onTimePaymentRate < 0.5:
    riskFactors.push({ factor: "LOW_ON_TIME_RATE", weight: 0.25 })
  
  // 2. Aging trend
  cases = CollectionCase.findMany({ customerId })
  IF cases.some(c => c.stage > 4):
    riskFactors.push({ factor: "DEEP_AGING", weight: 0.2 })
  
  // 3. Dispute activity
  disputes = Dispute.findMany({ customerId })
  IF disputes.length > 2:
    riskFactors.push({ factor: "MULTIPLE_DISPUTES", weight: 0.15 })
  
  // 4. Communication
  IF !profile.lastPaymentAt OR profile.lastPaymentAt < 90 days ago:
    riskFactors.push({ factor: "NO_RECENT_PAYMENT", weight: 0.1 })
  
  churnScore = SUM(riskFactors.weight) // 0.0 - 1.0
  
  RETURN {
    churnProbability: churnScore,
    riskFactors: riskFactors.sort(weight DESC),
    recommendation: churnScore > 0.5 ? "RETENTION_CAMPAIGN" : "MONITOR"
  }
```

---

## PART 6: DISPUTE MANAGEMENT WORKFLOW

### 6.1 Dispute Lifecycle

```
DISPUTE CREATED (by customer via portal/phone/email)
    â”‚
    â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  OPEN    â”‚  Initial state
â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜
     â”‚
     â”‚ ASSIGN
     â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ INVESTIGATING â”‚  Collector/analyst reviews
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚
   â”Œâ”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚                   â”‚
   â–¼                   â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚RESOLVEDâ”‚       â”‚ REJECTED â”‚  (if no merit)
â””â”€â”€â”€â”¬â”€â”€â”€â”€â”˜       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
    â”‚
    â”œâ”€â”€â†’ Correction applied if billing error
    â”œâ”€â”€â†’ Collection case updated
    â””â”€â”€â†’ Customer notified
```

### 6.2 Dispute Types and Resolution

| Dispute Type | Common Cause | Resolution | Impact on Collections |
|-------------|-------------|------------|----------------------|
| BILLING_ERROR | Wrong tariff, wrong consumption, duplicate | Cancel invoice, regenerate | Pause dunning during investigation |
| METER_ERROR | Faulty meter, wrong reading | Schedule meter check, adjust reading | Pause dunning |
| TARIFF_DISPUTE | Customer claims wrong tariff applied | Review tariff assignment, adjust if needed | Pause dunning |
| SERVICE_QUALITY | Poor voltage, frequent outages | Log service complaint, compensate | May offer discount |
| FINANCIAL_HARDSHIP | Job loss, medical emergency | Offer installment plan, defer payment | Switch to HARDSHIP strategy |
| OTHER | Various | Investigate case-by-case | Case-by-case |

---

## PART 7: BAD DEBT PROVISIONING & WRITE-OFF GOVERNANCE

### 7.1 Provision Calculation

```
ProvisionEngine.calculate(periodId):
  1. LOAD all outstanding invoices by aging bucket
     current:     EGP 500,000   Ã— 0.5%  = EGP 2,500
     bucket_30:   EGP 350,000   Ã— 2%    = EGP 7,000
     bucket_60:   EGP 200,000   Ã— 10%   = EGP 20,000
     bucket_90:   EGP 100,000   Ã— 25%   = EGP 25,000
     bucket_120:  EGP 50,000    Ã— 50%   = EGP 25,000
     bucket_120+: EGP 25,000    Ã— 80%   = EGP 20,000
     â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     TOTAL:                     EGP 99,500
  
  2. CREATE BadDebtProvision:
     totalOutstanding = EGP 1,225,000
     totalProvision = EGP 99,500
     provisions = [{ bucket: "current", outstanding, rate, provision }, ...]
  
  3. GENERATE journal entry (via W01 PostingEngine):
     DR: Bad Debt Expense (6101-01)        EGP 99,500
     CR: Allowance for Doubtful Accounts   EGP 99,500
  
  4. RETURN BadDebtProvision
```

### 7.2 Write-Off Approval Workflow

```
Write-off Initiated (Collector recommends)
    â”‚
    â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  PENDING    â”‚  Request created â€” awaiting review
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜
       â”‚
   â”Œâ”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚               â”‚
   â–¼               â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ APPROVED â”‚  â”‚ REJECTED â”‚  â† Back to collection
â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
     â”‚
     â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  EXECUTE â”‚  Post journals, close case, update customer
â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜
     â”‚
     â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  RECOVERY â”‚  (if payment received after write-off)
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Approval Rules:**
| Amount | Approver |
|--------|----------|
| < 5,000 EGP | Collection Supervisor |
| 5,000 - 25,000 EGP | Collection Manager |
| 25,000 - 100,000 EGP | Finance Manager |
| > 100,000 EGP | CFO |

---

## PART 8: DASHBOARDS & WORKBENCH

### 8.1 Collector Workbench (`/admin/collections/my-cases`)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ MY COLLECTION CASES (24)                               FILTER: All â”‚ Priority v    â”‚
â”‚                                                                                       â”‚
â”‚ â”Œâ”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ #  â”‚ Customer        â”‚ Amount   â”‚ Days â”‚ Stage  â”‚ Prob.   â”‚ Last Act â”‚ Action   â”‚  â”‚
â”‚ â”‚ 1  â”‚ EgyptAir Tower  â”‚ EGP 45K  â”‚ 78   â”‚ â–ˆâ–ˆ 5   â”‚ 0.25 ðŸ”´ â”‚ 2d ago   â”‚ [Visit]  â”‚  â”‚
â”‚ â”‚ 2  â”‚ Nile Corp       â”‚ EGP 12K  â”‚ 34   â”‚ â–ˆâ–ˆ 3   â”‚ 0.45 ðŸŸ¡ â”‚ 1d ago   â”‚ [Call]   â”‚  â”‚
â”‚ â”‚ 3  â”‚ Mohamed Ali     â”‚ EGP 3.2K â”‚ 12   â”‚ â–ˆâ–ˆ 1   â”‚ 0.72 ðŸŸ¢ â”‚ Auto     â”‚ [Remind] â”‚  â”‚
â”‚ â”‚ 4  â”‚ Heliopolis Co   â”‚ EGP 28K  â”‚ 56   â”‚ â–ˆâ–ˆ 4   â”‚ 0.31 ðŸ”´ â”‚ 5d ago   â”‚ [PTP]    â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                                       â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ TODAY'S ACTIONS (5)                                                                â”‚  â”‚
â”‚ â”‚ â˜ Call EgyptAir Tower â€” Stage 5 overdue for field visit                          â”‚  â”‚
â”‚ â”‚ â˜ Send PTP reminder to Heliopolis Co â€” promised yesterday                       â”‚  â”‚
â”‚ â”‚ â˜ Review dispute â€” Nile Corp invoice INV-2026-0712                               â”‚  â”‚
â”‚ â”‚ â˜ Approve write-off â€” Small Customer #C-451 (EGP 1,200)                         â”‚  â”‚
â”‚ â”‚ â˜ Close case â€” Mohamed Ali (paid in full)                                        â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 8.2 Supervisor Dashboard (`/admin/collections/supervisor`)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ COLLECTION SUPERVISOR DASHBOARD                                                         â”‚
â”‚                                                                                       â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ Open Cases   â”‚ â”‚ Assigned     â”‚ â”‚ Unassigned   â”‚ â”‚ Avg Age      â”‚ â”‚ Collector    â”‚ â”‚
â”‚ â”‚       312    â”‚ â”‚       245    â”‚ â”‚        67    â”‚ â”‚      34d     â”‚ â”‚ Eff: 78%    â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                                       â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ TEAM PERFORMANCE                                                                   â”‚  â”‚
â”‚ â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”               â”‚  â”‚
â”‚ â”‚ â”‚ Collectorâ”‚ Cases  â”‚ Resolv â”‚ PTP    â”‚ Field  â”‚ Avg    â”‚ Eff.   â”‚               â”‚  â”‚
â”‚ â”‚ â”‚          â”‚ Assigndâ”‚ /Month â”‚ Kept%  â”‚ Visits â”‚ Resp.  â”‚ Rate   â”‚               â”‚  â”‚
â”‚ â”‚ â”‚ Sarah    â”‚ 42     â”‚ 28     â”‚ 74%    â”‚ 12     â”‚ 2.1d   â”‚ 82%    â”‚               â”‚  â”‚
â”‚ â”‚ â”‚ Ahmed    â”‚ 38     â”‚ 31     â”‚ 81%    â”‚ 8      â”‚ 1.8d   â”‚ 89%    â”‚ â–²              â”‚  â”‚
â”‚ â”‚ â”‚ Mariam   â”‚ 36     â”‚ 22     â”‚ 65%    â”‚ 15     â”‚ 3.2d   â”‚ 71%    â”‚ â–¼              â”‚  â”‚
â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”˜               â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                                       â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ UNASSIGNED CASES (67) â€” Prioritized by AI Score                                    â”‚  â”‚
â”‚ â”‚ âš  EgyptAir Tower    EGP 45K  Score: 89    Days: 78    [Assign]                   â”‚  â”‚
â”‚ â”‚ âš  Industrial Zone 3 EGP 28K  Score: 76    Days: 45    [Assign]                   â”‚  â”‚
â”‚ â”‚ âš  New Cairo School  EGP 12K  Score: 64    Days: 34    [Assign]                   â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 8.3 Executive Dashboard (`/admin/collections/executive`)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ EXECUTIVE COLLECTIONS DASHBOARD                                                         â”‚
â”‚                                                                                       â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ Total AR         â”‚ â”‚ Overdue AR       â”‚ â”‚ Collection       â”‚ â”‚ Avg Days to     â”‚  â”‚
â”‚ â”‚ EGP 8.2M         â”‚ â”‚ EGP 3.1M (38%)   â”‚ â”‚ Effectiveness    â”‚ â”‚ Pay             â”‚  â”‚
â”‚ â”‚                  â”‚ â”‚                  â”‚ â”‚       76%        â”‚ â”‚       42 days   â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                                       â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ AGING BUCKETS (EGP)                                                                â”‚  â”‚
â”‚ â”‚                                                                                   â”‚  â”‚
â”‚ â”‚ Current    â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ            EGP 5.1M (62%) â”‚  â”‚
â”‚ â”‚ 1-30       â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ                                     EGP 1.2M (15%) â”‚  â”‚
â”‚ â”‚ 31-60      â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ                                           EGP 0.8M (10%) â”‚  â”‚
â”‚ â”‚ 61-90      â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ                                                EGP 0.5M (6%)  â”‚  â”‚
â”‚ â”‚ 91-120     â–ˆâ–ˆâ–ˆâ–ˆ                                                  EGP 0.3M (4%)  â”‚  â”‚
â”‚ â”‚ 120+       â–ˆâ–ˆâ–ˆ                                                   EGP 0.3M (3%)  â”‚  â”‚
â”‚ â”‚                                                                                   â”‚  â”‚
â”‚ â”‚ Provision Required: EGP 245K â”‚ Already Provided: EGP 200K â”‚ Gap: EGP 45K        â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                                       â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚ â”‚ COLLECTION TREND (12 months) â”‚ â”‚ RECOVERY FORECAST (Next Quarter)              â”‚    â”‚
â”‚ â”‚                              â”‚ â”‚                                                 â”‚    â”‚
â”‚ â”‚  Jan â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 78%            â”‚ â”‚ Expected Recovery:     EGP 1.8M                â”‚    â”‚
â”‚ â”‚  Feb â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 82%           â”‚ â”‚ At Risk:               EGP 0.6M                â”‚    â”‚
â”‚ â”‚  Mar â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 76%            â”‚ â”‚ Write-off Forecast:    EGP 0.2M                â”‚    â”‚
â”‚ â”‚  Apr â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 79%            â”‚ â”‚ Best Case:             EGP 2.1M                â”‚    â”‚
â”‚ â”‚  May â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 84% â–²         â”‚ â”‚ Worst Case:            EGP 1.4M                â”‚    â”‚
â”‚ â”‚  Jun â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 80%            â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                                      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## PART 9: INTEGRATION STRATEGY

### 9.1 Integration Points

| Source | Trigger | W04 Action | Timing |
|--------|---------|------------|--------|
| **Invoice** | Status â†’ "overdue" (dueDate passed) | Auto-create CollectionCase | Daily job |
| **Payment** | Status â†’ "completed" | Update case paidAmount, close if fully paid | Immediate |
| **Payment** | Payment allocated to case invoice | Reduce case outstanding | Immediate |
| **W01 GL** | Period-end close | Trigger BadDebtProvision calculation | Monthly |
| **W02 Revenue** | Revenue finding on customer | Flag case â€” increase priority | Immediate |
| **W03 Tariff** | Tariff change | Recalculate customer risk profile | On change |
| **C12-W07 AI** | AIRecommendation approved | Execute recommended action | On approval |
| **Notifications** | DunningEngine send | Send via Email/SMS/WhatsApp/Push | Per schedule |
| **Audit** | Every collection mutation | Log to AuditEntry | Always |

### 9.2 Auto-Creation of Collection Cases

```
Daily job â€” CollectionCaseAutoCreator.run():
  1. FIND overdue invoices
     WHERE dueDate < TODAY
     AND status IN ("issued", "partial")
     AND archivedAt IS NULL
  
  2. FOR each invoice:
     EXISTING = CollectionCase.findFirst({ invoiceId })
     IF EXISTING: SKIP (already has case)
     
     customer = Customer.findUnique(invoice.customerId)
     
     profile = CustomerRiskProfile.upsert({ customerId })
     paymentProb = AI_Score.paymentProbability(customerId)
     
     CollectionCase.create({
       customerId: invoice.customerId,
       invoiceId: invoice.id,
       status: "open",
       stage: 0,
       totalAmount: invoice.amount,
       paidAmount: invoice.paidAmount,
       priority: calculatePriority(invoice.amount, paymentProb),
       paymentProbability: paymentProb,
       riskBucket: classifyRisk(paymentProb),
     })
     
     Log: CollectionAction.create({ type: "auto_created", result: "system" })
```

---

## PART 10: TESTING STRATEGY â€” W04 (105 Tests)

### 10.1 Aging Engine Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Invoice due today â†’ bucket "current" | Current bucket |
| 2 | Invoice due 15 days ago â†’ bucket "30" | Correct bucket |
| 3 | Invoice due 45 days ago â†’ bucket "60" | Correct bucket |
| 4 | Invoice due 90 days ago â†’ bucket "120" | Maximum boundary |
| 5 | Invoice due 150 days ago â†’ bucket "120+" | Beyond maximum |
| 6 | Multi-invoice aging â†’ correct aggregation | Sum across buckets |
| 7 | Partially paid invoice â†’ outstanding only | Correct remaining |
| 8 | Paid invoice â†’ excluded from aging | Filtered |
| 9 | Cancelled invoice â†’ excluded | Filtered |
| 10 | Portfolio aging for area â†’ correct bucket sums | Area filter |

### 10.2 Collection Strategy Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | High probability â†’ SOFT strategy | Correct strategy |
| 2 | Low probability â†’ AGGRESSIVE strategy | Correct strategy |
| 3 | Medium probability â†’ STANDARD strategy | Correct strategy |
| 4 | Open dispute â†’ HARDSHIP strategy | Override |
| 5 | High amount + deep aging â†’ LEGAL strategy | Override |
| 6 | Government customer â†’ SOFT (if high prob) | Segment override |
| 7 | Strategy changes when probability changes | Re-evaluation |
| 8 | No CustomerRiskProfile â†’ default STANDARD | Fallback |

### 10.3 Dunning Engine Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Stage 0 trigger (day 1) â†’ email sent | Auto-dunning fires |
| 2 | Stage 1 trigger (day 7) â†’ SMS+Email sent | Multi-channel |
| 3 | Stage 3 trigger (day 30) â†’ collector assigned | Auto-assignment |
| 4 | Stage 5 trigger (day 60) â†’ field visit | Visit scheduled |
| 5 | Case resolved â†’ no further dunning | Stops |
| 6 | Active installment plan â†’ no dunning | Paused |
| 7 | PTP kept â†’ stage resets | Reset |
| 8 | PTP missed â†’ stage escalates | Escalate |
| 9 | No matching rule for segment â†’ skip | Graceful |
| 10 | Dunning runs on schedule â†’ all evaluated | Batch processing |

### 10.4 PTP Engine Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Create PTP â†’ status "pending" | Correct initial |
| 2 | Fulfill PTP â†’ status "kept", case updated | Success path |
| 3 | Miss PTP â†’ status "missed", case escalates | Failure path |
| 4 | Multiple PTPs on same case â†’ all tracked | History |
| 5 | PTP reminder fires before promisedDate | Auto-reminder |
| 6 | PTP after write-off â†’ rejected | State guard |
| 7 | PTP amount > outstanding â†’ rejected | Validation |

### 10.5 Installment Plan Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Create plan â†’ installments generated | Correct count |
| 2 | Down payment â†’ first installment reduced | Correct split |
| 3 | Installment paid â†’ status "paid" | Success path |
| 4 | Installment missed â†’ plan "defaulted" | Failure path |
| 5 | All installments paid â†’ plan "completed" | Completion |
| 6 | Early payment â†’ remaining installments closed | Early closure |
| 7 | Plan during dispute â†’ allowed | Compatibility |

### 10.6 Dispute Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Create dispute â†’ status "open" | Correct initial |
| 2 | Resolve dispute â†’ dunning resumes | Integration |
| 3 | Reject dispute â†’ dunning continues | Integration |
| 4 | Multiple disputes same invoice â†’ all tracked | History |
| 5 | Dispute with billing error â†’ correction flow | Correction |

### 10.7 Bad Debt Provision Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Calculate provision â†’ correct rates applied | Rate match |
| 2 | Provision journal entry posted â†’ GL updated | Integration with W01 |
| 3 | Multiple periods â†’ separate provisions | Per-period |
| 4 | Zero outstanding â†’ zero provision | Empty state |
| 5 | Provision rule changes â†’ recalculated | On change |

### 10.8 Write-Off Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Request write-off â†’ status "pending" | Initial state |
| 2 | Approve write-off â†’ case closed | Success path |
| 3 | Reject write-off â†’ case continues | Failure path |
| 4 | Approve write-off â†’ journal entry posted | GL integration |
| 5 | Write-off amount > outstanding â†’ rejected | Validation |

### 10.9 AI Agent Tests (5)

| # | Test | Expect |
|---|------|--------|
| 1 | Payment probability 0-1 range | Valid range |
| 2 | Next-best-action relevant to state | Appropriate |
| 3 | Churn prediction factors correct | Explainable |
| 4 | Agent does not auto-execute actions | Governance |
| 5 | Agent recommendations audited | Audit trail |

---

## PART 11: W04 DEFINITION OF DONE

```
W04 â€” COLLECTION INTELLIGENCE & RECEIVABLES MANAGEMENT ENGINE
CERTIFICATION CHECKLIST

â–¡ CORE DATA MODELS â€” 8 NEW
   â–¡ CustomerRiskProfile (AI payment behavior)
   â–¡ DunningRule (escalation rules per segment)
   â–¡ InstallmentPlan (payment installment plans)
   â–¡ PlanInstallment (individual installments)
   â–¡ Dispute (invoice/case disputes)
   â–¡ ProvisionRule (bad debt provision rates)
   â–¡ BadDebtProvision (period-end provisions)
   â–¡ WriteOffRequest (write-off approval)
   â–¡ CollectionCase enhanced (+20 new fields)
   â–¡ PromiseToPay enhanced (+5 new fields)

â–¡ AGING ENGINE
   â–¡ Per-customer aging (current, 30, 60, 90, 120, 120+)
   â–¡ Portfolio aging with filters (area, segment, collector)
   â–¡ Aging trend (month-over-month comparison)
   â–¡ Weighted average days overdue

â–¡ COLLECTION STRATEGY
   â–¡ 5 strategies: SOFT, STANDARD, AGGRESSIVE, HARDSHIP, LEGAL
   â–¡ Segment-based strategy selection
   â–¡ Strategy override for disputes/hardship
   â–¡ DunningRule engine (7 escalation stages)

â–¡ AUTOMATED DUNNING
   â–¡ 7-stage escalation pipeline
   â–¡ Multi-channel: Email, SMS, WhatsApp, Push, Call, Letter, Field Visit
   â–¡ Auto-assignment of collectors at stage 3+
   â–¡ PTP creation and tracking
   â–¡ PTP reminders (before promised date)
   â–¡ PTP missed escalation
   â–¡ Configurable per customer segment

â–¡ INSTALLMENT PLANS
   â–¡ Plan creation with down payment
   â–¡ Auto-generated installment schedule
   â–¡ Payment tracking per installment
   â–¡ Default detection and escalation

â–¡ DISPUTE MANAGEMENT
   â–¡ 5 dispute types
   â–¡ Full lifecycle: OPEN â†’ INVESTIGATING â†’ RESOLVED | REJECTED
   â–¡ Evidence collection
   â–¡ Pause dunning during active dispute

â–¡ BAD DEBT PROVISIONING
   âœ… Provision rates per aging bucket
   âœ… Auto-calculation at period end
   âœ… Journal entry creation (via W01 PostingEngine)

â–¡ WRITE-OFF GOVERNANCE
   â–¡ 4-level approval threshold
   â–¡ Write-off journal entry on approval
   â–¡ Recovery tracking post write-off

â–¡ AI COLLECTION INTELLIGENCE AGENT
   â–¡ Payment probability scoring (0.0-1.0)
   â–¡ Next-best-action recommendation
   â–¡ Churn prediction
   â–¡ Revenue recovery forecasting
   â–¡ C12 AIRecommendation integration

â–¡ DASHBOARDS
   â–¡ Collector Workbench (/admin/collections/my-cases)
   â–¡ Supervisor Dashboard (/admin/collections/supervisor)
   â–¡ Executive Dashboard (/admin/collections/executive)

â–¡ INTEGRATIONS
   â–¡ Invoice overdue â†’ auto-create CollectionCase
   â–¡ Payment received â†’ update case
   â–¡ W01 GL â†’ provision journal entry
   â–¡ W02 Revenue â†’ priority flagging
   â–¡ W03 Tariff â†’ risk profile
   â–¡ C12-W07 AI â†’ recommendations + patterns
   â–¡ Notification Center â†’ multi-channel dunning
   â–¡ Audit â†’ every mutation logged

â–¡ SECURITY
   â–¡ RBAC: Collector, Supervisor, Manager, Executive, Auditor
   â–¡ Segregation: collector â‰  supervisor â‰  approver
   â–¡ Write-off multi-level approval
   â–¡ Investigation log append-only
   â–¡ All mutations audited

â–¡ TESTS â€” 105 PASSING
   â–¡ Aging engine: 15 tests
   â–¡ Collection strategy: 15 tests
   â–¡ Dunning engine: 20 tests
   â–¡ PTP engine: 15 tests
   â–¡ Installment plan: 10 tests
   â–¡ Dispute: 10 tests
   â–¡ Bad debt provision: 10 tests
   â–¡ Write-off: 10 tests
   â–¡ AI agent: 5 tests

W04 STATUS: â–¡ NOT IMPLEMENTED
All items above are DESIGN-COMPLETE but not executed.
```

---

## APPENDIX A: W04 DEPENDENCY GRAPH

```
W01 (Billing-to-GL) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
W02 (Revenue Assurance) â”€â”€â”€â”€â”€â”€â”¤
W03 (Tariff Intelligence) â”€â”€â”€â”€â”¤
Invoice + Payment (existing) â”€â”¤
CollectionCase (existing) â”€â”€â”€â”€â”¤
PromiseToPay (existing) â”€â”€â”€â”€â”€â”€â”¤
SLA/Escalation (existing) â”€â”€â”€â”€â”¤
Notification Center (exist) â”€â”€â”¤
C12-W07 AI Framework â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
                               â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚  W04 COLLECTION       â”‚
                    â”‚  INTELLIGENCE ENGINE  â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                          â”‚
                          â”œâ”€â”€â†’ AgingEngine
                          â”œâ”€â”€â†’ DunningEngine
                          â”œâ”€â”€â†’ StrategyEngine
                          â”œâ”€â”€â†’ PTPEngine
                          â”œâ”€â”€â†’ InstallmentEngine
                          â”œâ”€â”€â†’ ProvisionEngine
                          â”œâ”€â”€â†’ WriteOffEngine
                          â”œâ”€â”€â†’ AI Collection Agent
                          â”œâ”€â”€â†’ 3 frontend dashboards
                          â””â”€â”€â†’ Integration hooks
```

## APPENDIX B: W04 FILE MANIFEST

| # | File | Action | Lines |
|---|------|--------|-------|
| 1 | `backend/prisma/schema.prisma` | MODIFY | +120 lines (8 new models + enhanced fields) |
| 2 | Migration: collection_intelligence | CREATE | Standard |
| 3 | `backend/src/services/aging-engine.js` | **CREATE** | ~150 lines |
| 4 | `backend/src/services/collection-strategy.js` | **CREATE** | ~100 lines |
| 5 | `backend/src/services/dunning-engine.js` | **CREATE** | ~200 lines |
| 6 | `backend/src/services/ptp-engine.js` | **CREATE** | ~120 lines |
| 7 | `backend/src/services/installment-engine.js` | **CREATE** | ~120 lines |
| 8 | `backend/src/services/provision-engine.js` | **CREATE** | ~80 lines |
| 9 | `backend/src/services/write-off-engine.js` | **CREATE** | ~80 lines |
| 10 | `backend/src/services/collection-ai.js` | **CREATE** | ~150 lines |
| 11 | `backend/src/routes/collections.js` | **CREATE** | ~300 lines |
| 12 | `backend/src/services/billing-engine.js` | MODIFY | +5 lines (auto-create case on overdue) |
| 13 | `backend/src/services/posting-engine.js` | MODIFY | +3 lines (provision JE type) |
| 14 | `backend/src/server.js` | MODIFY | +2 lines |
| 15 | `Frontend/src/app/admin/collections/my-cases/page.tsx` | **CREATE** | ~300 lines |
| 16 | `Frontend/src/app/admin/collections/supervisor/page.tsx` | **CREATE** | ~250 lines |
| 17 | `Frontend/src/app/admin/collections/executive/page.tsx` | **CREATE** | ~250 lines |
| 18 | `Frontend/src/app/admin/collections/[id]/page.tsx` | **CREATE** | ~200 lines |

**Total estimated new code:** ~2,500 lines
**Total estimated tests:** 105 tests
**Cumulative C13 (W01-W04):** 85 + 95 + 100 + 105 = 385 tests

---

*This document is a planning artifact only. No code, no implementation, no database migration.*
*C13-W04 â€” Collection Intelligence & Receivables Management Engine. READ ONLY. GOVERNANCE PLANNING ONLY.*

