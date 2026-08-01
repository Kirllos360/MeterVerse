<!-- Status Block
====================================================================
Design: [x] Complete | Implementation: [ ] Not Started | Certification: [ ] Not Certified | Wave: W2+ | Commit: 936be39c
====================================================================
-->

# C13-W05 â€” Enterprise Bank Reconciliation & Cash Management Platform
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY â€” GOVERNANCE PLANNING ONLY â€” NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Program:** C13 Enterprise Financial & Billing Intelligence Platform  
**Wave:** W05 (Bank Reconciliation & Cash Management)  

---

## PART 1: CURRENT STATE AUDIT

### 1.1 Existing Infrastructure

| Component | Location | Status | Capability |
|-----------|----------|--------|------------|
| **PaymentGateway** model | `schema.prisma:1443` | âœ… Complete | name, provider, config, active, testMode |
| **PaymentTransaction** model | `schema.prisma:1456` | âœ… Complete | gatewayId, transactionId, amount, currency, status |
| **GatewayLog** model | `schema.prisma:1480` | âœ… Complete | request, response, status |
| **Payment** model | `schema.prisma:1013` | âœ… Complete | method (cash/bank/card), status, paidAt |
| **Payment** method enum | Routes | âœ… Complete | cash, bank, card, check, wallet |
| **CustomerLedgerEntry** | `schema.prisma:1493` | âœ… Complete | Overpayments, credits, refunds |
| **W01 PostingEngine** | Planned | âŒ Pending | Auto-journal from payments |
| **W02 Revenue Assurance** | Planned | âŒ Pending | Payment discrepancy detection |
| **W04 Collection Intel** | Planned | âŒ Pending | Payment allocation tracking |

### 1.2 Gap Analysis

| Capability | Current | W05 Target |
|------------|---------|------------|
| Bank account management | âŒ None | Multi-bank hierarchy with balances |
| Bank statement import | âŒ None | CSV, Excel, CAMT.053, MT940, API |
| Statement lifecycle | âŒ None | UPLOADED â†’ PARSED â†’ MATCHING â†’ RECONCILED â†’ POSTED |
| Auto-reconciliation engine | âŒ None | Rule-based matching with AI assistance |
| Manual reconciliation | âŒ None | Interactive workbench |
| Multi-currency | âŒ None | FX rates, auto-conversion, GL posting |
| Payment gateway reconciliation | âŒ None | Gateway statement vs bank statement |
| Duplicate payment detection | âŒ None | Fingerprint matching |
| Unidentified payments | âŒ None | Suspense account workflow |
| Returned payments / chargebacks | âŒ None | Full lifecycle management |
| Bank fee accounting | âŒ None | Auto-detect and post fees |
| Cash position dashboard | âŒ None | Real-time consolidated view |
| Daily cash forecasting | âŒ None | AR/AP-driven forecast |
| AI Cash Intelligence | âŒ None | Anomaly detection, liquidity forecast |
| Exception management | âŒ None | Investigation and resolution workflow |

---

## PART 2: ENTERPRISE CASH MANAGEMENT ARCHITECTURE

### 2.1 High-Level Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                   BANK RECONCILIATION & CASH MANAGEMENT PLATFORM                                â”‚
â”‚                                                                                                â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  DATA INGESTION LAYER                                                                     â”‚    â”‚
â”‚  â”‚                                                                                          â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚    â”‚
â”‚  â”‚  â”‚ CSV/Excel    â”‚  â”‚ CAMT.053     â”‚  â”‚ MT940        â”‚  â”‚ Bank API     â”‚  â”‚ Gateway  â”‚  â”‚    â”‚
â”‚  â”‚  â”‚ File Import  â”‚  â”‚ (XML ISO)    â”‚  â”‚ (SWIFT)      â”‚  â”‚ (REST/SFTP)  â”‚  â”‚ (webhook)â”‚  â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                          â”‚
â”‚                                    â–¼                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  RECONCILIATION ENGINE                                                                    â”‚    â”‚
â”‚  â”‚                                                                                          â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                â”‚    â”‚
â”‚  â”‚  â”‚ Rule-Based Matcher â”‚  â”‚ AI-Assisted Matcher â”‚  â”‚ Manual Matcher    â”‚                â”‚    â”‚
â”‚  â”‚  â”‚                    â”‚  â”‚                    â”‚  â”‚                    â”‚                â”‚    â”‚
â”‚  â”‚  â”‚ â€¢ Reference match  â”‚  â”‚ â€¢ Fuzzy amount     â”‚  â”‚ â€¢ Interactive UI  â”‚                â”‚    â”‚
â”‚  â”‚  â”‚ â€¢ Amount + date    â”‚  â”‚ â€¢ Partial match    â”‚  â”‚ â€¢ Split/match     â”‚                â”‚    â”‚
â”‚  â”‚  â”‚ â€¢ Exact match      â”‚  â”‚ â€¢ Learning from    â”‚  â”‚ â€¢ Override with   â”‚                â”‚    â”‚
â”‚  â”‚  â”‚ â€¢ Fingerprint      â”‚  â”‚   manual matches   â”‚  â”‚   reason          â”‚                â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                          â”‚
â”‚                                    â–¼                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  EXCEPTION MANAGEMENT                                                                     â”‚    â”‚
â”‚  â”‚                                                                                          â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”‚    â”‚
â”‚  â”‚  â”‚ Unmatched      â”‚  â”‚ Partial Match  â”‚  â”‚ Duplicate      â”‚  â”‚ Unidentified   â”‚        â”‚    â”‚
â”‚  â”‚  â”‚ Bank Lines     â”‚  â”‚ (diff > 0.01)  â”‚  â”‚ Detected       â”‚  â”‚ Payments      â”‚        â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                          â”‚
â”‚                                    â–¼                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  ACCOUNTING INTEGRATION (via W01 PostingEngine)                                          â”‚    â”‚
â”‚  â”‚                                                                                          â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”‚    â”‚
â”‚  â”‚  â”‚ Bank Statement â”‚  â”‚ Bank Fees      â”‚  â”‚ FX Gain/Loss   â”‚  â”‚ Suspense       â”‚        â”‚    â”‚
â”‚  â”‚  â”‚ GL Posting     â”‚  â”‚ Journal        â”‚  â”‚ Journal        â”‚  â”‚ Clearance      â”‚        â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  TREASURY & CASH MANAGEMENT                                                               â”‚    â”‚
â”‚  â”‚                                                                                          â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”‚    â”‚
â”‚  â”‚  â”‚ Cash Position  â”‚  â”‚ Daily Cash     â”‚  â”‚ Liquidity      â”‚  â”‚ Multi-Currency â”‚        â”‚    â”‚
â”‚  â”‚  â”‚ Dashboard      â”‚  â”‚ Forecast       â”‚  â”‚ Planning       â”‚  â”‚ Balances       â”‚        â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                                                â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  AI CASH INTELLIGENCE AGENT                                                                â”‚    â”‚
â”‚  â”‚                                                                                          â”‚    â”‚
â”‚  â”‚  â€¢ Payment anomaly detection  â€¢ Cash flow prediction  â€¢ Liquidity forecasting           â”‚    â”‚
â”‚  â”‚  â€¢ Reconciliation suggestions â€¢ Duplicate detection    â€¢ Bank fee optimization          â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Statement Lifecycle

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ UPLOADED  â”‚  File received via upload, API, SFTP, or webhook
â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜
     â”‚
     â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  PARSED   â”‚  File parsed into structured BankStatement records
