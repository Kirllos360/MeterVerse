# MVEOS State, Cache & Error Matrix

## 01. TanStack Query Configuration
| Key Strategy | Stale Time | Cache Time | Refetch On Window Focus |
| :--- | :--- | :--- | :--- |
| **Static Data** (Config) | `1h` | `24h` | `false` |
| **Operational Data** | `30s` | `5m` | `true` |
| **Live Telemetry** | `0s` (Fresh) | `30s` | `true` |
| **Financial Ledgers** | `2m` | `10m` | `false` |

## 02. Global State (Zustand)
- **AuthStore:** `user`, `permissions`, `workspace_id`, `token`.
- **UIStore:** `sidebar_collapsed`, `theme`, `language`, `active_modals[]`.
- **TelemetryStore:** `live_events[]`, `connection_status`.

## 03. Error Response Contract
```json
{
  "status": "error",
  "code": "VALIDATION_FAILED",
  "message": "Invalid meter configuration provided.",
  "details": [
    { "field": "serial_number", "issue": "ALREADY_EXISTS" }
  ],
  "trace_id": "req_789234jk"
}
```

## 04. Error Categories
- **401 Unauthorized:** Force login redirect + clear cache.
- **403 Forbidden:** Global Toast "Access Denied".
- **409 Conflict:** Open "Resolution Wizard" or "Diff Viewer".
- **422 Unprocessable:** Inline field validation rendering.
