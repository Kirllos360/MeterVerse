# MVEOS Event, Reporting & Integration Matrix

## 01. REAL-TIME EVENT MATRIX (WebSocket / Centrifugo)
| Event Key | Trigger Condition | UI Behavior |
| :--- | :--- | :--- |
| \`METER_READING\` | New reading processed. | Update sparkline + Rolling KPI. |
| \`ALARM_RAISED\` | Severity > Medium alarm detected. | Pulse Sidebar icon + Global Toast. |
| \`INVOICE_READY\` | Billing cycle job completed. | Notification badge + Document download. |
| \`GATEWAY_HEARTBEAT\`| Telemetry node status change. | Update GIS node color + Status Badge. |
| \`LEDGER_UPDATE\` | Payment posted or settlement done. | Re-fetch Wallet Balance + Refresh Table. |
| \`JOB_PROGRESS\` | Bulk Import/Export percentage shift. | Update Progress Bar + Floating Ribbon. |

## 02. REPORTING & EXPORT CONTRACTS
| Report Type | Engine | Parameters | Formats |
| :--- | :--- | :--- | :--- |
| **Billing Statement** | Jasper | \`account_id\`, \`month\`, \`year\` | PDF |
| **Grid Load Analysis** | Python | \`feeder_id\`, \`interval\`, \`start_date\` | PDF, Excel |
| **Audit Trail** | Ledger | \`audit_id\`, \`entity_type\` | CSV, XLSX |
| **Customer 360 Export**| Core | \`customer_id\`, \`sections[]\` | PDF, ZIP |

## 03. INTEGRATION FORMATS (Bulk Operations)
| Operation | Template Format | Key Columns | Validation |
| :--- | :--- | :--- | :--- |
| **Meter Import** | CSV / XLSX | \`serial\`, \`model\`, \`building_code\` | Uniqueness check. |
| **Manual Readings** | CSV | \`meter_id\`, \`timestamp\`, \`value\` | Range check (Min/Max). |
| **Customer Bulk** | XLSX | \`civil_id\`, \`email\`, \`tariff_code\` | Email/ID format. |
| **Ledger Migration** | JSON | \`date\`, \`description\`, \`entries[]\` | Balanced (Dr = Cr). |

## 04. SECURITY & PERMISSION MAPPING
- **Auth:** \`Bearer JWT\` with Refresh Token Rotation.
- **Permissions:**
  - \`view:analytics\`: Access to Executive Dashboards.
  - \`edit:billing\`: Permission to Apply Waivers/Settlements.
  - \`exec:commands\`: Permission for Remote Device Restart/Ping.
  - \`view:audit\`: Access to Security & Audit Explorer.
- **MFA:** Required for \`exec:commands\` and \`edit:financials\`.