â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜
     â”‚
     â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ MATCHING   â”‚  Auto-reconciliation engine runs
â”‚   (auto)   â”‚  Rule-based + AI-assisted matching
â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜
     â”‚
    â”Œâ”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚               â”‚
    â–¼               â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ RECONCILEDâ”‚  â”‚EXCEPTION â”‚  Unmatched/partial entries
â”‚  (auto)   â”‚  â”‚          â”‚
â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜
     â”‚             â”‚
     â”‚        â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”
     â”‚        â”‚         â”‚
     â”‚        â–¼         â–¼
     â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”
     â”‚  â”‚Manual   â”‚ â”‚Investigaâ”‚
     â”‚  â”‚Matched  â”‚ â”‚ -tion   â”‚
     â”‚  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜
     â”‚       â”‚           â”‚
     â””â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
             â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ VERIFIED  â”‚  Reconciliation reviewed and approved
â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜
     â”‚
     â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  POSTED   â”‚  GL entries created (bank statement = bank GL balance)
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.3 Matching Algorithm

```
ReconciliationEngine.match(bankStatement, internalTransactions):
  matched = []
  unmatched = []
  partial = []

  STAGE 1: EXACT MATCH
    FOR each bankLine IN bankStatement:
      internal = findExactMatch(bankLine, internalTransactions)
      IF internal:
        // Exact: reference number + amount + date within 1 day
        matched.push({ bankLine, internal, method: "EXACT", confidence: 1.0 })
        internalTransactions.remove(internal)
        bankStatement.remove(bankLine)

  STAGE 2: AMOUNT + DATE FUZZY
    FOR each bankLine IN bankStatement:
      candidates = findAmountMatch(bankLine.amount, internalTransactions, tolerance: 0.01)
      IF candidates.length == 1:
        dateDiff = |candidates[0].date - bankLine.date|
        IF dateDiff <= 3 days:
          matched.push({ bankLine, internal: candidates[0], method: "AMOUNT_DATE", confidence: 0.95 })
          internalTransactions.remove(candidates[0])
          bankStatement.remove(bankLine)

  STAGE 3: REFERENCE + AMOUNT FUZZY
    FOR each bankLine IN bankStatement:
      ref = extractReference(bankLine.description)
      IF ref:
        candidates = internalTransactions.filter(t => t.reference == ref)
        IF candidates.length == 1:
          amountDiff = |candidates[0].amount - bankLine.amount|
          IF amountDiff <= 0.01:
            matched.push({ bankLine, internal: candidates[0], method: "REFERENCE", confidence: 0.98 })
          ELSE:
            partial.push({ bankLine, internal: candidates[0], diff: amountDiff, method: "REFERENCE_PARTIAL", confidence: 0.7 })

  STAGE 4: AI-ASSISTED
    FOR each remaining bankLine:
      aiResult = AICashAgent.suggestMatch(bankLine, remainingTransactions)
      IF aiResult.confidence > 0.9:
        matched.push({ bankLine, internal: aiResult.match, method: "AI_SUGGESTED", confidence: aiResult.confidence })
      ELSE:
        unmatched.push(bankLine)

  STAGE 5: MANUAL
    FOR each unmatched:
      â†’ Add to reconciliation workbench for manual matching

  RETURN { matched, partial, unmatched }
```

---

## PART 3: DATA MODEL DESIGN

### 3.1 BankAccount (NEW)

**Purpose:** Manage multi-bank account hierarchy.

```
BankAccount
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ bankName: String                 â† "National Bank of Egypt"
â”œâ”€â”€ accountName: String              â† "MeterVerse Operating Account"
â”œâ”€â”€ accountNumber: String            â† Masked/last-4-digits
â”œâ”€â”€ iban: String?                    â† International format
â”œâ”€â”€ swiftCode: String?               â† SWIFT/BIC
â”œâ”€â”€ currency: String @default("EGP")
â”œâ”€â”€ type: String                     â† CURRENT | SAVINGS | SETTLEMENT | COLLECTION
â”œâ”€â”€ openingBalance: Float @default(0)
â”œâ”€â”€ currentBalance: Float @default(0)
â”œâ”€â”€ availableBalance: Float @default(0)
â”œâ”€â”€ lastReconciledAt: DateTime?
â”œâ”€â”€ lastReconciledBalance: Float?
â”œâ”€â”€ status: String @default("ACTIVE")  â† ACTIVE | SUSPENDED | CLOSED
â”œâ”€â”€ metadata: String? (JSON)
â”œâ”€â”€ createdAt, archivedAt, updatedAt

Indexes:
  @@index([accountNumber])
  @@index([type, status])
```

### 3.2 BankStatement (NEW)

**Purpose:** Represent an imported bank statement for a specific account and period.

```
BankStatement
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ bankAccountId: String (FK â†’ BankAccount)
â”œâ”€â”€ statementDate: DateTime          â† Statement date/period-end
â”œâ”€â”€ periodStart: DateTime
â”œâ”€â”€ periodEnd: DateTime
â”œâ”€â”€ importSource: String             â† UPLOAD | API | SFTP | MANUAL
â”œâ”€â”€ importFormat: String             â† CSV | XLSX | CAMT053 | MT940 | API
â”œâ”€â”€ originalFilename: String?
â”œâ”€â”€ openingBalance: Float
â”œâ”€â”€ closingBalance: Float
â”œâ”€â”€ totalCredits: Float @default(0)
â”œâ”€â”€ totalDebits: Float @default(0)
â”œâ”€â”€ transactionCount: Int @default(0)
â”œâ”€â”€ matchedCount: Int @default(0)
â”œâ”€â”€ unmatchedCount: Int @default(0)
â”œâ”€â”€ status: String @default("UPLOADED")  â† UPLOADED|PARSED|MATCHING|RECONCILED|VERIFIED|POSTED
â”œâ”€â”€ reconciledAt: DateTime?
â”œâ”€â”€ reconciledBy: String?
â”œâ”€â”€ postedAt: DateTime?
â”œâ”€â”€ glJournalEntryId: String? (FK â†’ JournalEntry)
â”œâ”€â”€ notes: String?
â”œâ”€â”€ createdAt, archivedAt, updatedAt

Relations:
  bankAccount â†’ BankAccount
  transactions â†’ BankTransaction[]
  exceptions â†’ ReconciliationException[]

Indexes:
  @@index([bankAccountId, status])
  @@index([bankAccountId, periodEnd])
```

### 3.3 BankTransaction (NEW)

**Purpose:** Individual line items from a bank statement.

