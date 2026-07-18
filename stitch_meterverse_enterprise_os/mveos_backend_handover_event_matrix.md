# MVEOS Backend Handover & Event Matrix

## 01. Event Matrix (Websocket / Server-Sent Events)
| Topic | Payload | UI Behavior |
| :--- | :--- | :--- |
| `ALARM_RAISED` | `AlarmDTO` | Trigger Pulse Animation on Alarm Center icon + Toast. |
| `READING_STREAM` | `{ meter_id: uuid, value: float }` | Update Sparkline + Rolling Number in Dashboard/Diagnostics. |
| `TASK_UPDATE` | `WorkOrderDTO` | Re-fetch Work Order table row + Update Inspector Panel. |
| `SYSTEM_HEALTH` | `{ cpu: float, latency: ms }` | Update System Health Badge in Footer. |
| `ASYNC_JOB_COMPLETE` | `{ job_id: uuid, result: string }` | Notification Bell update + Download Prompt for reports. |

## 02. Report & Export Parameter Mapping
| Report Type | Engine | Input Parameters | Output Formats |
| :--- | :--- | :--- | :--- |
| **Billing Cycle** | JasperReports | `month`, `year`, `org_id` | PDF, Excel, CSV |
| **Grid Load Analysis** | Python/R | `substation_id`, `start_date`, `end_date` | PDF (High-Res Plots) |
| **Audit Log** | Ledger Engine | `entity_id`, `user_id`, `date_range` | CSV, Excel |
| **Asset Lifecycle** | MVEOS Core | `serial_range`, `asset_type` | PDF, XLSX |

## 03. Handover Summary
- **Frontend Target:** Next.js 15 (App Router).
- **Styling:** Tailwind CSS v4 + Motion.
- **Data Layer:** TanStack Query v5 + Axios instance (interceptors wired for 401/403).
- **Type Safety:** TypeScript Interfaces auto-generated from this Contract Matrix.
- **Status:** **100% READY FOR BACKEND INTEGRATION.**
