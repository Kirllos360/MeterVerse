# C15 — Enterprise Integration Platform & External Ecosystem Hub
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY — GOVERNANCE PLANNING ONLY — NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Preceded by:** C01-C10 Connectivity, C12 Identity, C13 Financial, C14 Customer Experience  

---

## PART 1: CURRENT STATE AUDIT

### 1.1 Existing Integration Infrastructure

| Component | Location | Status | Capability |
|-----------|----------|--------|------------|
| **EventBus** (in-memory pub/sub) | `services/event-bus.js` | ✅ Complete | emit/on/off, history, stats, wildcard listeners |
| **Webhook** model | `schema.prisma:435` | ✅ Complete | name, url, events, secret, active, lastTriggeredAt |
| **WebhookDispatcher** | `services/webhook-dispatcher.js` | ✅ Complete | HMAC signing, 3-retry exponential backoff, 512KB limit |
| **QueueJob** model | `schema.prisma:485` | ✅ Complete | type, payload, status, priority, attempts, maxAttempts |
| **ApiKey** model | `schema.prisma:128` | ✅ Complete | name, key, prefix, permissions, expiresAt |
| **correlationMiddleware** | `middleware/errorHandler.js:20` | ✅ Complete | X-Correlation-ID propagation |
| **rate-limit middleware** | Express config | ✅ Complete | 100 req/15min per IP |
| **CORS middleware** | Express config | ✅ Complete | Cross-origin configured |
| **C12 Governance** | Complete | ✅ Full | RBAC, audit, Zero Trust, compliance |
| **GatewayLog** model | `schema.prisma:1480` | ✅ Complete | Webhook delivery logging |

### 1.2 Gap Analysis

| Capability | Current | C15 Target |
|------------|---------|------------|
| **Integration Registry** | ❌ None | Catalog of all integrations with status |
| **API Lifecycle Management** | ❌ None | Version, deprecate, retire |
| **Canonical Data Model** | ❌ None | Standardized event/entity schemas |
| **Data Transformation Engine** | ❌ None | Map between internal↔external formats |
| **Connector Framework** | ❌ None | Pluggable connector architecture |
| **ERP Integration** | ❌ None | Oracle, SAP, Odoo connectors |
| **CRM Integration** | ❌ None | Salesforce, HubSpot connectors |
| **GIS Integration** | ❌ None | ArcGIS, QGIS connectors |
| **SCADA Integration** | ❌ None | OSIsoft, Ignition connectors |
| **AMI/MDM Integration** | ❌ None | Meter data management sync |
| **Payment Gateway Abstraction** | One-off stripe | Multi-gateway unified API |
| **Banking/Government Connectors** | ❌ None | e-invoicing, tax authority |
| **Schema Registry** | ❌ None | Versioned event/message schemas |
| **Dead-Letter Queue** | ❌ None | Failed message handling |
| **Secrets/Certificate Management** | Env vars only | Vault/HSM integration |
| **Integration SLA Monitoring** | ❌ None | Uptime, latency, error rate |
| **Distributed Tracing** | Correlation ID only | Full trace spans |
| **AI Integration Ops Agent** | ❌ None | Anomaly, mapping, failure prediction |
| **Low-code Integration Templates** | ❌ None | Pre-built connector blueprints |

---

## PART 2: INTEGRATION PLATFORM ARCHITECTURE

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                      ENTERPRISE INTEGRATION PLATFORM & ECOSYSTEM HUB                                            │
│                                                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  API GATEWAY LAYER                                                                                      │    │
│  │                                                                                                        │    │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────────┐   │    │
│  │  │ Internal API   │ │ External API   │ │ API Versioning │ │ API Deprecation│ │ Rate Limiting &    │   │    │
│  │  │ Catalog        │ │ Catalog        │ │ & Lifecycle    │ │ Policy         │ │ Throttling         │   │    │
│  │  └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────────┘   │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  INTEGRATION RUNTIME                                                                                    │    │
│  │                                                                                                        │    │
│  │  ┌────────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐ ┌──────────────┐    │    │
│  │  │ Event Bus (existing)   │ │ Message Queue          │ │ Webhook Dispatcher    │ │ Callback      │    │    │
│  │  │ In-memory → Persistent │ │ (DLQ, retry, priority) │ │ (existing → enhanced) │ │ Orchestrator  │    │    │
│  │  └────────────────────────┘ └────────────────────────┘ └────────────────────────┘ └──────────────┘    │    │
│  │                                                                                                        │    │
│  │  ┌────────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐ ┌──────────────┐    │    │
│  │  │ Data Transformation   │ │ Schema Registry        │ │ Canonical Data Model   │ │ Idempotency   │    │    │
│  │  │ Engine                 │ │ (versioned schemas)    │ │ (internal → external)  │ │ Engine        │    │    │
│  │  └────────────────────────┘ └────────────────────────┘ └────────────────────────┘ └──────────────┘    │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  CONNECTOR FRAMEWORK                                                                                   │    │
│  │                                                                                                        │    │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────┐  │    │
│  │  │ ERP        │ │ CRM        │ │ GIS        │ │ SCADA      │ │ AMI/MDM    │ │ Payment    │ │ Bank  │  │    │
│  │  │ Oracle/SAP │ │Sales/HubSp │ │ArcGIS/QGIS │ │OSI/Ignition│ │ Meter Data │ │ Gateway    │ │       │  │    │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘ └──────┘  │    │
│  │                                                                                                        │    │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐           │    │
│  │  │ Government │ │ Email/SMS  │ │ Document   │ │ LDAP/AD   │ │ Identity   │ │ Custom     │           │    │
│  │  │ e-Invoice  │ │ /WhatsApp  │ │ Management │ │ Federation │ │ Provider   │ │ Connector  │           │    │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘           │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  OPERATIONS & OBSERVABILITY                                                                             │    │
│  │                                                                                                        │    │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────────┐   │    │
│  │  │ Integration    │ │ SLA Monitoring │ │ Distributed    │ │ Error          │ │ Replay &           │   │    │
│  │  │ Health Dashboard│ │ Uptime/Latency │ │ Tracing (spans)│ │ Investigation  │ │ Reprocessing Engine│   │    │
│  │  └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────────┘   │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  AI INTEGRATION OPERATIONS AGENT                                                                         │    │
│  │                                                                                                        │    │
│  │  ┌────────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐                    │    │
│  │  │ Anomaly Detection     │ │ Mapping                │ │ Failure Prediction    │                    │    │
│  │  │ (integration failures) │ │ Recommendations        │ │ (proactive alerting)  │                    │    │
│  │  └────────────────────────┘ └────────────────────────┘ └────────────────────────┘                    │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Integration Maturity Model

