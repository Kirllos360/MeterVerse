# 02 — Entity Dependency Matrix

**Version:** 1.0.0  
**Format:** For every entity: Can Exist Alone, Depends On, Used By, Creates, Consumes, Deletes, Archives, Synchronizes, Reports, KPIs, Permissions, Search

---

## Entity Matrix

| Entity | Alone | Depends On | Used By | Creates | Consumes | Delete Rule | Archive Rule | Sync | Reports | KPIs | Search |
|--------|-------|-----------|---------|---------|----------|-------------|--------------|------|---------|------|--------|
| Organization | ✅ | Nothing | Workspace | Workspace | — | NEVER | NEVER | No | Org report | — | Admin only |
| Workspace | ❌ | Organization | Projects, Nav | Project, Nav | Config | Archive only | Hide from non-admin | No | Workspace usage | — | Admin only |
| Project | ❌ | Workspace | Areas, Customers, Meters, Invoices | Area, Building, Floor, Unit | Customer data | Only if no active entities | Hide children from non-admin | Symbiot | Project summary | Project count | ✅ Name, code |
| Area | ❌ | Project | Buildings | Building | Location data | Only if no buildings | Hide | Symbiot | Area summary | Area count | ✅ Name |
| Building | ❌ | Area | Floors | Floor | — | Only if no units | Hide | No | — | — | ✅ Name |
| Floor | ❌ | Building | Units | Unit | — | Only if no units | Hide | No | — | — | — |
| Unit | ❌ | Floor | Customers, Meters | Customer assignment | Customer, meter | Only if no active meter | Hide from non-admin | No | Unit occupancy | Occupied/Vacant | ✅ Code, type |
| Customer | ❌ | Unit | Invoices, Payments, Meters, Wallet, Ledger, Alerts, Tickets | Invoice, Payment, Ledger, Wallet, Alert, Ticket | Utility service | Cascades ledger, wallet, alerts. Does NOT cascade invoices, payments, meters. | Hide from search, keep financial history | Symbiot | Customer statement, aging | Customer count, balance, collection rate | ✅ Name, code, phone, email, national ID |
| UtilityAccount | ❌ | Customer | Meters, Tariffs, Invoices | Meter assignment, Tariff application | Readings | Only if no active meters | Keep for history | No | — | Utility count | — |
| Meter | ❌ | UtilityAccount (or standalone available) | Readings, SIM, Maintenance, Alerts | Reading, Alert, Maintenance | SIM, Assignment | Only if no pending readings or unpaid invoices | Retired = read-only for history | Symbiot | Meter reading history, health | Meter count, health, offline count | ✅ Serial, type, status |
| SIMCard | ❌ | Meter (when assigned) | — | — | Meter assignment | Only if no active assignment | Retire after cooldown | No | SIM status | — | ✅ ICCID, MSISDN |
| Reading | ❌ | Meter | Consumption, Review, Invoice | Consumption, Invoice line | — | NEVER if billed. Mark corrected. | Keep permanently | Symbiot | Consumption report | Consumption, reading success rate | ✅ Meter serial, date |
| Consumption | ❌ | Reading | Invoice, Analytics | Invoice line | — | NEVER (computed) | Keep permanently | No | Consumption trends, forecasts | Avg consumption, peak | — |
| Tariff | ❌ | Project | Invoice | Invoice line | — | NEVER if used for billing. Supersede only. | Supersede = read-only | No | Tariff history | — | ✅ Name, type |
| Invoice | ❌ | Customer, UtilityAccount | Payment, Collection, Ledger, Alert | Payment allocation, Ledger entry, Alert | Line items | NEVER. Cancel or reverse only. | Paid = immutable. Unpaid = cancellable. | No | Invoice summary, aging | Revenue, outstanding, collection rate | ✅ Number, customer, period |
| Payment | ❌ | Invoice | Ledger, Receipt, Collection | Ledger entry, Receipt | Payment allocation | NEVER. Reverse only. | Keep permanently | No | Payment summary | Collection rate | ✅ Customer, date, amount |
| LedgerEntry | ❌ | Customer, Invoice, Payment | Statement | — | Financial events | NEVER (append-only) | Keep permanently | No | Customer statement | — | — |
| Wallet | ❌ | Customer | WalletTransaction | Transaction | — | NEVER. Freeze only. | Keep permanently | No | Wallet summary | Wallet balance | ✅ Customer |
| WalletTransaction | ❌ | Wallet | — | — | — | NEVER (append-only) | Keep permanently | No | Transaction history | — | ✅ Date, type |
| Settlement | ❌ | Customer, Invoice | Ledger | Ledger entry | — | NEVER. Reverse only. | Keep permanently | No | Settlement report | — | ✅ Customer |
| Alert | ❌ | Any entity | Dashboard, Notification | Notification | — | Archive after 90 days | Keep for audit | No | Alert summary | Open alerts | ✅ Type, severity, entity |
| Ticket | ❌ | Customer (optional) | — | TicketComment | — | NEVER. Close only. | Close = read-only | No | Ticket summary | Open tickets | ✅ Subject, customer, status |
| Document | ❌ | Any entity | — | — | — | Only if no active reference | Archive | No | — | — | ✅ Name, type |
| BillCycle | ❌ | Project | Invoice | Invoice | — | NEVER. Close only. | Keep for audit | No | Cycle summary | — | ✅ Period, status |
| AuditLog | ✅ | None | Security, Compliance | — | — | NEVER (immutable) | Keep permanently | No | Audit trail | — | ✅ Actor, action, resource |
| User | ❌ | Role | Notification, Action | Notification | Role assignment | Deactivate only. Never delete. | Deactivated = cannot login | No | User activity | Active users | ✅ Name, email, role |
| Notification | ❌ | User | — | — | — | Delete after user reads or 90 days | — | No | — | Unread count | — |
| ReportJob | ❌ | Any entity | — | Report output | Data | Delete after 30 days | Keep if scheduled | No | — | — | ✅ Name, type |
| SyncStatus | ❌ | Area | Dashboard, Alert | Alert | Meter, Customer, Reading data | — | Keep for audit | Symbiot | Sync dashboard | Sync health | — |
| ImportRecord | ❌ | Any entity | — | — | CSV/Excel data | Delete after 90 days | Keep for audit | No | Import history | — | ✅ Type, date |