```
BankTransaction
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ bankStatementId: String (FK â†’ BankStatement)
â”œâ”€â”€ transactionDate: DateTime
â”œâ”€â”€ valueDate: DateTime?
â”œâ”€â”€ reference: String?               â† Bank reference/transaction ID
â”œâ”€â”€ description: String
â”œâ”€â”€ amount: Float                     â† Positive = credit, Negative = debit
â”œâ”€â”€ currency: String @default("EGP")
â”œâ”€â”€ exchangeRate: Float @default(1)
â”œâ”€â”€ baseAmount: Float?               â† Amount in account's base currency
â”œâ”€â”€ type: String                     â† CREDIT | DEBIT
â”œâ”€â”€ category: String?                â† FEE | INTEREST | TRANSFER | PAYMENT | CHARGEBACK | etc.
â”œâ”€â”€ internalMatchId: String?         â† FK â†’ PaymentTransaction.id (when matched)
â”œâ”€â”€ matchMethod: String?             â† EXACT | AMOUNT_DATE | REFERENCE | AI_SUGGESTED | MANUAL
â”œâ”€â”€ matchConfidence: Float?          â† 0.0-1.0
â”œâ”€â”€ matchStatus: String @default("UNMATCHED")  â† UNMATCHED | MATCHED | PARTIAL | SPLIT
â”œâ”€â”€ matchedAt: DateTime?
â”œâ”€â”€ matchedBy: String?
â”œâ”€â”€ notes: String?
â”œâ”€â”€ createdAt, archivedAt

Indexes:
  @@index([bankStatementId])
  @@index([internalMatchId])
  @@index([matchStatus])
  @@index([reference])
  @@index([amount, transactionDate])
```

### 3.4 ReconciliationException (NEW)

**Purpose:** Track unmatched and problematic items during reconciliation.

```
ReconciliationException
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ bankStatementId: String (FK â†’ BankStatement)
â”œâ”€â”€ bankTransactionId: String? (FK â†’ BankTransaction)
â”œâ”€â”€ type: String                     â† UNMATCHED_DEBIT | UNMATCHED_CREDIT | PARTIAL_MATCH |
â”‚                                        DUPLICATE | UNIDENTIFIED | AMOUNT_MISMATCH
â”œâ”€â”€ description: String
â”œâ”€â”€ amount: Float
â”œâ”€â”€ status: String @default("OPEN")  â† OPEN | INVESTIGATING | RESOLVED | DISMISSED
â”œâ”€â”€ resolvedMethod: String?          â† MANUAL_MATCH | WRITE_OFF | SUSPENSE | REVERSAL
â”œâ”€â”€ resolvedAt: DateTime?
â”œâ”€â”€ resolvedBy: String? (FK â†’ User)
â”œâ”€â”€ resolutionNote: String?
â”œâ”€â”€ journalEntryId: String? (FK â†’ JournalEntry)
â”œâ”€â”€ createdAt, archivedAt

Indexes:
  @@index([bankStatementId, status])
  @@index([type, status])
```

### 3.5 PaymentGatewaySettlement (NEW)

**Purpose:** Track payment gateway settlement statements separately from bank statements.

```
PaymentGatewaySettlement
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ gatewayId: String (FK â†’ PaymentGateway)
â”œâ”€â”€ settlementId: String             â† Gateway's settlement reference
â”œâ”€â”€ periodStart: DateTime
â”œâ”€â”€ periodEnd: DateTime
â”œâ”€â”€ settlementDate: DateTime
â”œâ”€â”€ totalAmount: Float
â”œâ”€â”€ totalFees: Float @default(0)
â”œâ”€â”€ netAmount: Float
â”œâ”€â”€ transactionCount: Int
â”œâ”€â”€ currency: String @default("EGP")
â”œâ”€â”€ status: String                   â† PENDING | SETTLED | RECONCILED
â”œâ”€â”€ bankStatementId: String? (FK â†’ BankStatement)  â† Linked when net settlement hits bank
â”œâ”€â”€ createdAt, archivedAt
```

### 3.6 SuspenseTransaction (NEW)

**Purpose:** Track unidentified payments that need investigation.

```
SuspenseTransaction
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ source: String                   â† BANK_STATEMENT | PAYMENT_GATEWAY | MANUAL
â”œâ”€â”€ sourceId: String                 â† FK to source record
â”œâ”€â”€ amount: Float
â”œâ”€â”€ currency: String @default("EGP")
â”œâ”€â”€ description: String
â”œâ”€â”€ status: String                   â† PENDING | INVESTIGATING | ALLOCATED | REVERSED
â”œâ”€â”€ allocatedTo: String?             â† CustomerId or InvoiceId
â”œâ”€â”€ allocatedAt: DateTime?
â”œâ”€â”€ allocatedBy: String? (FK â†’ User)
â”œâ”€â”€ journalEntryId: String? (FK â†’ JournalEntry)  â† Suspense GL entry
â”œâ”€â”€ createdAt, archivedAt
```

### 3.7 CashForecast (NEW)

**Purpose:** Store daily cash flow forecasts.

```
CashForecast
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ forecastDate: DateTime           â† Date of forecast generation
â”œâ”€â”€ projectionDate: DateTime         â† Which date is being projected
â”œâ”€â”€ expectedInflows: Float @default(0)
â”œâ”€â”€ expectedOutflows: Float @default(0)
â”œâ”€â”€ netFlow: Float @default(0)
â”œâ”€â”€ openingBalance: Float
â”œâ”€â”€ closingBalance: Float
â”œâ”€â”€ confidence: Float?               â† 0.0-1.0
â”œâ”€â”€ source: String                   â† AI_MODEL | MANUAL | SYSTEM
â”œâ”€â”€ createdAt

Index:
  @@index([projectionDate])
```

### 3.8 ExchangeRate (NEW)

**Purpose:** Official exchange rates for multi-currency support.

```
ExchangeRate
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ fromCurrency: String
â”œâ”€â”€ toCurrency: String
â”œâ”€â”€ rate: Float
â”œâ”€â”€ date: DateTime
â”œâ”€â”€ source: String                   â† CENTRAL_BANK | MANUAL | MARKET
â”œâ”€â”€ approvedBy: String? (FK â†’ User)
â”œâ”€â”€ approvedAt: DateTime?
â”œâ”€â”€ createdAt

Unique: [fromCurrency, toCurrency, date]
```

### 3.9 ReturnedPayment (NEW)

**Purpose:** Track returned payments, chargebacks, and reversals.

```
ReturnedPayment
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ paymentId: String (FK â†’ Payment)
â”œâ”€â”€ bankTransactionId: String? (FK â†’ BankTransaction)
â”œâ”€â”€ type: String                     â† RETURNED | CHARGEBACK | REVERSAL | STOPPED
â”œâ”€â”€ reason: String
â”œâ”€â”€ amount: Float
â”œâ”€â”€ fees: Float @default(0)
â”œâ”€â”€ status: String                   â† PENDING | PROCESSED | DISPUTED | RESOLVED
â”œâ”€â”€ resolvedAt: DateTime?
â”œâ”€â”€ resolvedBy: String? (FK â†’ User)
â”œâ”€â”€ journalEntryId: String? (FK â†’ JournalEntry)
â”œâ”€â”€ createdAt, archivedAt
```

### 3.10 New Models Summary