```
Level 1: AD-HOC (Current MeterVerse)
  Point-to-point integrations, manual mapping, no registry

Level 2: STANDARDIZED — C15 Target
  Integration registry, canonical data model, connector framework
  API lifecycle management, schema registry, DLQ

Level 3: OPTIMIZED (Post-C15)
  AI-driven mapping, auto-remediation, predictive SLA
  Self-service connector marketplace, low-code templates
```

---

## PART 3: DATA MODEL DESIGN

### 3.1 IntegrationRegistry (NEW)

**Purpose:** Catalog of all integrations with metadata, status, and health.

```
IntegrationRegistry
├── id: String (UUID, PK)
├── name: String                          ← "Oracle ERP GL Export"
├── code: String (UNIQUE)                 ← "ERP_ORACLE_GL"
├── type: String                          ← API | EVENT | BATCH | WEBSOCKET | SFTP
├── direction: String                     ← INBOUND | OUTBOUND | BIDIRECTIONAL
├── category: String                      ← ERP | CRM | GIS | SCADA | AMI | PAYMENT | BANK | GOV | NOTIFICATION | IDENTITY | CUSTOM
├── connectorType: String?                ← Reference to connector implementation
├── version: String @default("1.0")
├── status: String @default("ACTIVE")     ← ACTIVE | DEGRADED | FAILED | DEPRECATED | RETIRED
├── endpointUrl: String?
├── authMethod: String?                   ← API_KEY | OAUTH2 | OIDC | MTLS | BASIC
├── authConfigId: String?                 ← FK → SecretsManager
├── slaUptime: Float?                     ← Target 99.9
├── slaMaxLatency: Int?                   ← Max latency in ms
├── slaMaxErrorRate: Float?               ← Max error rate 0.01
├── lastHealthCheckAt: DateTime?
├── lastHealthCheckStatus: String?        ← PASS | WARN | FAIL
├── active: Boolean @default(true)
├── metadata: String (JSON)?              ← Connector-specific config
├── notes: String?
├── createdAt, archivedAt, updatedAt

Indexes:
  @@index([type, category])
  @@index([status, lastHealthCheckAt])
  @@index([code])
```

### 3.2 IntegrationLog (NEW)

**Purpose:** Record every integration transaction for audit, replay, and SLA tracking.

```
IntegrationLog
├── id: String (UUID, PK)
├── registryId: String (FK → IntegrationRegistry)
├── direction: String                     ← INBOUND | OUTBOUND
├── status: String                        ← SUCCESS | FAILED | RETRY | TIMEOUT
├── requestPayload: String (JSON)?
├── responsePayload: String (JSON)?
├── requestHeaders: String (JSON)?
├── responseHeaders: String (JSON)?
├── correlationId: String
├── traceId: String?
├── spanId: String?
├── httpMethod: String?
├── httpPath: String?
├── httpStatus: Int?
├── durationMs: Int
├── errorMessage: String?
├── errorCode: String?
├── retryCount: Int @default(0)
├── attemptedAt: DateTime
├── createdAt

Indexes:
  @@index([registryId, status])
  @@index([registryId, createdAt])
  @@index([correlationId])
  @@index([status, attemptedAt])
```

### 3.3 ConnectorDefinition (NEW)

**Purpose:** Define connector implementations with configuration schema.

```
ConnectorDefinition
├── id: String (UUID, PK)
├── name: String                          ← "Oracle ERP GL Export"
├── code: String (UNIQUE)
├── type: String                          ← REST | SOAP | GRAPHQL | SFTP | JDBC | CUSTOM
├── version: String @default("1.0")
├── configSchema: String (JSON)           ← JSON Schema for connector config
├── authTypes: String (JSON)              ← Supported auth types
├── events: String (JSON)                 ← Events this connector produces/consumes
├── entities: String (JSON)               ← Canonical entities mapped
├── active: Boolean @default(true)
├── createdAt, archivedAt, updatedAt
```

### 3.4 IntegrationMapping (NEW)

**Purpose:** Define field-level mappings between internal and external schemas.

```
IntegrationMapping
├── id: String (UUID, PK)
├── registryId: String (FK → IntegrationRegistry)
├── sourceEntity: String                  ← Internal canonical entity name
├── sourceField: String                   ← Internal field path
├── targetEntity: String                  ← External entity name
├── targetField: String                   ← External field path
├── transformation: String?               ← Optional transformation function reference
├── defaultValue: String?                 ← Default if source is null
├── required: Boolean @default(false)
├── active: Boolean @default(true)
├── createdAt, archivedAt

Index:
  @@index([registryId, sourceEntity, targetEntity])
```

### 3.5 SchemaRegistry (NEW)

**Purpose:** Versioned schema registry for canonical data models and external formats.

