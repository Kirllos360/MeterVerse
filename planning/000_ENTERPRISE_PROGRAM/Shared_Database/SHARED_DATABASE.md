# Shared Database

## Database Architecture

| Property | Value |
|----------|-------|
| Engine | PostgreSQL 16 |
| Database Name | meter_pulse |
| Port | 5433 |
| ORM | Prisma 6.x |
| Models | 78 |
| Indexes | 68 |
| Migrations | 2 (init + indexes) |
| Connection Pooling | Built-in Prisma (PgBouncer planned Wave 04) |

## Schema Domains

| Domain | Models | Product Access |
|--------|--------|---------------|
| Core Business | Customer, Meter, Reading, Invoice, Payment | System A + B |
| Billing | Tariff, ChargeRule, BillRun, InvoiceItem | System A (B reads) |
| Auth | User, Role, Permission, Session, ApiKey | System A + B |
| Monitoring | AuditEntry, ActivityStream, Alert | System A + B |
| Communication | Notification, EmailLog, SmsLog | System A + B |
| Configuration | SystemSetting, FeatureFlag, BrandingConfig | System A only |
| Runtime | QueueJob, ScheduledTask, CacheEntry | Shared |

## Data Access Rules
1. System A can read/write all models
2. System B can read all models, write only to operational entities
3. Permission keys control write access at the API layer
4. No direct database access from products — always through API

## Multi-Tenancy Strategy (Planned Wave 04)
- Organization model exists, ready for row-level security
- Tenant isolation via organizationId filter on all queries
- Cross-organization reports for consolidated billing
