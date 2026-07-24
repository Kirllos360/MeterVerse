# Enterprise Process Library — Planning

## Core Business Processes

| ID | Process Name | Actors | Trigger | Priority |
|:--:|:-------------|:------:|:-------:|:--------:|
| P001 | Customer Onboarding | Admin, Customer | New customer created | P0 |
| P002 | Meter Assignment | Admin, Technician | New meter registered | P0 |
| P003 | Reading Capture | Technician, SYMBIOT | Schedule/Webhook | P0 |
| P004 | Reading Validation | System, Reviewer | Reading recorded | P0 |
| P005 | Invoice Generation | System | Bill run triggered | P0 |
| P006 | Invoice Approval | Manager | High-risk invoice | P1 |
| P007 | Payment Recording | Cashier, Portal | Payment received | P0 |
| P008 | Payment Allocation | System | Payment recorded | P0 |
| P009 | Payment Reversal | Super Admin | Reversal requested | P1 |
| P010 | Collection Follow-up | Collector | Invoice overdue | P1 |
| P011 | Customer Statement | Customer, Admin | Requested/Scheduled | P1 |
| P012 | Tariff Update | Admin, Approver | Tariff change | P1 |
| P013 | Meter Replacement | Technician | Meter fault | P1 |
| P014 | Service Disconnection | Admin, Technician | Non-payment | P1 |
| P015 | Service Reconnection | Admin, Technician | Payment received | P1 |

## Supporting Processes

| ID | Process Name | Actors | Trigger |
|:--:|:-------------|:------:|:-------:|
| P101 | User Registration | Admin | New employee |
| P102 | Role Assignment | Admin | User created |
| P103 | Audit Review | Auditor | Schedule |
| P104 | Backup Execution | System | Schedule |
| P105 | Report Generation | Admin | Requested/Scheduled |
| P106 | Data Export | Admin | Requested |
| P107 | Data Import | Admin | Migration |
| P108 | Integration Sync | System | Schedule |