```
SchemaRegistry
├── id: String (UUID, PK)
├── name: String                          ← "InvoiceCanonical", "MeterReadingCanonical"
├── entityType: String                    ← INVOICE | PAYMENT | CUSTOMER | METER | READING | EVENT
├── version: String                       ← Semantic version
├── schema: String (JSON)                 ← JSON Schema definition
├── compatibility: String @default("BACKWARD") ← BACKWARD | FORWARD | FULL | NONE
├── status: String @default("ACTIVE")     ← ACTIVE | DEPRECATED | SUPERSEDED
├── previousVersionId: String?            ← FK → self
├── createdAt, archivedAt

Unique: [entityType, version]
```

### 3.6 DeadLetterEntry (NEW)

**Purpose:** Store messages that failed processing after all retries.

```
DeadLetterEntry
├── id: String (UUID, PK)
├── source: String                        ← WEBHOOK | QUEUE | INTEGRATION | EVENT_BUS
├── sourceId: String?                     ← Reference to source record
├── registryId: String? (FK → IntegrationRegistry)
├── eventType: String
├── payload: String (JSON)
├── errorMessage: String
├── errorStack: String?
├── retryCount: Int @default(0)
├── status: String @default("PENDING")    ← PENDING | REPROCESSING | RESOLVED | IGNORED
├── reprocessedAt: DateTime?
├── resolvedAt: DateTime?
├── resolvedBy: String?
├── createdAt, archivedAt

Indexes:
  @@index([status, createdAt])
  @@index([registryId, status])
```

### 3.7 CertificateStore (NEW)

**Purpose:** Manage TLS certificates for mTLS integrations.

```
CertificateStore
├── id: String (UUID, PK)
├── name: String
├── type: String                          ← CA | CLIENT | SERVER
├── issuer: String?
├── subject: String?
├── serialNumber: String?
├── fingerprint: String?
├── notBefore: DateTime
├── notAfter: DateTime
├── active: Boolean @default(true)
├── status: String @default("VALID")      ← VALID | EXPIRING | EXPIRED | REVOKED
├── expiresInDays: Int?                   ← Computed days until expiry
├── autoRenew: Boolean @default(false)
├── renewedFromId: String?                ← FK → self
├── createdAt, archivedAt

Indexes:
  @@index([status, notAfter])
  @@index([type, active])
```

### 3.8 IntegrationSchedule (NEW)

**Purpose:** Schedule batch synchronizations.

```
IntegrationSchedule
├── id: String (UUID, PK)
├── registryId: String (FK → IntegrationRegistry)
├── name: String
├── frequency: String                     ← HOURLY | DAILY | WEEKLY | MONTHLY | CRON
├── cronExpression: String?
├── batchSize: Int @default(1000)
├── maxDuration: Int?                     ← Max runtime in minutes
├── retryOnFailure: Boolean @default(true)
├── active: Boolean @default(true)
├── lastRunAt: DateTime?
├── lastRunStatus: String?               ← SUCCESS | FAILED | RUNNING
├── nextRunAt: DateTime?
├── createdAt, archivedAt
```

### 3.9 New Models Summary

| # | Model | Lines | Purpose |
|---|-------|-------|---------|
| 1 | IntegrationRegistry | ~28 | Catalog of all integrations |
| 2 | IntegrationLog | ~24 | Every integration transaction |
| 3 | ConnectorDefinition | ~16 | Connector implementation metadata |
| 4 | IntegrationMapping | ~14 | Field-level schema mapping |
| 5 | SchemaRegistry | ~14 | Versioned canonical schemas |
| 6 | DeadLetterEntry | ~16 | Failed message storage |
| 7 | CertificateStore | ~18 | TLS certificate management |
| 8 | IntegrationSchedule | ~16 | Batch sync scheduling |
| **Total** | **8 new models** | **~146 lines** | |

**Enhanced existing:** Webhook (add retry config, timeout, rate limit), QueueJob (add DLQ flag, scheduling)

---

## PART 4: CONNECTOR FRAMEWORK

### 4.1 Connector Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     CONNECTOR FRAMEWORK                            │
│                                                                    │
│  BaseConnector (abstract)                                         │
│  ├── initialize(config)                                           │
│  ├── testConnection() → boolean                                   │
│  ├── healthCheck() → { status, latency, message }                │
│  ├── transform(data, mapping) → transformedData                  │
│  ├── send(data) → { success, response, error }                   │
│  ├── receive() → { data, metadata }                              │
│  ├── validateAuth() → boolean                                     │
│  └── close()                                                      │
│                                                                    │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐           │
│  │ RestConnector │ │ SoapConnector │ │ SftpConnector │  ...      │
│  │ (extends Base)│ │ (extends Base)│ │ (extends Base)│           │
│  └───────────────┘ └───────────────┘ └───────────────┘           │
│                                                                    │
│  Specific Connectors (extend base type):                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │
│  │ OracleERP    │ │ SalesforceCRM│ │ ArcGIS       │              │
│  │ GL Connector │ │ Connector    │ │ Connector    │              │
│  └──────────────┘ └──────────────┘ └──────────────┘              │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 Connector Inventory (Planned)

