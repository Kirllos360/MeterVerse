# MeterVerse Permission Key Map
# Generated: 2026-07-23
# Total keys: 64

## admin.create
- POST /api/admin/users
- POST /api/admin/roles
- POST /api/admin/permissions
- POST /api/admin/feature-flags
- POST /api/admin/api-keys
- POST /api/admin/organizations
- POST /api/admin/projects
- POST /api/admin/webhooks
- POST /api/admin/notification-templates
- POST /api/admin/backups
- POST /api/admin/queue
- POST /api/admin/queue/:id/retry
- POST /api/admin/scheduler
- POST /api/admin/license

## admin.delete
- DELETE /api/admin/users/:id
- DELETE /api/admin/roles/:id
- DELETE /api/admin/permissions/:id
- DELETE /api/admin/feature-flags/:id
- DELETE /api/admin/api-keys/:id
- DELETE /api/admin/sessions/:id
- DELETE /api/admin/organizations/:id
- DELETE /api/admin/webhooks/:id
- DELETE /api/admin/backups/:id
- DELETE /api/admin/cache/:id
- DELETE /api/admin/cache
- DELETE /api/admin/scheduler/:id

## admin.list
- GET /api/admin/health
- GET /api/admin/users
- GET /api/admin/roles
- GET /api/admin/permissions
- GET /api/admin/audit
- GET /api/admin/settings
- GET /api/admin/feature-flags
- GET /api/admin/api-keys
- GET /api/admin/sessions
- GET /api/admin/organizations
- GET /api/admin/projects
- GET /api/admin/webhooks
- GET /api/admin/notification-templates
- GET /api/admin/backups
- GET /api/admin/cache
- GET /api/admin/queue
- GET /api/admin/scheduler
- GET /api/admin/storage
- GET /api/admin/license
- GET /api/admin/branding
- GET /api/admin/logs
- GET /api/admin/monitoring
- GET /api/admin/ai-diagnostics

## admin.read
- GET /api/admin/users/:id
- GET /api/admin/roles/:id

## admin.update
- PUT /api/admin/users/:id
- PUT /api/admin/roles/:id
- PUT /api/admin/settings
- PUT /api/admin/feature-flags/:id/toggle
- PUT /api/admin/webhooks/:id/toggle
- PUT /api/admin/scheduler/:id/toggle
- PUT /api/admin/branding

## ai.create
- POST /api/ai/operator
- POST /api/ai/billing-assistant
- POST /api/ai/reading-validator
- POST /api/ai/leak-detection
- POST /api/ai/root-cause
- POST /api/ai/report-builder
- POST /api/ai/sql-assistant
- POST /api/ai/workflow-generator

## ai.list
- GET /api/ai/forecasting

## auth.create
- POST /api/auth/login
- POST /api/auth/register

## auth.list
- GET /api/auth/me

## business.create
- POST /api/business/pipeline/execute
- POST /api/business/pipeline/validate-reading
- POST /api/business/pipeline/calculate-consumption
- POST /api/business/pipeline/apply-tariff
- POST /api/business/simulate/tariff
- POST /api/business/simulate/invoice

## business.list
- GET /api/business/pipeline/status

## crud.create
- POST /api/crud/:modelName/:id/delete
- POST /api/crud/:modelName/:id/restore
- POST /api/crud/:modelName/bulk-update
- POST /api/crud/:modelName/bulk-delete
- POST /api/crud/:modelName/import
- POST /api/crud/undo/:auditEntryId
- POST /api/crud/:modelName/:id/submit-approval
- POST /api/crud/:modelName/:id/approve
- POST /api/crud/:modelName/:id/reject

## crud.export
- GET /api/crud/:modelName/export

## crud.read
- GET /api/crud/:modelName/:id/history

## customers.create
- POST /api/customers/

## customers.delete
- DELETE /api/customers/:id

## customers.export
- GET /api/customers/export
- GET /api/customers/export

