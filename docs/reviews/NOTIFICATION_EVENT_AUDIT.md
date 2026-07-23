# Notification Event Audit

**Date:** 2026-07-23
**Phase:** 42b, Task: T03, Step: S01
**Status:** COMPLETE

## Current State

| Metric | Count |
|--------|-------|
| Events logged via `auditLog()` | 23 |
| Notification models in schema | 4 (Notification, NotificationTemplate, EmailLog, SmsLog, PushNotification) |
| Notification sending logic | **0** — no service exists |
| NotificationTemplate seed data | **0** — empty table |
| ActivityStream writes | **0** — model exists but unused |
| Notification route file | **0** — no `/api/notifications` endpoint |

## 23 Audited Events (already working)

```
auth.login_success          auth.login_failed
customer.viewed             customer.created     customer.updated
customer.archived           customer.export
meter.viewed                meter.created        meter.updated
meter.archived
reading.viewed              reading.created      reading.updated
reading.archived            readings.bulk_created
invoice.viewed              invoice.created      invoice.updated
invoice.archived            invoice.generated
payment.viewed              payment.created      payment.deleted
assignment.viewed           assignment.created   assignment.updated
assignment.ended
```

## The Gap

All 23 events write to `AuditEntry` (persistent log). **Zero** events trigger:
- In-app notification (Notification table)
- Email notification (EmailLog table)
- SMS notification (SmsLog table)
- Push notification (PushNotification table)

## What Needs to Be Built

### 1. NotificationTemplate seed data
Create templates for important events:
- `customer.created` → "New customer {name} registered"
- `invoice.generated` → "Invoice #{number} for {amount} EGP generated"
- `payment.created` → "Payment of {amount} EGP received for invoice #{number}"
- `reading.anomaly` → "Anomaly detected on meter {serial}"
- `assignment.created` → "Meter {serial} assigned to customer {name}"
- `contract.expiring` → "Contract {number} expiring in 30 days"

### 2. Notification sending service
Create `backend/src/services/notification-engine.js`:
- Listen to auditLog events (or be called directly)
- Look up NotificationTemplate by event key
- Render template with variables
- Create Notification record (in-app) and EmailLog/SmsLog record

### 3. Wire events to notifications
Priority-based:
- P0: invoice.generated, payment.created, customer.created
- P1: meter.archived, reading.anomaly, assignment.ended
- P2: auth.login_failed (security alerts), auth.login_success
- P3: All other events (lower volume, still useful)

### 4. Admin notification management
- `/api/notifications` route (CRUD for Notification + NotificationTemplate)
- Admin page to view/manage notification templates
- User notification preferences (opt-in/opt-out per event type)