| # | Model | Lines | Purpose |
|---|-------|-------|---------|
| 1 | BankAccount | ~22 | Multi-bank account management |
| 2 | BankStatement | ~28 | Statement lifecycle |
| 3 | BankTransaction | ~30 | Statement line items |
| 4 | ReconciliationException | ~20 | Unmatched items tracking |
| 5 | PaymentGatewaySettlement | ~18 | Gateway settlement reconciliation |
| 6 | SuspenseTransaction | ~16 | Unidentified payments |
| 7 | CashForecast | ~14 | Daily cash forecasting |
| 8 | ExchangeRate | ~12 | FX rate management |
| 9 | ReturnedPayment | ~16 | Returned/chargeback payments |
| **Total** | **9 new models** | **~176 lines** | |

---

## PART 4: BANK STATEMENT IMPORT FRAMEWORK

### 4.1 Supported Formats

| Format | Type | Parser Complexity | Coverage |
|--------|------|-------------------|----------|
| **CSV** | File | Low â€” column mapping | Most banks |
| **Excel (XLSX)** | File | Low â€” sheet/column mapping | Common |
| **CAMT.053** | XML (ISO 20022) | Medium â€” standard XML structure | EU/international banks |
| **MT940** | SWIFT | Medium â€” structured text | Global banks |
| **REST API** | JSON | Medium â€” bank-specific format | Banks with APIs |
| **Manual entry** | Form | Low â€” user input | Any bank |

### 4.2 Import Pipeline

```
ImportEngine.import(bankAccountId, file, format):
  1. VALIDATE file:
     - File must not be empty
     - File must be supported format
     - Check for duplicate statement (same account + period)
  
  2. PARSE into standardized format:
     parser = getParser(format)
     rawTransactions = parser.parse(file)
     
     // Normalize:
     normalized = rawTransactions.map(t => ({
       transactionDate: normalizeDate(t.date),
       valueDate: normalizeDate(t.valueDate),
       reference: normalizeRef(t.reference || extractRef(t.description)),
       description: cleanDescription(t.description),
       amount: parseAmount(t.amount),
       type: amount >= 0 ? "CREDIT" : "DEBIT",
       currency: t.currency || bankAccount.currency,
     }))
  
  3. COMPUTE statement summary:
     openingBalance = parser.getOpeningBalance(file)
     closingBalance = parser.getClosingBalance(file)
     totalCredits = sum(normalized.filter(t => t.type == "CREDIT"), amount)
     totalDebits = abs(sum(normalized.filter(t => t.type == "DEBIT"), amount))
  
  4. VALIDATE statement:
     expectedClosing = openingBalance + totalCredits - totalDebits
     IF abs(expectedClosing - closingBalance) > 0.01:
       FLAG: "Statement does not balance"
  
  5. CREATE BankStatement + BankTransactions:
     statement = BankStatement.create({
       bankAccountId, periodStart, periodEnd, ...summary,
       importSource, importFormat, originalFilename,
       status: "PARSED"
     })
     transactions = BankTransaction.createMany(
       normalized.map(t => ({ bankStatementId: statement.id, ...t }))
     )
  
  6. TRIGGER reconciliation (auto):
     ReconciliationEngine.start(statement.id)
  
  7. RETURN { statement, transactionCount: transactions.length }
```

### 4.3 Reference Extraction

```javascript
function extractRef(description) {
  // Common patterns across banks:
  patterns = [
    /INV-\d+/i,             // INV-2026-00123
    /INV\d+/i,              // INV202600123
    /CUS-\d+/i,             // Customer reference
    /Pmt[- ]?\d+/i,         // Payment ID
    /[A-Z]{3}\d{6,}/i,      // Generic reference code
    /\b\d{6,12}\b/,         // Any 6-12 digit number
  ]
  for (pattern of patterns) {
    match = description.match(pattern)
    if (match) return match[0]
  }
  return null
}
```

---

## PART 5: RECONCILIATION ENGINE

### 5.1 Matching Rules

| Rule | Priority | Match Criteria | Confidence | Example |
|------|----------|---------------|------------|---------|
| **EXACT_REFERENCE** | 1 | Reference matches + amount within 0.01 | 1.0 | INV-2026-00123 = EGP 1,250.00 |
| **EXACT_AMOUNT_DATE** | 2 | Amount matches + date within 1 day | 0.95 | EGP 1,250.00 on 2026-07-15 |
| **FUZZY_REFERENCE** | 3 | Reference fuzzy match + amount within 0.01 | 0.90 | INV202600123 vs INV-2026-00123 |
| **CUSTOMER_NAME** | 4 | Customer name in description + amount match | 0.85 | "EgyptAir" in desc + EGP 5K |
| **AMOUNT_ONLY** | 5 | Amount matches + no other candidates | 0.70 | Only one EGP 1,250.00 payment |
| **SPLIT_MATCH** | 6 | Amount = sum of 2+ payments | 0.60 | Bank line EGP 5K = 2 Ã— EGP 2.5K |
| **AI_SUGGESTED** | 7 | ML model recommends match | 0.50-0.95 | Based on historical patterns |

### 5.2 Reconciliation Workflow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ RECONCILIATION WORKBENCH                                                      â”‚
â”‚                                                                              â”‚
â”‚ Statement: NBE Current Account  Â·  Period: 2026-07-01 â†’ 2026-07-31          â”‚
â”‚ Opening: EGP 1,250,000  Â·  Closing: EGP 1,380,000  Â·  Match Rate: 92%     â”‚
â”‚                                                                              â”‚
â”‚ â”Œâ”€â”€â”€ MATCHED (45/50) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ Date       â”‚ Ref          â”‚ Description      â”‚ Amount  â”‚ Match â”‚ Conf  â”‚  â”‚
â”‚ â”‚ 2026-07-15 â”‚ INV-2026-123 â”‚ EgyptAir payment  â”‚ +45,200 â”‚ EXACT â”‚ 1.0   â”‚  â”‚
â”‚ â”‚ 2026-07-18 â”‚ INV-2026-131 â”‚ Nile Corp payment â”‚ +12,000 â”‚ REF   â”‚ 0.95  â”‚  â”‚
â”‚ â”‚ ...        â”‚              â”‚                   â”‚         â”‚       â”‚       â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                              â”‚
â”‚ â”Œâ”€â”€â”€ UNMATCHED (5/50) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ Date       â”‚ Description               â”‚ Amount  â”‚ Suggested â”‚ Action   â”‚  â”‚
â”‚ â”‚ 2026-07-20 â”‚ Bank fee - July           â”‚ -250    â”‚ Bank Fee  â”‚ [Accept] â”‚  â”‚
â”‚ â”‚ 2026-07-22 â”‚ Interest credit           â”‚ +180    â”‚ Interest  â”‚ [Accept] â”‚  â”‚
â”‚ â”‚ 2026-07-25 â”‚ EFT deposit - UNKNOWN     â”‚ +8,500  â”‚ Unident.  â”‚ [Invest.]â”‚  â”‚
â”‚ â”‚ 2026-07-28 â”‚ Wire transfer - UNKNOWN   â”‚ +15,000 â”‚ Suspense  â”‚ [Susp.]  â”‚  â”‚
â”‚ â”‚ 2026-07-30 â”‚ Amount diff - INV-2026-145â”‚ +5,000  â”‚ Partial   â”‚ [Split]  â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                              â”‚
â”‚ [ RECONCILE ] [ VERIFY ] [ POST TO GL ] [ EXPORT REPORT ]                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 5.3 GL Posting After Reconciliation

