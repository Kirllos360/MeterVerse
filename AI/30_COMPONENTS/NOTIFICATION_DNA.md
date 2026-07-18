# MeterVerse Notification System

**Defines notification types, delivery, display, and user interaction.**

---

## 1. Notification Types

| Type | Purpose | Urgency | Persistence |
|------|---------|---------|-------------|
| Toast | Action feedback | High | Auto-dismiss 5s |
| Alert | System/entity alerts | Medium | Until acknowledged |
| Notification | User-targeted messages | Low | In notification center |
| In-app banner | Maintenance/announcements | Low | Until dismissed |

## 2. Notification Center

- **Location:** Bell icon in TopNav
- **Badge:** Unread count, max "99+"
- **Panel:** Dropdown showing recent notifications
- **Full page:** `/notifications` for history
- **Actions:** Mark read, mark all read, delete
- **Filter:** By type, date, read/unread

## 3. Toast Notifications

| Variant | Icon | Color | Usage |
|---------|------|-------|-------|
| Success | CheckCircle | Green | Action completed |
| Error | XCircle | Red | Action failed |
| Warning | AlertTriangle | Yellow | Potential issue |
| Info | Info | Blue | General information |
| Loading | Spinner | Blue | In-progress action |

## 4. Alert System

- **Severity levels:** Critical, High, Medium, Low
- **Color coding:** Critical=red, High=orange, Medium=yellow, Low=gray
- **Display:** Alert summary widget on dashboards
- **List:** Full alert list page with filtering
- **Actions:** Acknowledge, resolve, assign

## 5. Notification Channels

| Channel | Implementation | Status |
|---------|---------------|--------|
| In-app toast | Sonner library | ✅ Ready |
| Notification center | Zustand store + API | ✅ Backend ready |
| Email | Backend notification engine | 🔲 Planned |
| Browser push | Notification API | 🔲 Planned |
| Mobile push | FCM/APNs | 🔲 Planned |

## 6. Notification Rules

| Rule | Behavior |
|------|----------|
| Grouping | Same-type notifications grouped |
| Deduplication | Same notification not sent twice |
| Rate limiting | Max 5 notifications per minute |
| Priority | High priority bypasses quiet hours |
| Quiet hours | No non-urgent notifications 10pm-7am |
| Read status | Persisted, synced across sessions |
