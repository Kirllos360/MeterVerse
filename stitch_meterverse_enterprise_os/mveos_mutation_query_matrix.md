# MVEOS Mutation, Query & Validation Matrix

## 01. ADVANCED QUERY CONTRACTS (TanStack Table)
| Context | Strategy | Query Parameters | Cache Key |
| :--- | :--- | :--- | :--- |
| **Global Search** | Fuzzy Search | \`?search=...&limit=10\` | \`['global-search', q]\` |
| **Data Tables** | Offset Paginated | \`?page=1&limit=25&sort_by=id&order=desc\` | \`['entity', { page, limit, filters }]\` |
| **Trend Analytics** | Time-Series | \`?period=24h&interval=1h&asset_id=...\` | \`['analytics', { period, assetId }]\` |
| **Audit Explorer** | Filtered Stream | \`?user_id=...&entity=...&date_from=...\` | \`['audit-stream', { filters }]\` |

## 02. MUTATION & OPTIMISTIC UPDATE CONTRACTS
| Action | HTTP | Endpoint | Invalidation Strategy |
| :--- | :--- | :--- | :--- |
| **Approve Invoice** | PATCH | \`/invoices/:id/approve\` | \`invoices\`, \`customer-ledger\` |
| **Provision Meter** | POST | \`/meters/provision\` | \`meters\`, \`building-inventory\` |
| **Acknowledge Alarm**| PATCH | \`/alarms/:id/ack\` | \`alarms\`, \`system-health\` |
| **Post Journal Entry**| POST | \`/ledger/post\` | \`ledger-history\`, \`balance-sheet\` |
| **Assign Crew** | PATCH | \`/ops/work-orders/:id/assign\` | \`work-orders\`, \`crew-schedule\` |

## 03. VALIDATION MATRIX (Zod / NestJS Pipe)
| Field Type | Rules | Error Response Code |
| :--- | :--- | :--- |
| **Meter Serial** | \`^[A-Z0-9-]{12,32}$\` | \`INVALID_SERIAL_FORMAT\` |
| **Currency** | \`Min: 0, Max: 999999999, Decimals: 2\` | \`MONEY_OUT_OF_RANGE\` |
| **IP Address** | \`IPv4 / IPv6 compliant\` | \`INVALID_NETWORK_CONFIG\` |
| **Date Range** | \`start_date < end_date\`, \`Max: 365d\` | \`DATE_RANGE_TOO_LONG\` |
| **JSON Diff** | \`Valid JSON Object, Max: 500KB\` | \`MALFORMED_METADATA\` |

## 04. ERROR & CACHE STRATEGY
- **Stale Time:** 30s (Operational), 1h (Static Config), 0s (Live Telemetry).
- **Retry Logic:** 3 attempts with exponential backoff for Network Errors (5xx).
- **Concurrency:** Optimistic updates with manual cache rollback on mutation failure.
- **Offline Support:** LocalStorage persistence for \`Draft\` states (Wizards, Forms).