```
When BankStatement status â†’ POSTED:

  1. VERIFY bank GL account balance matches statement closingBalance:
     glBalance = GeneralLedgerEntry.findUnique({
       accountId: bankAccount.glAccountId,
       periodId: currentPeriod.id,
     })
     IF abs(glBalance.closingBalance - statement.closingBalance) > 0.01:
       FLAG: "GL balance mismatch â€” manual review required"
  
  2. CREATE summary journal entry (via W01 PostingEngine):
     // Only for unmatched/adjustment items
     FOR each unmatched transaction:
       IF transaction.type == bank_fee:
         PostingEngine.post({
           eventType: "BANK_FEE",
           amount: abs(transaction.amount),
           debitAccount: BANK_CHARGES_ACCOUNT,
           creditAccount: bankAccount.glAccountId,
         })
       IF transaction.type == interest:
         PostingEngine.post({
           eventType: "BANK_INTEREST",
           amount: transaction.amount,
           debitAccount: bankAccount.glAccountId,
           creditAccount: INTEREST_INCOME_ACCOUNT,
         })
       IF transaction.type == unknown_credit:
         PostingEngine.post({
           eventType: "SUSPENSE",
           amount: transaction.amount,
           debitAccount: bankAccount.glAccountId,
           creditAccount: SUSPENSE_ACCOUNT,
         })
  
  3. UPDATE BankAccount:
     lastReconciledAt = now()
     lastReconciledBalance = statement.closingBalance
     currentBalance = statement.closingBalance
```

---

## PART 6: PAYMENT GATEWAY RECONCILIATION

### 6.1 Gateway vs Bank Statement Matching

```
PaymentGateway (Paymob, Fawry, Stripe, etc.)
    â”‚
    â”œâ”€â”€â†’ Gateway Settlement Statement (daily/weekly)
    â”‚     Total: EGP 125,000
    â”‚     Fees:  EGP 1,875 (1.5%)
    â”‚     Net:   EGP 123,125
    â”‚
    â””â”€â”€â†’ Bank Statement (net settlement arrives 2-3 days later)
          Deposit: EGP 123,125 on 2026-07-18
          
GatewaySettlement.status â†’ RECONCILED when:
  1. BankStatement has matching deposit within Â±5 days
  2. Amount matches net settlement amount (within tolerance)
  3. Gateway transaction count = processed payment count in period
```

### 6.2 Gateway Fee Accounting

```
FOR each PaymentGatewaySettlement:
  fee = totalFees
  netSettlement = netAmount
  
  Journal Entry (via W01 PostingEngine):
    DR: Bank Account (1002-01)         netSettlement
    DR: Bank Charges (5105-01)         fee
    CR: Payment Gateway Clearing       totalAmount
  
  // Individual payment allocations already handled by W01:
  // Payment â†’ DR: Cash, CR: AR (per payment)
```

---

## PART 7: EXCEPTION & INVESTIGATION WORKFLOW

### 7.1 Exception Types and Handling

| Exception Type | Description | Default Action | Escalation |
|----------------|-------------|----------------|------------|
| **UNMATCHED_DEBIT** | Bank debit with no matching payment | Flag â†’ investigate | 48h â†’ supervisor |
| **UNMATCHED_CREDIT** | Bank credit with no matching payment | Flag â†’ suspense account | 24h â†’ supervisor |
| **PARTIAL_MATCH** | Amount differs by < 1% | Flag â†’ review | 72h â†’ manager |
| **DUPLICATE** | Payment matched to 2+ bank lines | Flag â†’ verify | 24h â†’ supervisor |
| **AMOUNT_MISMATCH** | Amount differs by > 1% | Flag â†’ investigate | 12h â†’ manager |
| **UNIDENTIFIED** | No reference, no amount match | Flag â†’ suspense | 48h â†’ supervisor |
| **BANK_FEE** | Identified bank charge | Auto-post to fees | None |
| **INTEREST** | Identified interest | Auto-post to income | None |

### 7.2 Investigation Workflow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  OPEN     â”‚  Exception created by reconciliation engine
â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜
     â”‚
     â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ INVESTIGATING â”‚  Assigned to reconciliation analyst
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚
  â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
  â”‚                                 â”‚
  â–¼                                 â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ RESOLVED  â”‚                  â”‚ DISMISSEDâ”‚  (false positive)
â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜                  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
     â”‚
     â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  POSTED   â”‚  GL entry created if needed
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## PART 8: AI CASH INTELLIGENCE AGENT

### 8.1 Agent Design

**Agent Name:** Cash Intelligence Agent  
**Framework:** C12-W07 Operational Intelligence  
**Autonomy Level:** âš¡ Semi-autonomous  

| Capability | Autonomy | Human Approval |
|------------|----------|----------------|
| Payment anomaly detection | âœ… Full | None (read-only alert) |
| Reconciliation suggestions | âš¡ Semi | Required for auto-match |
| Duplicate payment detection | âœ… Full | None (read-only alert) |
| Bank fee identification | âœ… Full | Auto-classify |
| Cash flow prediction | âœ… Full | None (forecast only) |
| Liquidity forecasting | âœ… Full | None (forecast only) |

### 8.2 Anomaly Detection

```
ALGORITHM: detectPaymentAnomalies():
  1. UNUSUALLY LARGE PAYMENTS:
     payments = Payment.findWhere(amount > 3Ã— avg for customer)
     â†’ FLAG: "Unusually large payment from {customer}"
  
  2. PAYMENT FREQUENCY ANOMALY:
     payments = Payment.findWhere(customer has 2+ payments in same day)
     â†’ FLAG: "Multiple payments from {customer} on same day â€” possible duplicate"
  
  3. GATEWAY vs BANK DELAY:
     settlements = PaymentGatewaySettlement.findWhere(
       status = "SETTLED" AND
       no matching BankTransaction within 5 days
     )
     â†’ FLAG: "Gateway settlement not yet reflected in bank statement"
  
  4. BANK FEE VARIANCE:
     fees = BankTransaction.findWhere(category = "FEE")
     IF month's total fees > 1.5Ã— average:
       â†’ FLAG: "Bank fees higher than normal â€” review fee schedule"
  
  5. UNEXPECTED BALANCE DROP:
     IF bankAccount.currentBalance < 0.2 Ã— avgBalance:
       â†’ FLAG: "Account balance below 20% of average â€” liquidity risk"
```

### 8.3 Cash Flow Prediction