| # | Connector | Type | Direction | Priority | Authentication |
|---|-----------|------|-----------|----------|----------------|
| 1 | **Oracle ERP Cloud** | REST/SOAP | Outbound (GL export) | P0 | OAuth2 / mTLS |
| 2 | **SAP S/4HANA** | RFC/REST | Outbound (FI/CO) | P0 | Basic / mTLS |
| 3 | **Odoo ERP** | REST | Bidirectional | P1 | API Key |
| 4 | **Salesforce CRM** | REST | Bidirectional | P1 | OAuth2 |
| 5 | **HubSpot CRM** | REST | Inbound (leads) | P2 | OAuth2 |
| 6 | **ArcGIS** | REST | Bidirectional | P1 | API Key |
| 7 | **QGIS** | REST | Outbound | P2 | API Key |
| 8 | **OSIsoft PI** | REST | Inbound | P1 | Basic |
| 9 | **Ignition SCADA** | REST/MQTT | Inbound | P1 | mTLS |
| 10 | **AMI/MDM (GridIoT)** | REST/SFTP | Bidirectional | P0 | OAuth2 |
| 11 | **Paymob** | REST | Webhook Inbound | P0 | HMAC |
| 12 | **Fawry** | REST | Webhook Inbound | P0 | HMAC |
| 13 | **Stripe** | REST | Webhook Inbound | P1 | Webhook secret |
| 14 | **NBE Bank** | SFTP/API | Inbound (statements) | P0 | mTLS |
| 15 | **CIB Bank** | SFTP/API | Inbound (statements) | P0 | mTLS |
| 16 | **Tax Authority** | REST/SOAP | Outbound (e-invoice) | P0 | mTLS / OAuth2 |
| 17 | **Government Portal** | REST | Outbound (reports) | P1 | OAuth2 |
| 18 | **Twilio** | REST | Outbound (SMS) | P0 | API Key |
| 19 | **SendGrid** | REST | Outbound (Email) | P0 | API Key |
| 20 | **WhatsApp Business** | REST | Outbound | P1 | API Key |
| 21 | **SharePoint** | REST | Bidirectional | P2 | OAuth2 |
| 22 | **Azure Blob / S3** | REST | Outbound (backup) | P1 | Access Key |
| 23 | **LDAP / AD** | LDAP | Inbound (auth sync) | P1 | Bind credentials |

### 4.3 Canonical Data Model

**Purpose:** Standardized internal entity representations that all connectors map to/from.

```
CORE CANONICAL ENTITIES:

CustomerCanonical:
  { id, externalId[], name, type, email, phone, address,
    taxId, currency, language, status, tags, metadata }

MeterCanonical:
  { id, externalId[], serial, type, utilityType, status,
    location, installationDate, firmware, config, metadata }

ReadingCanonical:
  { id, meterId, timestamp, value, uom, quality, source,
    metadata }

InvoiceCanonical:
  { id, number, customerId, periodStart, periodEnd, issuedAt,
    dueDate, currency, lineItems[{ type, description, quantity,
    unitPrice, amount, taxRate, taxAmount }], subtotal, taxTotal,
    total, status, metadata }

PaymentCanonical:
  { id, invoiceId, customerId, amount, currency, method,
    gatewayReference, gatewayFee, netAmount, paidAt, status,
    metadata }

EventCanonical:
  { id, eventType, source, timestamp, correlationId,
    entityType, entityId, payload, metadata }
```

---

## PART 5: API GOVERNANCE

### 5.1 API Lifecycle

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  DESIGN   │───→│  DEVELOP  │───→│  PUBLISH  │───→│  ACTIVE  │───→│ DEPRECATE│
│ (DRAFT)   │    │ (BETA)    │    │ (STABLE)  │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                                     │
                                                                     ▼
                                                               ┌──────────┐
                                                               │  RETIRED  │
                                                               └──────────┘
```

### 5.2 Versioning Strategy

| Version Scheme | Example | When to Use |
|----------------|---------|-------------|
| **URI Path** | `/api/v1/customers`, `/api/v2/customers` | Breaking changes |
| **Header** | `Accept: application/vnd.meterverse.v2+json` | Internal APIs |
| **Query Param** | `?version=2` | Experimental endpoints |

**Version Policy:**
- Major version (v1→v2): Breaking schema changes
- Minor version (v1.0→v1.1): Additive changes only
- Deprecation notice: Minimum 6 months before retirement
- Sunset header: `Sunset: Sat, 01 Jan 2028 00:00:00 GMT`

### 5.3 Rate Limiting Strategy

| Tier | Rate Limit | Burst | Applied To |
|------|------------|-------|------------|
| **Internal Service** | 10,000 req/min | 15,000 | Backend→backend |
| **External Partner** | 1,000 req/min | 2,000 | API key holders |
| **Customer Portal** | 500 req/min | 1,000 | Authenticated users |
| **Public Anonymous** | 100 req/min | 150 | Unauthenticated |
| **Webhook Outbound** | 100 req/min per target | 200 | Outbound webhooks |

---

## PART 6: EVENT-DRIVEN ARCHITECTURE

### 6.1 Enhanced Event Bus

```
Existing EventBus (in-memory) → Enhanced Persistent EventBus:

┌─────────────────────────────────────────────────────────────────┐
│  ENHANCED EVENT BUS                                               │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  EventBus (existing in-memory, enhanced with persistence)  │   │
│  │                                                           │   │
│  │  emit(event, payload) →                                   │   │
│  │    1. Validate payload against SchemaRegistry             │   │
│  │    2. Add correlationId + traceId + timestamp             │   │
│  │    3. Store to EventLog (DB table) for durability         │   │
│  │    4. Dispatch to local in-memory listeners               │   │
│  │    5. Dispatch to matching IntegrationRegistry entries    │   │
│  │    6. Dispatch to matching Webhooks (via WebhookDispatcher)│   │
│  │    7. If no listener → route to DLQ after TTL             │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Standard Events:                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ meter.reading.received      │ invoice.issued                │ │
│  │ meter.reading.validated     │ invoice.paid                  │ │
│  │ meter.event.raised          │ payment.received              │ │
│  │ meter.assigned              │ payment.reversed              │ │
│  │ meter.deactivated           │ customer.created              │ │
│  │ meter.maintenance.scheduled │ customer.updated              │ │
│  │ connection.status.changed   │ collection.case.created       │ │
│  │ sync.completed              │ collection.case.resolved      │ │
│  │ tariff.changed              │ bank.statement.reconciled     │ │
│  │ tariff.version.activated    │ financial.period.closed       │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Event Catalog

