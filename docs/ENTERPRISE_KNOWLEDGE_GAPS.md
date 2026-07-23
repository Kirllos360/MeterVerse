# Enterprise Knowledge Gaps — Prompt for User

**Purpose:** Before we can plan the complete system, I need answers to these questions. Please respond to each section.

---

## Section A: Areas, Projects & Infrastructure

### A1 — Area Inventory
| Question | Answer |
|----------|--------|
| How many total areas exist? (Golf, October, Palm Central, The Crown — any others?) | |
| Does each area run on its own server/VM? | |
| Does each area have its own database, or one shared database? | |
| Does each area have its own domain/URL? | |
| What are the exact area names we should use in the system? | |

### A2 — Project Structure
| Question | Answer |
|----------|--------|
| How many projects per area? | |
| Are projects physical (neighborhoods) or logical (phases)? | |
| Do projects share tariffs or have their own? | |

### A3 — SYMBIOT Integration
| Question | Answer |
|----------|--------|
| How does MeterVerse authenticate with SYMBIOT? (API key, OAuth, user/pass?) | |
| One central SYMBIOT or one per area? | |
| How often should MeterVerse pull readings from SYMBIOT? | |
| Does SYMBIOT push data to us, or do we pull from SYMBIOT? | |
| What data does SYMBIOT provide per meter? (Reading value, timestamp, status, alerts?) | |
| Are there any other external data sources besides SYMBIOT? | |

---

## Section B: Financial Tracking (From Excel Files)

### B1 — Invoice Tracking
| Question | Answer |
|----------|--------|
| Are the monthly amounts in the Excel files actual meter readings OR calculated invoice amounts? | |
| Who calculates the invoice amount? (MeterVerse, or is it pre-calculated?) | |
| What determines if a customer is "Billing Status = Yes"? | |
| How is the "Opening Balance" calculated? | |

### B2 — Payment/Collection System
| Question | Answer |
|----------|--------|
| What payment methods need to be supported? (POS, Cash, Bank Transfer, Online — any others?) | |
| Do we need to integrate with a payment gateway? Which one? | |
| Should the system track bank deposits/transfers automatically? | |
| Is there a reconciliation process between collections and bank statements? | |

### B3 — Ledger System
| Question | Answer |
|----------|--------|
| Does "Customer Ledger" = what customer owes minus what they paid? | |
| Does "Accountant Ledger" = double-entry accounting (debit/credit)? | |
| Do we need to generate official accounting entries? | |
| Is there an existing accounting/ERP system we need to export to? | |

---

## Section C: System Features

### C1 — Communication
| Question | Answer |
|----------|--------|
| Email — send invoices, reminders? | |
| SMS — send payment reminders, alerts? | |
| Push notifications — mobile app? | |
| Chat — internal team communication or customer support? | |

### C2 — Alerts & Intelligence
| Question | Answer |
|----------|--------|
| What should the "smart alert system" detect? (Overdue payments, meter tampering, consumption spikes?) | |
| Should alerts be sent to customers, admins, or both? | |
| Should the system include AI-based consumption forecasting? | |

### C3 — User Roles & Permissions
| Question | Answer |
|----------|--------|
| Can a user be assigned to one area, multiple areas, or all areas? | |
| Should roles be customizable (create custom roles with specific permissions)? | |
| Should every action (view, add, edit, activate, deactivate, terminate, archive, delete) have its own permission key? | |

### C4 — Meter Management
| Question | Answer |
|----------|--------|
| What meter types exist? (Water, Electricity, Solar, BTU — any others?) | |
| Who manages meter types — from MeterVerse admin UI? | |
| Should the system track meter installation, maintenance, and retirement history? | |
| Should the system track SIM cards inside meters? (SIM card management) | |

### C5 — SIM Card Management
| Question | Answer |
|----------|--------|
| Do meters have SIM cards for cellular communication? | |
| Should the system track SIM card provider, plan, status, data usage? | |
| Should the system alert when a SIM card plan is expiring? | |

---

## Section D: User Interface & Language

| Question | Answer |
|----------|--------|
| Should the UI support Arabic? (Right-to-left layout, Arabic labels) | |
| Should the UI support English? | |
| Should users be able to switch between Arabic and English? | |
| Are there any other languages needed? | |

---

## Section E: Current Operations

| Question | Answer |
|----------|--------|
| How many total customers across all areas? | |
| How many total active meters? | |
| What is the current billing frequency? (Monthly, bi-monthly, quarterly?) | |
| Who currently enters the data from Excel into the system? | |
| What is the biggest pain point with the current Excel-based process? | |

---

## Section F: Mobile & Field Operations

| Question | Answer |
|----------|--------|
| Do field operators need a mobile app to read meters? | |
| Should the mobile app work offline and sync later? | |
| Should residents/customers have a portal to view their bills? | |
| Should residents be able to submit their own meter readings? | |

---

## After You Answer — The Complete Wave Plan

Once I have your answers, I will generate:

```
Wave 01: Enterprise Hardening — ✅ COMPLETE
Wave 02: User Experience & Communication — IN PROGRESS
Wave 03: Enterprise Billing & Tariff — PLANNING
Wave 04: Platform Hardening & Scale — PLANNING
Wave 05: AI & Intelligence — PLANNING
Wave 06: Mobile & Enterprise Release — PLANNING
Wave 07: Enterprise Financials (Ledger, Payment Center, Collections)
Wave 08: SYMBIOT Integration & Meter Infrastructure
Wave 09: Multi-Area Infrastructure & Arabic UI
Wave 10: Enterprise Intelligence (Alerts, Forecasting, Automation)
```

Each wave will have complete phases, tasks, steps, and prompts — enough to execute without any external planning tool.
