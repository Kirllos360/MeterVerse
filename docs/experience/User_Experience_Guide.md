# P48 — User Experience Guide (Enterprise Operations Center)

**Portal:** `/` · **Brand:** green (#059669) · **Shell:** SystemLayout

## 1. Identity

The User is the **Enterprise Operations Center** — the daily working surface for customer operations: meters, readings, billing, collections, customer tasks, communication, documents, reports, alerts, and workflow. The user operates within the platform, scoped to their area/project and their own customers.

## 2. Responsibilities (from P47 responsibility matrix)

- **Operate** — meters (own/assigned), readings, consumption.
- **Serve** — customers, tickets, service requests.
- **Collect** — invoices, payments, collections status.
- **Communicate** — notifications, documents.
- **Report** — usage, reports, alerts.

## 3. Navigation Model (Operations Center)

Same shell, green brand, role-scoped modules. Current user surface reuses admin components (customers/meters/invoices/payments/accounting/tariffs). Target (C14): a true customer-operations surface.

## 4. Key Workflows

| Workflow | Path |
|---|---|
| View a customer's meters | Customers → meters → readings/consumption |
| Receive a reading | Readings → submit/validate → stored → audited |
| Bill a customer | Invoices → generate → issue → payment → GL |
| Handle a ticket | Tickets → create → assign → resolve |
| Track collections | Collections → aging → promise-to-pay → recovery |

## 5. User UX Rules

- **Scoped by default** — the user only ever sees their area/project/customers.
- **Read-heavy, action-light** — views are read-first; actions are guided.
- **Every action is a step in a workflow, never a dead-end.**
- **Feedback is immediate** — toast + activity + audit confirmation.
- **Mobile-friendly** — responsive, no native app.

## 6. User App Map (current → target)

Current: root SPA (green SystemLayout) + `/user` (duplicate) + dashboard starter (unused Clerk shell). ~5 real grid views; several hardcoded placeholders (tickets, upload, tracking, add-data, workspace).

Target (C14): consolidate `/user`→`/`; build real self-service views — my meters, my bills + pay, submit reading, consumption analytics, tickets (backend-backed), notifications inbox, documents, service requests, profile/preferences. Remove the admin settings shell from the user surface (P47 finding).