| Event | Publisher | Subscribers (Internal) | Subscribers (External via Webhook) |
|-------|-----------|----------------------|-----------------------------------|
| `meter.reading.received` | Reading Service | Validation, Billing, Analytics | AMI/MDM, Customer Portal |
| `invoice.issued` | Billing | GL (W01), Revenue (W02), Collections (W04), Notifications | ERP, Customer Portal, E-invoice Gov |
| `invoice.paid` | Payment | GL (W01), Collections (W04), Notifications | ERP, Customer Portal |
| `payment.received` | Payment | GL (W01), Notification | ERP, Customer Portal |
| `customer.created` | Customer Service | Notifications | CRM |
| `customer.updated` | Customer Service | — | CRM |
| `meter.assigned` | Meter Service | Billing | AMI/MDM |
| `tariff.changed` | Tariff Service | Revenue (W02), Billing | — |
| `financial.period.closed` | GL | Reporting (W06) | ERP |

---

## PART 7: INTEGRATION OBSERVABILITY

### 7.1 Integration Health Dashboard (`/admin/integrations`)

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│ INTEGRATION HEALTH DASHBOARD                                                                    │
│                                                                                                 │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│ │ Total        │ │ Active       │ │ Degraded     │ │ Failed       │ │ SLA          │          │
│ │ Integrations │ │              │ │              │ │              │ │ Compliance   │          │
│ │         32   │ │        28    │ │         3    │ │         1    │ │      96.3%   │          │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘          │
│                                                                                                 │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ INTEGRATION REGISTRY                                                    [Filter ▼] [Search]│   │
│ │ ┌──────────┬──────────────┬──────────┬──────────┬──────────┬──────────┬──────────────┐   │   │
│ │ │ Code     │ Name         │ Type     │ Status   │ SLA      │ Last OK  │ Actions      │   │   │
│ │ │ ERP_GL   │ Oracle GL    │ OUTBOUND │ ✅ OK    │ 99.9%    │ 2m ago   │ [Logs] [Test]│   │   │
│ │ │ CRM_SYNC │ Salesforce   │ BIDIR    │ ⚠ DEGRAD │ 95.2%    │ 15m ago  │ [Logs] [Test]│   │   │
│ │ │ GOV_EINV │ Tax Auth     │ OUTBOUND │ ✅ OK    │ 99.8%    │ 5m ago   │ [Logs] [Test]│   │   │
│ │ │ BANK_NBE │ NBE Stmts    │ INBOUND  │ ❌ FAIL  │ 88.5%    │ 2h ago   │ [Logs] [Test]│   │   │
│ │ │ AMI_SYNC │ GridIoT MDM  │ BIDIR    │ ✅ OK    │ 99.9%    │ 1m ago   │ [Logs] [Test]│   │   │
│ │ │ PAYMOB   │ Paymob GW    │ INBOUND  │ ✅ OK    │ 100%     │ 30s ago  │ [Logs] [Test]│   │   │
│ │ └──────────┴──────────────┴──────────┴──────────┴──────────┴──────────┴──────────────┘   │   │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                 │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ INTEGRATION ACTIVITY (Last 24 hours)                                                       │   │
│ │                                                                                            │   │
│ │  500 ┤    ██     ██     ██     ██     ██     ██                                            │   │
│ │  400 ┤ ██ ██  ██ ██  ██ ██  ██ ██  ██ ██  ██ ██    ██                                    │   │
│ │  300 ┤ ████████████████████████████████████████████ ██ ██                                 │   │
│ │  200 ┤ ████████████████████████████████████████████████████████                           │   │
│ │      └──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──       │   │
│ │         0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23           │   │
│ │         Success ██  Error ██  Retry ██                                                     │   │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                 │
│ ┌────────────── DLQ ─────────────────────────────────────────────────────────────────────┐    │
│ │ 3 failed messages awaiting reprocessing:                                                    │    │
│ │   • ERP_GL — Invoice INV-2026-0812 — "Timeout connecting to Oracle" — 2 retries — [Reprocess]│
│ │   • BANK_NBE — Statement STMT-0726 — "Invalid format" — 3 retries — [Reprocess]             │    │
│ │   • CRM_SYNC — Customer C-4521 — "Rate limit exceeded" — 1 retry — [Reprocess]             │    │
│ └────────────────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Error Investigation Workbench (`/admin/integrations/logs/:id`)

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│ INTEGRATION LOG DETAIL                                                                          │
│                                                                                                 │
│ Integration: Oracle ERP GL Export (ERP_ORACLE_GL)                                               │
│ Transaction: #ilog-2026-0729-00123                                                              │
│ Timestamp: 2026-07-29 14:32:18.452Z                                                             │
│ Status: ❌ FAILED                                                                               │
│                                                                                                 │
│ ┌── REQUEST ───────────────────────────────────────────────────────────────────────────────┐   │
│ │ POST /api/v2/erp/oracle/gl/journal                                                       │   │
│ │ Headers: { "Authorization": "Bearer ***", "X-Correlation-ID": "corr-abc-123",              │   │
│ │           "Idempotency-Key": "idem-xyz-789" }                                             │   │
│ │ Body: { "journalEntries": [ { "entryNumber": "JE-202607-1234", ... } ] }                 │   │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                 │
│ ┌── RESPONSE ──────────────────────────────────────────────────────────────────────────────┐   │
│ │ HTTP 504 Gateway Timeout                                                                    │   │
│ │ Duration: 30,002 ms (timeout after 30s)                                                    │   │
│ │ Retry #2 of 3                                                                              │   │
│ │ Headers: { "X-Oracle-Request-ID": "req-456" }                                              │   │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                 │
│ ┌── TRACE ─────────────────────────────────────────────────────────────────────────────────┐   │
│ │ Span 1: api-gateway → 2ms                                                                  │   │
│ │ Span 2: integration-runtime → 5ms                                                          │   │
│ │ Span 3: transform-engine → 12ms                                                            │   │
│ │ Span 4: oracle-connector → 29,983ms  ← FAILURE                                            │   │
│ │                                                                                             │   │
│ │ [View Full Trace in Grafana]                                                                │   │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                 │
│ [ Reprocess ] [ Move to DLQ ] [ Ignore ] [ Create Incident ]                                    │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 8: AI INTEGRATION OPERATIONS AGENT

