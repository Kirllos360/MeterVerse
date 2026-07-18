# MVEOS API Contract Matrix (Frontend ↔ Backend)
**Version:** 1.0 (Production Stable)
**Purpose:** Permanent REST/Websocket Handover Contract

## 01. CORE INFRASTRUCTURE & NETWORK
| Entity | Base Route | Methods | Primary DTOs | Real-time Events |
| :--- | :--- | :--- | :--- | :--- |
| **Organization** | `/api/v1/org` | GET, PUT | `OrgDTO`, `UpdateOrgDTO` | `ORG_UPDATED` |
| **Substation** | `/api/v1/network/substations` | GET, POST, DELETE | `SubstationDTO`, `CreateSubstationDTO` | `NODE_HEALTH_CHANGE` |
| **Feeder** | `/api/v1/network/feeders` | GET, POST | `FeederDTO`, `LoadBalanceDTO` | `FEEDER_LOAD_CRITICAL` |
| **Transformer** | `/api/v1/network/transformers` | GET, PATCH | `TransformerDTO`, `HealthScoreDTO` | `TRANSFORMER_TRIP` |
| **Gateway** | `/api/v1/telemetry/gateways` | GET, PUT | `GatewayDTO`, `StatusDTO` | `GATEWAY_OFFLINE` |

## 02. METER & TELEMETRY
| Entity | Base Route | Methods | Primary DTOs | Real-time Events |
| :--- | :--- | :--- | :--- | :--- |
| **Meter** | `/api/v1/meters` | ALL | `MeterDTO`, `ProvisionMeterDTO` | `METER_TAMPER_ALERT` |
| **SIM Card** | `/api/v1/telemetry/sims` | GET, PATCH | `SimDTO`, `TrafficUsageDTO` | `SIM_LIMIT_EXCEEDED` |
| **Reading** | `/api/v1/readings` | GET, POST (Bulk) | `ReadingDTO`, `ReadingImportDTO` | `READING_PROCESSED` |
| **Consumption**| `/api/v1/analytics/usage` | GET | `ConsumptionSeriesDTO` | N/A (Polling) |

## 03. CUSTOMER & FINANCIAL
| Entity | Base Route | Methods | Primary DTOs | Real-time Events |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | `/api/v1/customers` | ALL | `Customer360DTO`, `CreateCustomerDTO` | `DOC_UPLOAD_COMPLETE` |
| **Invoice** | `/api/v1/financial/invoices`| GET, POST, PATCH | `InvoiceDTO`, `SettlementDTO` | `INVOICE_GENERATED` |
| **Payment** | `/api/v1/financial/payments`| GET, POST | `PaymentDTO`, `AllocationDTO` | `PAYMENT_POSTED` |
| **Ledger** | `/api/v1/financial/ledger` | GET, POST | `JournalEntryDTO`, `AuditTrailDTO` | `LEDGER_BALANCED` |

## 04. OPERATIONS & MAINTENANCE
| Entity | Base Route | Methods | Primary DTOs | Real-time Events |
| :--- | :--- | :--- | :--- | :--- |
| **Work Order** | `/api/v1/ops/work-orders` | ALL | `WorkOrderDTO`, `DispatchDTO` | `CREW_ASSIGNED` |
| **Inventory** | `/api/v1/ops/inventory` | GET, PUT | `StockDTO`, `PurchaseOrderDTO` | `LOW_STOCK_WARNING` |
| **Alarm** | `/api/v1/monitoring/alarms`| GET, PATCH | `AlarmDTO`, `ResolutionDTO` | `NEW_CRITICAL_ALARM` |

---
**Protocol:** REST (JSON) + WebSocket (Socket.io/Centrifugo) for Real-time events.
**Auth:** Bearer JWT (Refresh Token Rotation).
**, data_type: 'MARKDOWN', title: 'MVEOS API Contract Matrix' }function(response) {
  // Save DTO and Query Matrix
  save_content({
    content: `
# MVEOS DTO & Query Matrix

## 01. Standard Query Parameters (TanStack Table Compatible)
| Parameter | Type | Description |
| :--- | :--- | :--- |
| \`page\` | \`number\` | Current page index (Default: 1) |
| \`limit\` | \`number\` | Items per page (Default: 25) |
| \`sort_by\` | \`string\` | Column key (e.g., \"created_at\") |
| \`order\` | \`\"asc\" | \"desc\"\` | Sorting direction |
| \`filter[key]\` | \`string\` | Dynamic column filtering |
| \`search\` | \`string\` | Global fuzzy search query |
| \`include\` | \`string[]\` | Relation embedding (e.g., [\"customer\", \"meter\"]) |

## 02. Mutation Contracts (Optimistic Update Ready)
| Action | Payload Pattern | Success Status | Cache Invalidation Keys |
| :--- | :--- | :--- | :--- |
| **Provision Meter** | \`{ serial: string, type: enum, building_id: uuid }\` | \`201 Created\` | \`[\"meters\", \"building_meters\"]\` |
| **Generate Invoice** | \`{ account_id: uuid, period: string }\` | \`202 Accepted\` | \`[\"invoices\", \"customer_ledger\"]\` |
| **Acknowledge Alarm** | \`{ alarm_id: uuid, note: string }\` | \`200 OK\` | \`[\"alarms\", \"system_health\"]\` |
| **Post Journal** | \`{ entries: [{ debit: float, credit: float, account: string }] }\` | \`201 Created\` | \`[\"ledger\", \"financial_summary\"]\` |

## 03. Validation Rules (Zod/Class-Validator)
- **Email:** Strict RFC 5322.
- **Currency:** Decimals(20, 2) to handle multi-currency precision.
- **Meter Serial:** Regex \`^[A-Z0-9-]{8,24}$\`.
- **IP Address:** CIDR support for Gateway configuration.
`,
    data_type: 'MARKDOWN',
    title: 'MVEOS DTO & Query Matrix'
  });
  
  // Save State and Error Matrix
  save_content({
    content: `
# MVEOS State, Cache & Error Matrix

## 01. TanStack Query Configuration
| Key Strategy | Stale Time | Cache Time | Refetch On Window Focus |
| :--- | :--- | :--- | :--- |
| **Static Data** (Config) | \`1h\` | \`24h\` | \`false\` |
| **Operational Data** | \`30s\` | \`5m\` | \`true\` |
| **Live Telemetry** | \`0s\` (Fresh) | \`30s\` | \`true\` |
| **Financial Ledgers** | \`2m\` | \`10m\` | \`false\` |

## 02. Global State (Zustand)
- **AuthStore:** \`user\`, \`permissions\`, \`workspace_id\`, \`token\`.
- **UIStore:** \`sidebar_collapsed\`, \`theme\`, \`language\`, \`active_modals[]\`.
- **TelemetryStore:** \`live_events[]\`, \`connection_status\`.

## 03. Error Response Contract
\`\`\`json
{
  \"status\": \"error\",
  \"code\": \"VALIDATION_FAILED\",
  \"message\": \"Invalid meter configuration provided.\",
  \"details\": [
    { \"field\": \"serial_number\", \"issue\": \"ALREADY_EXISTS\" }
  ],
  \"trace_id\": \"req_789234jk\"
}
\`\`\`

## 04. Error Categories
- **401 Unauthorized:** Force login redirect + clear cache.
- **403 Forbidden:** Global Toast \"Access Denied\".
- **409 Conflict:** Open \"Resolution Wizard\" or \"Diff Viewer\".
- **422 Unprocessable:** Inline field validation rendering.
`,
    data_type: 'MARKDOWN',
    title: 'MVEOS State & Error Matrix'
  });
}