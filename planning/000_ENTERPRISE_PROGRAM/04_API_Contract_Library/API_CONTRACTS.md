# API Contract Library

**Purpose:** Every endpoint documented with contract, validation, errors, and events.

## /api/customers

### Authentication
- Required: Yes
- Permission key: customers.{action}

### Endpoints

| Method | Path | Permission | Input | Output |
|--------|------|-----------|-------|--------|
| GET | /api/customers | customers.list | page, limit, search | { customers: [], total, page, limit } |
| GET | /api/customers/:id | customers.read | — | { customers: {} } |
| POST | /api/customers | customers.create | { ...fields } | { customers: {} } |
| PUT | /api/customers/:id | customers.update | { ...fields } | { customers: {} } |
| DELETE | /api/customers/:id | customers.delete | — | { success: true } |

### Errors
- 400: Validation error
- 401: Authentication required
- 403: Permission denied
- 404: Not found
- 500: Internal error

### Events
- create → customers.created event
- update → customers.updated event
- delete → customers.deleted event

---

## /api/meters

### Authentication
- Required: Yes
- Permission key: meters.{action}

### Endpoints

| Method | Path | Permission | Input | Output |
|--------|------|-----------|-------|--------|
| GET | /api/meters | meters.list | page, limit, search | { meters: [], total, page, limit } |
| GET | /api/meters/:id | meters.read | — | { meters: {} } |
| POST | /api/meters | meters.create | { ...fields } | { meters: {} } |
| PUT | /api/meters/:id | meters.update | { ...fields } | { meters: {} } |
| DELETE | /api/meters/:id | meters.delete | — | { success: true } |

### Errors
- 400: Validation error
- 401: Authentication required
- 403: Permission denied
- 404: Not found
- 500: Internal error

### Events
- create → meters.created event
- update → meters.updated event
- delete → meters.deleted event

---

## /api/readings

### Authentication
- Required: Yes
- Permission key: readings.{action}

### Endpoints

| Method | Path | Permission | Input | Output |
|--------|------|-----------|-------|--------|
| GET | /api/readings | readings.list | page, limit, search | { readings: [], total, page, limit } |
| GET | /api/readings/:id | readings.read | — | { readings: {} } |
| POST | /api/readings | readings.create | { ...fields } | { readings: {} } |
| PUT | /api/readings/:id | readings.update | { ...fields } | { readings: {} } |
| DELETE | /api/readings/:id | readings.delete | — | { success: true } |

### Errors
- 400: Validation error
- 401: Authentication required
- 403: Permission denied
- 404: Not found
- 500: Internal error

### Events
- create → readings.created event
- update → readings.updated event
- delete → readings.deleted event

---

## /api/invoices

### Authentication
- Required: Yes
- Permission key: invoices.{action}

### Endpoints

| Method | Path | Permission | Input | Output |
|--------|------|-----------|-------|--------|
| GET | /api/invoices | invoices.list | page, limit, search | { invoices: [], total, page, limit } |
| GET | /api/invoices/:id | invoices.read | — | { invoices: {} } |
| POST | /api/invoices | invoices.create | { ...fields } | { invoices: {} } |
| PUT | /api/invoices/:id | invoices.update | { ...fields } | { invoices: {} } |
| DELETE | /api/invoices/:id | invoices.delete | — | { success: true } |

### Errors
- 400: Validation error
- 401: Authentication required
- 403: Permission denied
- 404: Not found
- 500: Internal error

### Events
- create → invoices.created event
- update → invoices.updated event
- delete → invoices.deleted event

---

## /api/payments

### Authentication
- Required: Yes
- Permission key: payments.{action}

### Endpoints

| Method | Path | Permission | Input | Output |
|--------|------|-----------|-------|--------|
| GET | /api/payments | payments.list | page, limit, search | { payments: [], total, page, limit } |
| GET | /api/payments/:id | payments.read | — | { payments: {} } |
| POST | /api/payments | payments.create | { ...fields } | { payments: {} } |
| PUT | /api/payments/:id | payments.update | { ...fields } | { payments: {} } |
| DELETE | /api/payments/:id | payments.delete | — | { success: true } |

### Errors
- 400: Validation error
- 401: Authentication required
- 403: Permission denied
- 404: Not found
- 500: Internal error

### Events
- create → payments.created event
- update → payments.updated event
- delete → payments.deleted event

---

## /api/notifications

### Authentication
- Required: Yes
- Permission key: notifications.{action}

### Endpoints

| Method | Path | Permission | Input | Output |
|--------|------|-----------|-------|--------|
| GET | /api/notifications | notifications.list | page, limit, search | { notifications: [], total, page, limit } |
| GET | /api/notifications/:id | notifications.read | — | { notifications: {} } |
| POST | /api/notifications | notifications.create | { ...fields } | { notifications: {} } |
| PUT | /api/notifications/:id | notifications.update | { ...fields } | { notifications: {} } |
| DELETE | /api/notifications/:id | notifications.delete | — | { success: true } |

### Errors
- 400: Validation error
- 401: Authentication required
- 403: Permission denied
- 404: Not found
- 500: Internal error

### Events
- create → notifications.created event
- update → notifications.updated event
- delete → notifications.deleted event

---

## /api/auth

### Authentication
- Required: Yes
- Permission key: auth.{action}

### Endpoints

| Method | Path | Permission | Input | Output |
|--------|------|-----------|-------|--------|
| GET | /api/auth | auth.list | page, limit, search | { auth: [], total, page, limit } |
| GET | /api/auth/:id | auth.read | — | { auth: {} } |
| POST | /api/auth | auth.create | { ...fields } | { auth: {} } |
| PUT | /api/auth/:id | auth.update | { ...fields } | { auth: {} } |
| DELETE | /api/auth/:id | auth.delete | — | { success: true } |

### Errors
- 400: Validation error
- 401: Authentication required
- 403: Permission denied
- 404: Not found
- 500: Internal error

### Events
- create → auth.created event
- update → auth.updated event
- delete → auth.deleted event

---

## /api/alerts

### Authentication
- Required: Yes
- Permission key: alerts.{action}

### Endpoints

| Method | Path | Permission | Input | Output |
|--------|------|-----------|-------|--------|
| GET | /api/alerts | alerts.list | page, limit, search | { alerts: [], total, page, limit } |
| GET | /api/alerts/:id | alerts.read | — | { alerts: {} } |
| POST | /api/alerts | alerts.create | { ...fields } | { alerts: {} } |
| PUT | /api/alerts/:id | alerts.update | { ...fields } | { alerts: {} } |
| DELETE | /api/alerts/:id | alerts.delete | — | { success: true } |

### Errors
- 400: Validation error
- 401: Authentication required
- 403: Permission denied
- 404: Not found
- 500: Internal error

### Events
- create → alerts.created event
- update → alerts.updated event
- delete → alerts.deleted event

---