### 8.1 Agent Design

**Agent Name:** Integration Operations Agent  
**Framework:** C12-W07 Operational Intelligence  
**Autonomy:** ⚡ Semi-autonomous  

| Capability | Autonomy | Human Approval |
|------------|----------|----------------|
| Anomaly detection (failure spikes) | ✅ Full | None (alert only) |
| Mapping recommendations | ⚡ Semi | Required for auto-apply |
| Failure prediction | ✅ Full | None (alert only) |
| Integration health scoring | ✅ Full | None (read-only) |

### 8.2 Anomaly Detection

```
ALGORITHM: detectIntegrationAnomalies():
  FOR each active IntegrationRegistry:
    recentLogs = IntegrationLog.findMany({
      registryId, createdAt: { gte: 1 hour ago }
    })
    
    // 1. Error rate spike
    errorRate = count(recentLogs, FAILED) / recentLogs.length
    baselineErrorRate = historicalErrorRate(registryId, 7 days)
    IF errorRate > baselineErrorRate × 3 AND errorRate > 0.05:
      CREATE ExecutiveInsight({
        type: "RISK",
        title: `Error spike: ${registry.name}`,
        description: `Error rate jumped from ${baselineErrorRate} to ${errorRate}`,
        severity: "CRITICAL",
      })
    
    // 2. Latency degradation
    avgLatency = AVG(recentLogs, durationMs)
    baselineLatency = historicalLatency(registryId, 7 days)
    IF avgLatency > baselineLatency × 2:
      CREATE ExecutiveInsight({
        type: "WARNING",
        title: `Latency degradation: ${registry.name}`,
        description: `Avg latency ${avgLatency}ms vs baseline ${baselineLatency}ms`,
      })
    
    // 3. Silence detection
    IF no successful transaction in > SLA window:
      CREATE ExecutiveInsight({
        type: "WARNING",
        title: `Integration silent: ${registry.name}`,
        description: `No successful transactions in ${hours} hours`,
      })
```

### 8.3 Failure Prediction

```
ALGORITHM: predictIntegrationFailures():
  FOR each active IntegrationRegistry:
    recentLogs = IntegrationLog.findMany({
      registryId, createdAt: { gte: 7 days }
    })
    
    // Features:
    features = {
      errorRateTrend: computeTrend(recentLogs, "status = FAILED"),
      latencyTrend: computeTrend(recentLogs, "durationMs"),
      throughputTrend: computeTrend(recentLogs, "count"),
      timeSinceLastCertRenewal: daysSinceCertRenewal(registryId),
      timeSinceLastConfigChange: daysSinceConfigChange(registryId),
    }
    
    riskScore = predictRisk(features)  // 0-100
    
    IF riskScore > 70:
      CREATE ExecutiveInsight({
        type: "RISK",
        title: `Integration at risk: ${registry.name}`,
        description: `Predicted failure risk: ${riskScore}/100`,
        severity: "HIGH",
        recommendation: suggestMitigation(registry, features),
      })
```

---

## PART 9: SECURITY & COMPLIANCE

### 9.1 Authentication Matrix

| Integration Type | Auth Method | Credential Storage | Rotation |
|-----------------|-------------|-------------------|----------|
| Internal API | JWT (C12 Identity) | In-memory | Per session |
| External API — Partner | API Key + HMAC | Vault/Env | 90 days |
| External API — Cloud | OAuth2 / OIDC | Vault | Auto-refresh |
| Bank / Government | mTLS + Certificate | CertificateStore | Auto-renew |
| ERP (Oracle/SAP) | Basic Auth + mTLS | Vault | 90 days |
| Webhook Outbound | HMAC Signature | Per-webhook secret | Manual |
| Webhook Inbound | Signature Verification | Per-webhook secret | Manual |
| SFTP | SSH Key | Vault | 180 days |
| LDAP / AD | Bind Credentials | Vault | 90 days |

### 9.2 Secrets Management Integration

