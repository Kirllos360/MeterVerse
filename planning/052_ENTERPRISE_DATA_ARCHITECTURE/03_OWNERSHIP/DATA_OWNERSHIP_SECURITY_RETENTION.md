# Data Ownership, Security & Retention

**File:** `planning/052_ENTERPRISE_DATA_ARCHITECTURE/03_OWNERSHIP/DATA_OWNERSHIP_SECURITY_RETENTION.md`

---

## Data Ownership Matrix

| Entity | Business Owner | Technical Owner | Data Steward | Security Class |
|--------|---------------|----------------|--------------|----------------|
| Customer | CRM Director | Backend Team | Data Analyst | Confidential |
| Meter | Meter Ops Director | Backend Team | Meter Data Analyst | Internal |
| Reading | Meter Data Mgmt Director | Data Engineering | Data Analyst | Internal |
| Invoice | Finance Director | Backend Team | Billing Analyst | Confidential |
| Payment | Finance Director | Backend Team | Accountant | Highly Confidential |
| JournalEntry | Finance Director | Backend Team | Accountant | Highly Confidential |
| User | IT Admin | Platform Team | Security Analyst | Highly Confidential |
| Session | Security Director | Platform Team | Security Analyst | Highly Confidential |
| AI Memory | AI Director | AI Platform Team | AI Analyst | Internal |
| Configuration | Platform Director | Platform Team | DevOps | Internal |
| AuditEntry | Compliance Officer | Platform Team | Security Analyst | Confidential |

## Data Security Classification

| Classification | Definition | Examples | Encryption Required | Masking Required |
|---------------|------------|----------|-------------------|------------------|
| Public | Freely accessible | Meter types, Tariff names, Help content | No | No |
| Internal | Internal operations | Meters, Readings, Sync logs, Configuration | At rest (AES-256) | No |
| Confidential | Business sensitive | Customers, Invoices, Contracts, Reports | At rest + TLS | PII fields |
| Highly Confidential | Legal/financial risk | Payments, Bank accounts, User credentials, MFA secrets, API keys | At rest + TLS + Field-level | Full masking for non-privileged |
| Regulated | Subject to compliance | Tax records, Audit logs, Legal holds | At rest + TLS + Immutable storage | Per regulatory requirement |

## Column-Level Security

| Entity | Sensitive Columns | Protection | Masked For |
|--------|------------------|------------|------------|
| User | password | bcrypt hash | Never readable |
| User | mfaSecret | AES-256 encrypted | Never readable |
| User | email | At-rest encryption | Non-admin roles |
| Customer | email, phone | At-rest encryption | Customer Service (non-admin) |
| Payment | cardToken | Tokenized via gateway | Never stored |
| ApiKey | key | Hash (SHA-256) | After first display |
| Session | token | Hash (SHA-256) | Never readable |
| PaymentGateway | config (JSON) | AES-256 encrypted | Finance admin only |

## Row-Level Security (Tenant Isolation)

| Entity | Isolation Strategy | Implementation |
|--------|-------------------|----------------|
| Organization | Organization ID on every record | WHERE organizationId = current |
| Project | Project ID scoping | WHERE projectId IN (user.projects) |
| Area | Area field on entities | WHERE area = user.area |
| All entities | ArchivedAt filter | WHERE archivedAt IS NULL |

## Data Retention Policy

| Entity | Active Retention | Archive Trigger | Archive Retention | Disposal Method |
|--------|-----------------|----------------|-------------------|----------------|
| Customer | Indefinite (active) | Inactive > 5 years | 10 years | Anonymized deletion |
| Meter | Indefinite (active) | Retired | 10 years after retirement | Serial decommissioned |
| Reading | 2 years online | After billing + 2 years | 8 years (cold storage) | Purge after 10 years |
| Invoice | 7 years online | After paid + 7 years | 3 years (cold storage) | Purge after 10 years |
| Payment | 7 years online | After reconciled + 5 years | 5 years | Purge after 10 years |
| JournalEntry | 10 years online | End of fiscal year + 10 years | 5 years (cold storage) | Permanent (regulatory) |
| AuditEntry | 2 years online | After creation + 2 years | 8 years | Purge after 10 years |
| Session | Until expiry | After expiry | 90 days | Purge after 90 days |
| SyncJob | 90 days | After completion + 90 days | 275 days | Purge after 1 year |
| Backup | Until next full backup | After next full + 30 days | 12 monthly, 7 yearly | After retention expires |
| EmailLog | 90 days | After sent + 90 days | 275 days | Purge after 1 year |
| SmsLog | 90 days | After sent + 90 days | 275 days | Purge after 1 year |
| AI Conversation | 30 days | After completion + 30 days | 335 days | Purge after 1 year |
| MetricPoint | 90 days high-res | After creation + 90 days | 275 days low-res | Purge after 1 year |

### Legal Hold
When legal hold is active on an entity:
- Retention policy is suspended
- Entity is moved to legal hold storage
- Normal deletion is blocked
- Hold is documented in LegalHold record
- Only lifted by legal team authorization

## Data Encryption Strategy

| Layer | Method | Scope |
|-------|--------|-------|
| Transport | TLS 1.3 | All external API traffic |
| Database | AES-256 at rest | PostgreSQL transparent data encryption |
| Field-level | AES-256-GCM | PII fields, API keys, secrets |
| Backup | AES-256 | All backup files |
| File storage | AES-256 | All uploaded documents |
| Tokenization | PCI-DSS compliant | Payment card data via gateway |

## Data Masking Rules

| Role | Masking Applied |
|------|----------------|
| Viewer | Customer email: j***@example.com, Phone: +20********* |
| Customer Service | Email: full, Phone: last 4 digits only |
| Billing Operator | No masking on invoice data |
| Finance Admin | No masking on financial data |
| Meter Operator | No masking on meter data |
| Admin | No masking (full access) |
| Super Admin | No masking (full access) |