## customers.list
- GET /api/customers/

## customers.read
- GET /api/customers/stats
- GET /api/customers/:id
- GET /api/customers/stats

## customers.update
- PUT /api/customers/:id

## invoices.create
- POST /api/invoices/
- POST /api/invoices/generate

## invoices.delete
- DELETE /api/invoices/:id

## invoices.export
- GET /api/invoices/export

## invoices.list
- GET /api/invoices/

## invoices.read
- GET /api/invoices/:id

## invoices.update
- PUT /api/invoices/:id

## meter_assignments.create
- POST /api/meter-assignments/

## meter_assignments.delete
- DELETE /api/meter-assignments/:id

## meter_assignments.list
- GET /api/meter-assignments/

## meter_assignments.read
- GET /api/meter-assignments/:id

## meter_assignments.update
- PUT /api/meter-assignments/:id

## meters.create
- POST /api/meters/

## meters.delete
- DELETE /api/meters/:id

## meters.export
- GET /api/meters/export

## meters.list
- GET /api/meters/

## meters.read
- GET /api/meters/:id

## meters.update
- PUT /api/meters/:id

## monitor.list
- GET /api/monitor/metrics/prometheus
- GET /api/monitor/health/deep
- GET /api/monitor/performance
- GET /api/monitor/audit/explorer
- GET /api/monitor/analytics

## notifications.create
- POST /api/notifications/templates

## notifications.delete
- DELETE /api/notifications/templates/:id

## notifications.list
- GET /api/notifications/
- GET /api/notifications/unread-count
- GET /api/notifications/templates

## notifications.update
- PUT /api/notifications/read-all
- PUT /api/notifications/:id/read
- PUT /api/notifications/templates/:id

## payments.create
- POST /api/payments/

## payments.delete
- DELETE /api/payments/:id

## payments.export
- GET /api/payments/export

## payments.list
- GET /api/payments/

## payments.read
- GET /api/payments/:id

## readings.create
- POST /api/readings/
- POST /api/readings/bulk

## readings.delete
- DELETE /api/readings/:id

## readings.export
- GET /api/readings/export

## readings.list
- GET /api/readings/

## readings.read
- GET /api/readings/:id

## readings.update
- PUT /api/readings/:id

## reports.create
- POST /api/reports/kpi
- POST /api/reports/export
- POST /api/reports/scheduled
- POST /api/reports/definitions

## reports.export
- GET /api/reports/export

## reports.list
- GET /api/reports/operational
- GET /api/reports/financial
- GET /api/reports/executive
- GET /api/reports/consumption
- GET /api/reports/variance
- GET /api/reports/aging
- GET /api/reports/kpi
- GET /api/reports/scheduled
- GET /api/reports/definitions

## reports.update
- PUT /api/reports/scheduled/:id/toggle

## security.create
- POST /api/security/validate-password

## security.list
- GET /api/security/audit/security
- GET /api/security/audit/secrets
- GET /api/security/audit/dependencies

## services.create
- POST /api/services/notifications
- POST /api/services/activity
- POST /api/services/email/send
- POST /api/services/sms/send
- POST /api/services/imports
- POST /api/services/exports
- POST /api/services/push/send
- POST /api/services/ocr
- POST /api/services/pdf
- POST /api/services/excel
- POST /api/services/error-tracking
- POST /api/services/cache

## services.export
- GET /api/services/exports

## services.list
- GET /api/services/notifications
- GET /api/services/activity
- GET /api/services/email
- GET /api/services/sms
- GET /api/services/imports
- GET /api/services/storage
- GET /api/services/scheduler/next
- GET /api/services/audit/summary
- GET /api/services/push
- GET /api/services/ocr
- GET /api/services/pdf
- GET /api/services/excel
- GET /api/services/error-tracking

## services.read
- GET /api/services/queue/stats
- GET /api/services/cache/stats

## services.update
- PUT /api/services/notifications/:id/read