```
┌──────────────────────────────────────────────────────────────────┐
│  SECRETS MANAGEMENT                                                │
│                                                                   │
│  Integration secrets stored via:                                  │
│  1. Environment variables (current — basic)                       │
│  2. HashedCorp Vault / Azure Key Vault (target — enterprise)     │
│  3. Encrypted at rest in DB (CertificateStore)                    │
│                                                                   │
│  Secret types:                                                     │
│  ┌──────────────────┬──────────────┬─────────────────────────────┐│
│  │ Type             │ Storage      │ Access Pattern               ││
│  ├──────────────────┼──────────────┼─────────────────────────────┤│
│  │ API Key          │ Vault → Mem  │ Loaded on connector init    ││
│  │ OAuth2 Token     │ Vault → Mem  │ Auto-refresh on expiry      ││
│  │ mTLS Certificate │ CertStore    │ Auto-renew before expiry    ││
│  │ SSH Key          │ Vault → File │ Written temp, removed after ││
│  │ Database Cred    │ Vault → Mem  │ Loaded on connection init   ││
│  │ Webhook Secret   │ DB (encrypt) │ Loaded per dispatch         ││
│  └──────────────────┴──────────────┴─────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

---

## PART 10: TESTING STRATEGY — C15 (150 Tests)

### 10.1 Integration Registry Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Register new integration → CREATED | Correct status |
| 2 | Health check → PASS | Responds |
| 3 | Health check → FAIL → alerts | Alert created |
| 4 | Deactivate → stops processing | Status change |
| 5 | Duplicate code → rejected | Unique constraint |

### 10.2 Connector Framework Tests (25)

| # | Test | Expect |
|---|------|--------|
| 1 | REST connector → POST succeeds | 200 |
| 2 | REST connector → 4xx → logged | Error logged |
| 3 | REST connector → timeout → retry | Retry count |
| 4 | REST connector → max retries → DLQ | DLQ entry |
| 5 | mTLS connector → valid cert → success | Authenticated |
| 6 | mTLS connector → expired cert → error | Rejected |
| 7 | SFTP connector → file upload → success | Transferred |
| 8 | OAuth2 connector → token refresh → auto | Refreshed |
| 9 | Connector testConnection → valid → true | Connection OK |
| 10 | Connector testConnection → invalid → false | Connection fail |

### 10.3 Schema Registry & Mapping Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Register schema → ACTIVE | Correct status |
| 2 | Backward-compatible update → allowed | Compatibility |
| 3 | Breaking change → rejected | Compatibility |
| 4 | Deprecate schema → warning | Deprecation notice |
| 5 | Transform using mapping → correct output | Mapping correct |
| 6 | Missing required field → error | Validation |
| 7 | Default value applied → correct | Fallback |
| 8 | Unknown source field → skipped gracefully | Graceful |

### 10.4 Webhook & Event Bus Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Emit event → all listeners receive | Delivery |
| 2 | Emit event → webhook dispatched | Webhook |
| 3 | Webhook timeout → retry 3 times | Retry |
| 4 | Webhook fails → DLQ after max retries | DLQ |
| 5 | Webhook HMAC signature → verified | Security |
| 6 | Event with no listeners → stored (persistent) | Durability |
| 7 | Event payload > limit → rejected | Validation |
| 8 | DLQ reprocess → retry delivery | Reprocess |
| 9 | DLQ max retries → PERMANENTLY_FAILED | Terminal |
| 10 | Event correlation → full trace | Tracing |

### 10.5 Rate Limiting & Throttling Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Under rate limit → request succeeds | 200 |
| 2 | At rate limit → request succeeds | 200 |
| 3 | Over rate limit → 429 | Too Many Requests |
| 4 | Burst allowed → succeeds | Burst |
| 5 | Burst exceeded → 429 | Throttled |
| 6 | Reset after window → requests succeed | Window reset |
| 7 | Tier-based limits → correct per tier | Tiered |
| 8 | Rate limit headers returned | Standard headers |

### 10.6 Idempotency Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | First request → processed | Idempotency key stored |
| 2 | Duplicate request (same key) → skipped | Not processed |
| 3 | Duplicate request (same key, different body) → rejected | Conflict |
| 4 | Expired key → new request allowed | TTL expiry |
| 5 | Missing key → normal processing | Pass-through |

### 10.7 ERP/CRM/GIS Connector Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Oracle GL export → invoices transformed correctly | Mapping |
| 2 | Salesforce customer sync → bidirectional | Sync |
| 3 | ArcGIS meter location → coordinate mapped | GIS |
| 4 | OSIsoft PI reading → historian format | SCADA |
| 5 | GridIoT AMI sync → meter data aligned | AMI/MDM |
| 6 | Connector failure → specific error message | Clarity |
| 7 | Connector auth refresh → auto-renewed | Auth |
| 8 | Batch sync 10K records → all transferred | Batch |
| 9 | Sync failure → partial transfer handled | Partial |
| 10 | Schedule → runs at correct time | Cron |

### 10.8 Payment & Banking Connector Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Paymob webhook → payment recorded | Gateway |
| 2 | Fawry webhook → payment recorded | Gateway |
| 3 | Bank statement (MT940) → parsed | Import |
| 4 | Bank statement (CAMT.053) → parsed | Import |
| 5 | Duplicate webhook → idempotent | Idempotency |
| 6 | Invalid webhook signature → rejected | Security |

### 10.9 Integration SLA & Observability Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | SLA within target → PASS | Green |
| 2 | SLA breached → alert | Alert |
| 3 | Integration log → full request/response stored | Logging |
| 4 | Trace spans → parent/child hierarchy | Tracing |
| 5 | DLQ count monitored → correct | Monitoring |

---

## PART 11: C15 DEFINITION OF DONE

```
C15 — ENTERPRISE INTEGRATION PLATFORM
CERTIFICATION CHECKLIST

□ CORE DATA MODELS — 8 NEW
   □ IntegrationRegistry (catalog + health)
   □ IntegrationLog (transaction audit)
   □ ConnectorDefinition (connector metadata)
   □ IntegrationMapping (field-level mapping)
   □ SchemaRegistry (versioned canonical schemas)
   □ DeadLetterEntry (failed message storage)
   □ CertificateStore (TLS management)
   □ IntegrationSchedule (batch sync scheduling)

□ CONNECTOR FRAMEWORK — BASE + 8 IMPLEMENTED
   □ BaseConnector abstract class
   □ RestConnector, SoapConnector, SftpConnector
   □ Oracle ERP GL Connector
   □ Salesforce CRM Connector
   □ ArcGIS Connector
   □ OSIsoft/SCADA Connector
   □ GridIoT AMI/MDM Connector
   □ Paymob + Fawry Payment Connectors
   □ NBE + CIB Bank Statement Connectors
   □ Tax Authority e-Invoice Connector
   □ Twilio/SendGrid/WhatsApp Notification Connectors