```
ALGORITHM: forecastCashFlow(days = 30):
  forecast = []
  
  FOR day IN next 30 days:
    scheduledInflows = 0
    scheduledOutflows = 0
    
    // Expected payments from customers (weighted by payment probability)
    dueInvoices = Invoice.findWhere(dueDate = day)
    FOR each invoice:
      probability = CustomerRiskProfile.getProbability(invoice.customerId)
      scheduledInflows += invoice.amount Ã— probability
    
    // Expected collections (from W04 PTPs)
    ptps = PromiseToPay.findWhere(promisedDate = day, status = "PENDING")
    scheduledInflows += SUM(ptps, promisedAmount) Ã— 0.85  // 85% PTP kept rate
    
    // Expected fees and outflows
    scheduledOutflows += estimatedOperatingCosts(day)
    
    netFlow = scheduledInflows - scheduledOutflows
    closingBalance = previousDay.closingBalance + netFlow
    
    forecast.push({ date: day, inflows, outflows, netFlow, closingBalance, confidence })
  
  RETURN { forecast, minBalance, maxBalance, lowPoint, lowPointDate }
```

---

## PART 9: DASHBOARDS & REPORTING

### 9.1 Cash Position Dashboard (`/admin/cash/position`)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ CASH POSITION DASHBOARD                                                                 â”‚
â”‚                                                                                         â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ Total Cash   â”‚ â”‚ Total Inflow â”‚ â”‚ Total Outf.  â”‚ â”‚ Net Cash     â”‚ â”‚ Accounts     â”‚  â”‚
â”‚ â”‚ EGP 3.2M     â”‚ â”‚ Today        â”‚ â”‚ Today        â”‚ â”‚ Flow Trend   â”‚ â”‚ Reconciled   â”‚  â”‚
â”‚ â”‚              â”‚ â”‚ EGP 125K     â”‚ â”‚ EGP 85K      â”‚ â”‚ ðŸ“ˆ +40K      â”‚ â”‚ 8/12         â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                                         â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚ â”‚ BANK ACCOUNTS                                                                      â”‚   â”‚
â”‚ â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚   â”‚
â”‚ â”‚ â”‚ Account  â”‚ Currency â”‚ Balance  â”‚ Avail    â”‚ Last Rec â”‚ Status   â”‚ Recon    â”‚   â”‚   â”‚
â”‚ â”‚ â”‚ NBE Curr â”‚ EGP      â”‚ 1,850,000â”‚1,850,000 â”‚ Jul 28   â”‚ ACTIVE   â”‚ âœ…       â”‚   â”‚   â”‚
â”‚ â”‚ â”‚ NBE USD  â”‚ USD      â”‚    45,000â”‚   45,000 â”‚ Jul 25   â”‚ ACTIVE   â”‚ âš  Pendingâ”‚   â”‚   â”‚
â”‚ â”‚ â”‚ CIB Curr â”‚ EGP      â”‚   950,000â”‚   945,000â”‚ Jul 28   â”‚ ACTIVE   â”‚ âœ…       â”‚   â”‚   â”‚
â”‚ â”‚ â”‚ Paymob   â”‚ EGP      â”‚   385,000â”‚   385,000â”‚ Jul 28   â”‚ SETTLE   â”‚ âœ…       â”‚   â”‚   â”‚
â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                                         â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ 7-DAY CASH FORECAST              â”‚ â”‚ RECONCILIATION STATUS                         â”‚  â”‚
â”‚ â”‚                                  â”‚ â”‚                                                â”‚  â”‚
â”‚ â”‚ Tomorrow:    +EGP 45K â†’ 3.25M   â”‚ â”‚ âœ… NBE Current â€” Jul 2026 (45/50 matched)   â”‚  â”‚
â”‚ â”‚ Day 2:       -EGP 20K â†’ 3.23M   â”‚ â”‚ âš  NBE USD â€” Jul 2026 (42/48 matched)       â”‚  â”‚
â”‚ â”‚ Day 3:       +EGP 120K â†’ 3.35M  â”‚ â”‚ âœ… CIB Current â€” Jul 2026 (38/38 matched)    â”‚  â”‚
â”‚ â”‚ Day 4:       -EGP 15K â†’ 3.34M   â”‚ â”‚ âœ… Paymob â€” Jul 2026 (Completed)             â”‚  â”‚
â”‚ â”‚ Day 5:       +EGP 60K â†’ 3.40M   â”‚ â”‚ âš  Fawry â€” Jul 2026 (Pending)                â”‚  â”‚
â”‚ â”‚ Day 6:       -EGP 100K â†’ 3.30M  â”‚ â”‚                                                â”‚  â”‚
â”‚ â”‚ Day 7:       +EGP 80K â†’ 3.38M   â”‚ â”‚                                                â”‚  â”‚
â”‚ â”‚ Low point: Day 2 at EGP 3.23M   â”‚ â”‚ Next scheduled: 2026-08-01 (period close)    â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 9.2 Reconciliation Workbench (`/admin/cash/reconciliation/:statementId`)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ RECONCILIATION WORKBENCH â€” NBE Current Account â€” Jul 2026                              â”‚
â”‚                                                                                       â”‚
â”‚ MATCH RATE: 90% â”‚ Unmatched: 5 â”‚ Partial: 2 â”‚ As of: 2026-07-29 14:30                â”‚
â”‚                                                                                       â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€ TAB: UNMATCHED (5) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ â˜ â”‚ Date       â”‚ Desc                  â”‚ Amount  â”‚ Type    â”‚ Suggested          â”‚  â”‚
â”‚ â”‚ â˜ â”‚ Jul 20     â”‚ Bank Fee - July       â”‚ -250    â”‚ DEBIT   â”‚ ðŸ… Bank Fee â†’ [Ok]â”‚  â”‚
â”‚ â”‚ â˜ â”‚ Jul 22     â”‚ Interest Credit       â”‚ +180    â”‚ CREDIT  â”‚ ðŸ… Interest â†’ [Ok] â”‚  â”‚
â”‚ â”‚ â˜ â”‚ Jul 25     â”‚ EFT - UNKNOWN REF     â”‚ +8,500  â”‚ CREDIT  â”‚ ðŸ… Search...       â”‚  â”‚
â”‚ â”‚ â˜ â”‚ Jul 28     â”‚ INV-2026-145 PARTIAL  â”‚ +5,000  â”‚ CREDIT  â”‚ ðŸ… Split match     â”‚  â”‚
â”‚ â”‚ â˜ â”‚ Jul 29     â”‚ Wire - UNKNOWN        â”‚ +15,000 â”‚ CREDIT  â”‚ ðŸ… Suspense        â”‚  â”‚
â”‚ â”‚                                                                                   â”‚  â”‚
â”‚ â”‚ [ Match Selected ]  [ Send to Suspense ]  [ Investigate ]  [ Dismiss ]            â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                                       â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€ MATCHED (45/50) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚ â”‚ Showing last 5 of 45 matched items                                             â”‚   â”‚
â”‚ â”‚ INV-2026-123 â”‚ EGP 45,200 â”‚ Jul 15 â”‚ EXACT Ref: INV-2026-123 â”‚ Confidence 1.0 â”‚   â”‚
â”‚ â”‚ INV-2026-131 â”‚ EGP 12,000 â”‚ Jul 18 â”‚ EXACT Ref: INV-2026-131 â”‚ Confidence 1.0 â”‚   â”‚
â”‚ â”‚ PTP-2026-78  â”‚ EGP 3,200  â”‚ Jul 20 â”‚ AMOUNT+DATE            â”‚ Confidence 0.95â”‚   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 9.3 Treasury Dashboard (`/admin/cash/treasury`)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ TREASURY DASHBOARD                                                                      â”‚
â”‚                                                                                       â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚ â”‚ CASH POSITION TREND (30 days) â”‚ â”‚ LIQUIDITY RATIOS                                â”‚â”‚
â”‚ â”‚                              â”‚ â”‚                                                  â”‚â”‚
â”‚ â”‚  3.5M  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ  â”‚ â”‚ Current Ratio:       2.1 (Target: > 1.5)       â”‚â”‚
â”‚ â”‚  3.0M  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ    â”‚ â”‚ Quick Ratio:          1.8 (Target: > 1.0)       â”‚â”‚
â”‚ â”‚  2.5M  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ     â”‚ â”‚ Cash Ratio:           0.8 (Target: > 0.3)       â”‚â”‚
â”‚ â”‚  2.0M  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ      â”‚ â”‚ Days Cash on Hand:    45 days                    â”‚â”‚
â”‚ â”‚  1.5M  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ         â”‚ â”‚                                                  â”‚â”‚
â”‚ â”‚                              â”‚ â”‚ FX Exposure:          USD 45,000 @ 30.5         â”‚â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â”‚                                                                                       â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ FORECAST ACCURACY (Last 30 days)                                                   â”‚  â”‚
â”‚ â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚  â”‚
â”‚ â”‚ â”‚ Metric   â”‚ Week 1   â”‚ Week 2   â”‚ Week 3   â”‚ Week 4   â”‚ Avg      â”‚ Trend    â”‚   â”‚  â”‚
â”‚ â”‚ â”‚ Accuracy â”‚ 92%      â”‚ 88%      â”‚ 94%      â”‚ 90%      â”‚ 91%      â”‚ ðŸ“ˆ       â”‚   â”‚  â”‚
â”‚ â”‚ â”‚ Inflow   â”‚ 95%      â”‚ 90%      â”‚ 96%      â”‚ 91%      â”‚ 93%      â”‚ âœ…       â”‚   â”‚  â”‚
â”‚ â”‚ â”‚ Outflow  â”‚ 88%      â”‚ 85%      â”‚ 91%      â”‚ 88%      â”‚ 88%      â”‚ ðŸ“ˆ       â”‚   â”‚  â”‚
â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## PART 10: INTEGRATION STRATEGY

