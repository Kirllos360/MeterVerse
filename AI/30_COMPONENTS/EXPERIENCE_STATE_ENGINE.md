# MeterVerse Experience State Engine

**Version:** 2.0.0  
**Authority:** Every possible state in the MeterVerse platform. Defines color, animation, icon, priority, and business meaning.

---

## 1. Global Application States

| State | Color | Icon | Priority | Animation | Accessibility |
|-------|-------|------|----------|-----------|---------------|
| Online | None | — | P3 | None | — |
| Offline | status-pending | WifiOff | P1 | Slide-in banner | aria-live="assertive" |
| Syncing | brand-500 | RefreshCw | P2 | Rotate icon | aria-busy="true" |
| Sync Failed | status-error | AlertTriangle | P0 | Pulse banner | aria-live="assertive" |
| Loading | brand-500 | Loader | P2 | Spinner | aria-busy="true" |
| Maintenance | status-pending | Wrench | P1 | Persistent banner | role="alert" |

---

## 2. Entity States

| State | Color | Icon | Animation | Business Meaning |
|-------|-------|------|-----------|-----------------|
| Active | status-active | CheckCircle | None | Entity is operational |
| Pending | status-pending | Clock | None | Awaiting processing |
| Draft | status-inactive | File | None | Not yet finalized |
| Approved | status-active | ThumbsUp | Check pulse | Workflow approved |
| Rejected | status-error | XCircle | Shake | Workflow rejected |
| Archived | status-inactive | Archive | Fade | No longer active |
| Locked | status-pending | Lock | None | Cannot be modified |
| Deleted | status-inactive | Trash2 | Fade out | Removed from system |

---

## 3. Business Event States

| Event | Color | Icon | Priority | User Action | Dashboard |
|-------|-------|------|----------|-------------|-----------|
| Invoice Generated | brand-500 | FileText | P2 | Review | Invoice widget |
| Invoice Failed | status-error | FileX | P0 | Fix error | Alert summary |
| Invoice Issued | brand-500 | Send | P2 | Track payment | Invoice widget |
| Payment Posted | status-active | CheckCircle | P2 | Verify | Payment widget |
| Payment Failed | status-error | XCircle | P0 | Retry | Alert summary |
| Payment Reversed | status-pending | Undo2 | P1 | Review | Payment widget |
| Reading Imported | brand-500 | Upload | P2 | Validate | Reading widget |
| Reading Failed | status-error | AlertTriangle | P1 | Re-import | Alert summary |
| Reading Suspicious | status-pending | AlertTriangle | P2 | Review | Reading widget |
| Meter Offline | status-error | WifiOff | P0 | Investigate | Alert summary |
| Meter Healthy | status-active | CheckCircle | P3 | None | Meter widget |
| Tariff Updated | brand-500 | RefreshCw | P2 | Review | Tariff widget |
| Leak Detected | status-error | Droplet | P0 | Dispatch | Alert summary |
| Tampering | status-error | ShieldAlert | P0 | Investigate | Alert summary |
| SIM Offline | status-error | Signal | P1 | Check SIM | Alert summary |
| Communication Lost | status-error | WifiOff | P1 | Check connection | Alert summary |
| Battery Low | status-pending | BatteryWarning | P2 | Schedule replace | Meter widget |
| Collection Success | status-active | DollarSign | P2 | None | Collection widget |
| Collection Delay | status-pending | Clock | P1 | Follow up | Collection widget |
| Settlement Pending | status-pending | FileText | P2 | Process | Settlement widget |
| Settlement Complete | status-active | CheckCircle | P2 | Verify | Settlement widget |
| Deadline Warning | status-pending | AlarmClock | P1 | Complete action | Workflow widget |
| Escalation | status-error | TrendingUp | P0 | Escalate | Alert summary |
| Dependency Missing | status-error | Link2Off | P1 | Resolve dependency | Workflow widget |

---

## 4. State Transition Rules

| Rule | Description |
|------|-------------|
| Irreversible states | Terminal states cannot be undone (deleted, retired) |
| Conditional states | Some states require approval to enter (approved→locked) |
| Automatic states | Some states are set by the system (sync failed) |
| Manual states | Some states require user action (pending→approved) |
| Timeout states | Some states auto-transition after a period (pending→overdue) |
