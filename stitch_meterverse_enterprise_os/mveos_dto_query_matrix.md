# MVEOS DTO & Query Matrix

## 01. Standard Query Parameters (TanStack Table Compatible)
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `page` | `number` | Current page index (Default: 1) |
| `limit` | `number` | Items per page (Default: 25) |
| `sort_by` | `string` | Column key (e.g., "created_at") |
| `order` | `"asc" | "desc"` | Sorting direction |
| `filter[key]` | `string` | Dynamic column filtering |
| `search` | `string` | Global fuzzy search query |
| `include` | `string[]` | Relation embedding (e.g., ["customer", "meter"]) |

## 02. Mutation Contracts (Optimistic Update Ready)
| Action | Payload Pattern | Success Status | Cache Invalidation Keys |
| :--- | :--- | :--- | :--- |
| **Provision Meter** | `{ serial: string, type: enum, building_id: uuid }` | `201 Created` | `["meters", "building_meters"]` |
| **Generate Invoice** | `{ account_id: uuid, period: string }` | `202 Accepted` | `["invoices", "customer_ledger"]` |
| **Acknowledge Alarm** | `{ alarm_id: uuid, note: string }` | `200 OK` | `["alarms", "system_health"]` |
| **Post Journal** | `{ entries: [{ debit: float, credit: float, account: string }] }` | `201 Created` | `["ledger", "financial_summary"]` |

## 03. Validation Rules (Zod/Class-Validator)
- **Email:** Strict RFC 5322.
- **Currency:** Decimals(20, 2) to handle multi-currency precision.
- **Meter Serial:** Regex `^[A-Z0-9-]{8,24}$`.
- **IP Address:** CIDR support for Gateway configuration.
