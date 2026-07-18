# MVEOS Entity & DTO Matrix (Comprehensive)

## 01. CORE IDENTITY & ORGANIZATIONAL HIERARCHY
| Entity | Key Attributes | DTO Name | CRUD Endpoints |
| :--- | :--- | :--- | :--- |
| **Organization** | name, tax_id, license_key, address, settings | `OrgDTO` | `GET /org`, `PUT /org` |
| **Project** | org_id, code, region, timezone, status | `ProjectDTO` | `GET /projects`, `POST /projects` |
| **Area/Zone** | project_id, name, type (Residential/Commercial) | `AreaDTO` | `GET /areas`, `PATCH /areas/:id` |
| **Building** | area_id, code, address, floors, total_units | `BuildingDTO` | `GET /buildings`, `POST /buildings` |
| **Floor/Unit** | building_id, unit_number, type, sq_ft | `UnitDTO` | `GET /units`, `PUT /units/:id` |

## 02. CUSTOMER & FINANCIAL ECOSYSTEM
| Entity | Key Attributes | DTO Name | CRUD Endpoints |
| :--- | :--- | :--- | :--- |
| **Customer** | name, civil_id, contact, category, kyc_status | `CustomerDTO` | `GET /customers`, `POST /customers` |
| **Contract** | customer_id, start_date, end_date, tariff_id | `ContractDTO` | `GET /contracts`, `POST /contracts` |
| **Account** | contract_id, balance, currency, status | `AccountDTO` | `GET /accounts`, `PATCH /accounts/:id` |
| **Invoice** | account_id, period, total_amount, due_date | `InvoiceDTO` | `GET /invoices`, `POST /invoices/batch` |
| **Payment** | account_id, amount, method, ref_id, timestamp | `PaymentDTO` | `GET /payments`, `POST /payments` |
| **Ledger** | entry_id, debit, credit, account_code, audit_id | `JournalDTO` | `GET /ledger`, `POST /ledger/post` |

## 03. GRID ASSET & TELEMETRY INFRASTRUCTURE
| Entity | Key Attributes | DTO Name | CRUD Endpoints |
| :--- | :--- | :--- | :--- |
| **Substation** | region_id, capacity_mva, status, health_score | `SubstationDTO` | `GET /network/substations` |
| **Feeder** | substation_id, max_load, current_load, voltage | `FeederDTO` | `GET /network/feeders` |
| **Transformer** | feeder_id, serial, temperature, load_factor | `TransformerDTO` | `GET /network/transformers` |
| **Meter** | serial, model, hardware_version, last_reading | `MeterDTO` | `GET /meters`, `POST /meters/provision` |
| **Gateway** | building_id, ip_address, sim_id, signal_level | `GatewayDTO` | `GET /telemetry/gateways` |
| **Reading** | meter_id, value, unit, timestamp, source | `ReadingDTO` | `GET /readings`, `POST /readings/bulk` |

## 04. OPERATIONS & GOVERNANCE
| Entity | Key Attributes | DTO Name | CRUD Endpoints |
| :--- | :--- | :--- | :--- |
| **Work Order** | asset_id, type, priority, crew_id, status | `WorkOrderDTO` | `GET /ops/work-orders` |
| **Alarm** | entity_id, severity, type, message, timestamp | `AlarmDTO` | `GET /monitoring/alarms` |
| **User/Role** | email, name, role_id, permissions[], mfa_enabled | `UserDTO` | `GET /admin/users`, `POST /admin/users` |
| **Audit Log** | user_id, action, entity_id, diff_json, timestamp | `AuditDTO` | `GET /admin/audit-logs` |
| **Import Job** | file_id, type, total_rows, success_count, status | `JobDTO` | `GET /jobs/import`, `POST /jobs/import` |

---
**Standard Validation Rule:** All monetary values use \`Decimal(20,2)\`. All timestamps use \`ISO-8601 (UTC)\`.