□ API GATEWAY GOVERNANCE
   □ API versioning (URI + Header + Query strategies)
   □ API lifecycle (DESIGN→ACTIVE→RETIRED)
   □ Deprecation policy with Sunset headers
   □ Rate limiting (4 tiers)
   □ Throttling with burst support

□ EVENT-DRIVEN ARCHITECTURE
   □ Enhanced EventBus with persistence
   □ Standard event catalog (20+ events)
   □ Webhook dispatcher enhanced (retry config, timeout)
   □ Dead-letter queue with reprocessing
   □ Callback orchestration

□ CANONICAL DATA MODEL
   □ Customer, Meter, Reading, Invoice, Payment, Event
   □ Schema registry with versioning
   □ Compatibility checking (BACKWARD)
   □ Data transformation engine

□ INTEGRATION OBSERVABILITY
   □ Integration Health Dashboard
   □ SLA monitoring (uptime, latency, error rate)
   □ Distributed tracing (spans)
   □ Error investigation workbench
   □ DLQ management with reprocess

□ AI INTEGRATION OPERATIONS AGENT
   □ Anomaly detection (error spikes, latency, silence)
   □ Mapping recommendations
   □ Failure prediction (risk scoring)
   □ C12 AIRecommendation integration

□ SECURITY
   □ Multi-auth support (API Key, OAuth2, mTLS, Basic, JWT)
   □ Certificate lifecycle management
   □ Secrets management integration
   □ Webhook HMAC signing + verification
   □ Idempotency key enforcement
   □ Payload validation against schema

□ TESTS — 150 PASSING
   □ Integration registry: 15 tests
   □ Connector framework: 25 tests
   □ Schema registry: 20 tests
   □ Webhook & event bus: 20 tests
   □ Rate limiting: 15 tests
   □ Idempotency: 10 tests
   □ ERP/CRM/GIS connectors: 20 tests
   □ Payment & banking: 15 tests
   □ SLA & observability: 10 tests

C15 STATUS: □ NOT IMPLEMENTED
All items above are DESIGN-COMPLETE but not executed.
```

---

## APPENDIX A: C15 FILE MANIFEST

| # | File | Action | Lines |
|---|------|--------|-------|
| 1 | `backend/prisma/schema.prisma` | MODIFY | +150 lines (8 new models) |
| 2 | Migration: integration_platform | CREATE | Standard |
| 3 | `backend/src/services/integration-registry.js` | **CREATE** | ~150 lines |
| 4 | `backend/src/services/connector-base.js` | **CREATE** | ~100 lines (base class) |
| 5 | `backend/src/services/connector-rest.js` | **CREATE** | ~80 lines |
| 6 | `backend/src/services/connector-factory.js` | **CREATE** | ~60 lines |
| 7 | `backend/src/services/schema-registry.js` | **CREATE** | ~120 lines |
| 8 | `backend/src/services/transform-engine.js` | **CREATE** | ~150 lines |
| 9 | `backend/src/services/idempotency-engine.js` | **CREATE** | ~80 lines |
| 10 | `backend/src/services/enhanced-event-bus.js` | **CREATE** | ~180 lines |
| 11 | `backend/src/services/connector-erp-oracle.js` | **CREATE** | ~120 lines |
| 12 | `backend/src/services/connector-crm-salesforce.js` | **CREATE** | ~100 lines |
| 13 | `backend/src/services/connector-gis-arcgis.js` | **CREATE** | ~80 lines |
| 14 | `backend/src/services/connector-scada.js` | **CREATE** | ~80 lines |
| 15 | `backend/src/services/connector-ami.js` | **CREATE** | ~100 lines |
| 16 | `backend/src/services/connector-paymob.js` | **CREATE** | ~80 lines |
| 17 | `backend/src/services/connector-bank-mt940.js` | **CREATE** | ~100 lines |
| 18 | `backend/src/services/connector-gov-einvoice.js` | **CREATE** | ~100 lines |
| 19 | `backend/src/services/integration-ai-ops.js` | **CREATE** | ~120 lines |
| 20 | `backend/src/routes/integrations.js` | **CREATE** | ~300 lines |
| 21 | `backend/src/server.js` | MODIFY | +3 lines |
| 22 | `Frontend/src/app/admin/integrations/page.tsx` | **CREATE** | ~300 lines |
| 23 | `Frontend/src/app/admin/integrations/[id]/page.tsx` | **CREATE** | ~200 lines |
| 24 | `Frontend/src/app/admin/integrations/logs/[id]/page.tsx` | **CREATE** | ~200 lines |
| 25 | `Frontend/src/app/admin/integrations/dlq/page.tsx` | **CREATE** | ~150 lines |

**Total estimated new code:** ~3,200 lines
**Total estimated tests:** 150 tests

## APPENDIX B: C15 DEPENDENCY GRAPH

```
C01 EventBus (existing) ──────┐
C12 Identity (auth, audit) ───┤
C13 Financial (GL posting) ───┤
C14 Customer (portal events) ──┤
WebhookDispatcher (exist) ────┤
QueueJob (existing) ──────────┤
correlationMiddleware (exist) ─┤
                                ▼
                     ┌──────────────────────────┐
                     │  C15 INTEGRATION PLATFORM │
                     └──────────────────────────┘
                           │
                           ├──→ Integration Registry
                           ├──→ Connector Framework (base + 15 connectors)
                           ├──→ Schema Registry + CDM
                           ├──→ Enhanced EventBus
                           ├──→ Webhook + DLQ + Idempotency
                           ├──→ Integration Health Dashboard
                           └──→ AI Integration Ops Agent
```

---

*This document is a planning artifact only. No code, no implementation, no database migration.*
*C15 — Enterprise Integration Platform & External Ecosystem Hub. READ ONLY. GOVERNANCE PLANNING ONLY.*