### 10.1 Integration Points

| Source | Trigger | W05 Action | Timing |
|--------|---------|------------|--------|
| **W01 PostingEngine** | Payment journal posted | Match against bank statement | Continuous |
| **W01 GL** | Bank GL account query | Verify statement closing = GL closing | Per statement |
| **W01 FinancialPeriod** | Period close | All statements must be RECONCILED before close | Monthly gate |
| **W02 Revenue Assurance** | Payment discrepancy | Flag for reconciliation investigation | On detection |
| **W03 Tariff** | Not directly | N/A | â€” |
| **W04 Collections** | Payment received | Update customer payment profile | Continuous |
| **C12-W07** | AI recommendations | Reconciliation suggestions + anomaly alerts | Continuous |
| **Notifications** | Exception created | Notify reconciliation team | On creation |
| **Audit** | All reconciliation actions | Log to AuditEntry | Always |

### 10.2 Period Close Gate

```
BEFORE FinancialPeriod.close():
  1. CHECK all BankStatements for period:
     FOR each active BankAccount:
       latest = BankStatement.findFirst({
         bankAccountId, periodEnd: { gte: periodEnd },
         status: { not: "POSTED" }
       })
       IF latest:
         BLOCK close: "Bank account {accountName} has unreconciled statements"
  
  2. CHECK all PaymentGatewaySettlements for period:
     FOR each active PaymentGateway:
       pending = PaymentGatewaySettlement.findFirst({
         gatewayId, periodEnd: { gte: periodEnd },
         status: { not: "RECONCILED" }
       })
       IF pending:
         WARN: "Gateway {gatewayName} has unreconciled settlements"
  
  3. ALLOW close with warnings only (not blocking for gateways)
```

---

## PART 11: TESTING STRATEGY â€” W05 (105 Tests)

### 11.1 Statement Import Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Import CSV with 50 transactions â†’ 50 BankTransactions | Correct count |
| 2 | Import CAMT.053 XML â†’ parsed correctly | Standard format |
| 3 | Import MT940 â†’ parsed correctly | SWIFT format |
| 4 | Import duplicate statement â†’ rejected | Duplicate check |
| 5 | Statement with unbalanced entries â†’ warning | Validation |
| 6 | Empty file â†’ rejected | Validation |
| 7 | Unknown format â†’ rejected | Validation |
| 8 | Reference extraction from description â†’ found | Extract |

### 11.2 Auto-Reconciliation Tests (25)

| # | Test | Expect |
|---|------|--------|
| 1 | Exact reference match â†’ MATCHED confidence 1.0 | Rule 1 |
| 2 | Amount + date match â†’ MATCHED confidence 0.95 | Rule 2 |
| 3 | Fuzzy reference match â†’ MATCHED confidence 0.90 | Rule 3 |
| 4 | Customer name match â†’ MATCHED confidence 0.85 | Rule 4 |
| 5 | Amount-only match (single candidate) â†’ MATCHED 0.70 | Rule 5 |
| 6 | Split match (1 bank = 2 payments) â†’ PARTIAL | Rule 6 |
| 7 | No match â†’ UNMATCHED | Not found |
| 8 | Multiple candidates â†’ UNMATCHED (ambiguous) | Ambiguous |
| 9 | Amount differs by 0.01 â†’ still matched within tolerance | Tolerance |
| 10 | Amount differs by 1.00 â†’ PARTIAL with diff | Beyond tolerance |

### 11.3 Gateway Reconciliation Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Gateway settlement â†’ Bank deposit matches net | Reconciled |
| 2 | Settlement with fees â†’ fee journal created | Fee accounted |
| 3 | Settlement without bank match â†’ PENDING | Awaiting |
| 4 | Multiple gateways â†’ independent reconciliation | Per gateway |

### 11.4 Exception Handling Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Unmatched credit â†’ exception created | OPEN |
| 2 | Unmatched debit â†’ exception created | OPEN |
| 3 | Partial match â†’ exception with amount diff | PARTIAL |
| 4 | Duplicate detection â†’ 2 exception records | DUPLICATE |
| 5 | Investigate â†’ status INVESTIGATING | Correct state |
| 6 | Manual match â†’ resolved | RESOLVED |
| 7 | Dismiss false positive â†’ DISMISSED | Correct state |
| 8 | Auto-fee â†’ posted without investigation | Auto-resolve |

### 11.5 Bank Fee & Interest Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Bank fee detected â†’ auto-classified | Category = FEE |
| 2 | Bank fee journal â†’ DR: Bank Charges CR: Bank | GL correct |
| 3 | Interest detected â†’ auto-classified | Category = INTEREST |
| 4 | Interest journal â†’ DR: Bank CR: Interest Income | GL correct |

### 11.6 Multi-Currency Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | USD transaction â†’ uses exchange rate | FX applied |
| 2 | USD â†’ EGP conversion â†’ correct baseAmount | Calculation |
| 3 | Exchange rate update â†’ new rate on correct date | Date-based |
| 4 | FX gain â†’ journal entry created | Gain posted |
| 5 | FX loss â†’ journal entry created | Loss posted |

### 11.7 Cash Forecasting Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | 30-day forecast generated | Complete |
| 2 | Weighted by payment probability | Correct |
| 3 | PTP promises included | 85% factor |
| 4 | Low point identified correctly | Min balance |
| 5 | Forecast accuracy tracked | Comparison |

### 11.8 Suspense & Returned Payment Tests (5)

| # | Test | Expect |
|---|------|--------|
| 1 | Unidentified payment â†’ suspense account | Suspense created |
| 2 | Suspense resolved â†’ allocated to customer | Allocated |
| 3 | Chargeback â†’ ReturnedPayment + reversal | Correct flow |

### 11.9 GL Integration Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Reconciliation â†’ statement closing = GL balance | Match |
| 2 | Reconciliation â†’ statement closing â‰  GL â†’ warning | Mismatch |
| 3 | Bank fee journal â†’ GL updated | Correct account |
| 4 | Interest journal â†’ GL updated | Correct account |
| 5 | Period close blocked if unreconciled | Gate enforced |

---

## PART 12: W05 DEFINITION OF DONE

```
W05 â€” BANK RECONCILIATION & CASH MANAGEMENT
CERTIFICATION CHECKLIST

â–¡ CORE DATA MODELS â€” 9 NEW
   â–¡ BankAccount (multi-bank hierarchy)
   â–¡ BankStatement (statement lifecycle)
   â–¡ BankTransaction (statement line items)
   â–¡ ReconciliationException (unmatched items)
   â–¡ PaymentGatewaySettlement (gateway reconciliation)
   â–¡ SuspenseTransaction (unidentified payments)
   â–¡ CashForecast (daily forecasting)
   â–¡ ExchangeRate (FX management)
   â–¡ ReturnedPayment (chargebacks/reversals)

â–¡ STATEMENT IMPORT â€” 5 FORMATS
   â–¡ CSV parser
   â–¡ Excel (XLSX) parser
   â–¡ CAMT.053 (ISO 20022) parser
   â–¡ MT940 (SWIFT) parser
   â–¡ Manual entry form

â–¡ RECONCILIATION ENGINE
   â–¡ Rule-based matching (7 rules, priority-ordered)
   â–¡ AI-assisted matching
   â–¡ Manual matching workbench
   â–¡ Split payment handling
   â–¡ Partial match tracking

â–¡ GATEWAY RECONCILIATION
   â–¡ PaymentGatewaySettlement model
   â–¡ Gateway vs bank match
   â–¡ Fee auto-accounting
   â–¡ Settlement period management

â–¡ EXCEPTION MANAGEMENT
   â–¡ 8 exception types
   â–¡ Full investigation lifecycle
   â–¡ Auto-resolution for fees/interest
   â–¡ Manual matching workbench

â–¡ GL INTEGRATION
   â–¡ Statement closing = GL balance verification
   â–¡ Bank fee journal posting (DR: Bank Charges, CR: Bank)
   â–¡ Interest journal posting (DR: Bank, CR: Interest Income)
   â–¡ Suspense account posting
   â–¡ Period close gate (unreconciled = blocked)

â–¡ CASH MANAGEMENT
   â–¡ Cash position dashboard (real-time)
   â–¡ 30-day cash flow forecast
   â–¡ Multi-currency support
   â–¡ FX rate management
   â–¡ Liquidity ratio tracking

â–¡ AI CASH INTELLIGENCE AGENT
   â–¡ Payment anomaly detection (5 patterns)
   â–¡ Reconciliation suggestions
   â–¡ Cash flow prediction
   â–¡ C12 AIRecommendation integration

â–¡ DASHBOARDS
   â–¡ Cash Position Dashboard (/admin/cash/position)
   â–¡ Reconciliation Workbench (/admin/cash/reconciliation/:id)
   â–¡ Treasury Dashboard (/admin/cash/treasury)

â–¡ SECURITY
   â–¡ RBAC: Reconciliation Analyst, Treasury Manager, Finance Admin
   â–¡ Segregation: reconcile â‰  approve â‰  post
   â–¡ Statement immutability after POSTED
   â–¡ All mutations audited

â–¡ TESTS â€” 105 PASSING
   â–¡ Statement import: 20 tests
   â–¡ Auto-reconciliation: 25 tests
   â–¡ Gateway reconciliation: 10 tests
   â–¡ Exception handling: 15 tests
   â–¡ Bank fee & interest: 10 tests
   â–¡ Multi-currency: 10 tests
   â–¡ Cash forecasting: 10 tests
   â–¡ Suspense & returns: 5 tests
   â–¡ GL integration: 10 tests

W05 STATUS: â–¡ NOT IMPLEMENTED
All items above are DESIGN-COMPLETE but not executed.
```

---

## APPENDIX A: W05 FILE MANIFEST

| # | File | Action | Lines |
|---|------|--------|-------|
| 1 | `backend/prisma/schema.prisma` | MODIFY | +180 lines (9 new models) |
| 2 | Migration: bank_reconciliation | CREATE | Standard |
| 3 | `backend/src/services/statement-importer.js` | **CREATE** | ~200 lines (parsers) |
| 4 | `backend/src/services/reconciliation-engine.js` | **CREATE** | ~300 lines (matching) |
| 5 | `backend/src/services/gateway-reconciliation.js` | **CREATE** | ~120 lines |
| 6 | `backend/src/services/cash-forecast.js` | **CREATE** | ~150 lines |
| 7 | `backend/src/services/exchange-rate.js` | **CREATE** | ~80 lines |
| 8 | `backend/src/services/suspense-engine.js` | **CREATE** | ~80 lines |
| 9 | `backend/src/services/cash-ai.js` | **CREATE** | ~120 lines |
| 10 | `backend/src/routes/bank-reconciliation.js` | **CREATE** | ~300 lines |
| 11 | `backend/src/routes/cash-management.js` | **CREATE** | ~150 lines |
| 12 | `backend/src/services/posting-engine.js` | MODIFY | +10 lines (bank fee/interest types) |
| 13 | `backend/src/server.js` | MODIFY | +3 lines |
| 14 | `Frontend/src/app/admin/cash/position/page.tsx` | **CREATE** | ~250 lines |
| 15 | `Frontend/src/app/admin/cash/reconciliation/[id]/page.tsx` | **CREATE** | ~350 lines |
| 16 | `Frontend/src/app/admin/cash/treasury/page.tsx` | **CREATE** | ~250 lines |
| 17 | `Frontend/src/app/admin/cash/accounts/page.tsx` | **CREATE** | ~200 lines |

**Total estimated new code:** ~2,800 lines
**Total estimated tests:** 105 tests
**Cumulative C13 (W01-W05):** 85 + 95 + 100 + 105 + 105 = 490 tests

---

*This document is a planning artifact only. No code, no implementation, no database migration.*
*C13-W05 â€” Bank Reconciliation & Cash Management. READ ONLY. GOVERNANCE PLANNING ONLY.*

