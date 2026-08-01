<!-- Status Block
====================================================================
Design: [x] Complete | Implementation: [ ] In Progress (Webhook/EventBus exist) | Certification: [ ] Not Certified | Wave: W4 | Commit: dc7983b3
====================================================================
-->

# C15 â€” Enterprise Integration Platform & External Ecosystem Hub
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY â€” GOVERNANCE PLANNING ONLY â€” NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Preceded by:** C01-C10 Connectivity, C12 Identity, C13 Financial, C14 Customer Experience  

---

## PART 1: CURRENT STATE AUDIT

### 1.1 Existing Integration Infrastructure

| Component | Location | Status | Capability |
|-----------|----------|--------|------------|
| **EventBus** (in-memory pub/sub) | `services/event-bus.js` | âœ… Complete | emit/on/off, history, stats, wildcard listeners |
| **Webhook** model | `schema.prisma:435` | âœ… Complete | name, url, events, secret, active, lastTriggeredAt |
| **WebhookDispatcher** | `services/webhook-dispatcher.js` | âœ… Complete | HMAC signing, 3-retry exponential backoff, 512KB limit |
| **QueueJob** model | `schema.prisma:485` | âœ… Complete | type, payload, status, priority, attempts, maxAttempts |
| **ApiKey** model | `schema.prisma:128` | âœ… Complete | name, key, prefix, permissions, expiresAt |
| **correlationMiddleware** | `middleware/errorHandler.js:20` | âœ… Complete | X-Correlation-ID propagation |
| **rate-limit middleware** | Express config | âœ… Complete | 100 req/15min per IP |
| **CORS middleware** | Express config | âœ… Complete | Cross-origin configured |
| **C12 Governance** | Complete | âœ… Full | RBAC, audit, Zero Trust, compliance |
| **GatewayLog** model | `schema.prisma:1480` | âœ… Complete | Webhook delivery logging |

### 1.2 Gap Analysis

| Capability | Current | C15 Target |
|------------|---------|------------|
| **Integration Registry** | âŒ None | Catalog of all integrations with status |
| **API Lifecycle Management** | âŒ None | Version, deprecate, retire |
| **Canonical Data Model** | âŒ None | Standardized event/entity schemas |
| **Data Transformation Engine** | âŒ None | Map between internalâ†”external formats |
| **Connector Framework** | âŒ None | Pluggable connector architecture |
| **ERP Integration** | âŒ None | Oracle, SAP, Odoo connectors |
| **CRM Integration** | âŒ None | Salesforce, HubSpot connectors |
| **GIS Integration** | âŒ None | ArcGIS, QGIS connectors |
| **SCADA Integration** | âŒ None | OSIsoft, Ignition connectors |
| **AMI/MDM Integration** | âŒ None | Meter data management sync |
| **Payment Gateway Abstraction** | One-off stripe | Multi-gateway unified API |
| **Banking/Government Connectors** | âŒ None | e-invoicing, tax authority |
| **Schema Registry** | âŒ None | Versioned event/message schemas |
| **Dead-Letter Queue** | âŒ None | Failed message handling |
| **Secrets/Certificate Management** | Env vars only | Vault/HSM integration |
| **Integration SLA Monitoring** | âŒ None | Uptime, latency, error rate |
| **Distributed Tracing** | Correlation ID only | Full trace spans |
| **AI Integration Ops Agent** | âŒ None | Anomaly, mapping, failure prediction |
| **Low-code Integration Templates** | âŒ None | Pre-built connector blueprints |

---

## PART 2: INTEGRATION PLATFORM ARCHITECTURE

### 2.1 High-Level Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                      ENTERPRISE INTEGRATION PLATFORM & ECOSYSTEM HUB                                            â”‚
â”‚                                                                                                               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  API GATEWAY LAYER                                                                                      â”‚    â”‚
â”‚  â”‚                                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚    â”‚
â”‚  â”‚  â”‚ Internal API   â”‚ â”‚ External API   â”‚ â”‚ API Versioning â”‚ â”‚ API Deprecationâ”‚ â”‚ Rate Limiting &    â”‚   â”‚    â”‚
â”‚  â”‚  â”‚ Catalog        â”‚ â”‚ Catalog        â”‚ â”‚ & Lifecycle    â”‚ â”‚ Policy         â”‚ â”‚ Throttling         â”‚   â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                                         â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  INTEGRATION RUNTIME                                                                                    â”‚    â”‚
â”‚  â”‚                                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚    â”‚
â”‚  â”‚  â”‚ Event Bus (existing)   â”‚ â”‚ Message Queue          â”‚ â”‚ Webhook Dispatcher    â”‚ â”‚ Callback      â”‚    â”‚    â”‚
â”‚  â”‚  â”‚ In-memory â†’ Persistent â”‚ â”‚ (DLQ, retry, priority) â”‚ â”‚ (existing â†’ enhanced) â”‚ â”‚ Orchestrator  â”‚    â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚    â”‚
â”‚  â”‚                                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚    â”‚
â”‚  â”‚  â”‚ Data Transformation   â”‚ â”‚ Schema Registry        â”‚ â”‚ Canonical Data Model   â”‚ â”‚ Idempotency   â”‚    â”‚    â”‚
â”‚  â”‚  â”‚ Engine                 â”‚ â”‚ (versioned schemas)    â”‚ â”‚ (internal â†’ external)  â”‚ â”‚ Engine        â”‚    â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                                         â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  CONNECTOR FRAMEWORK                                                                                   â”‚    â”‚
â”‚  â”‚                                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”  â”‚    â”‚
â”‚  â”‚  â”‚ ERP        â”‚ â”‚ CRM        â”‚ â”‚ GIS        â”‚ â”‚ SCADA      â”‚ â”‚ AMI/MDM    â”‚ â”‚ Payment    â”‚ â”‚ Bank  â”‚  â”‚    â”‚
â”‚  â”‚  â”‚ Oracle/SAP â”‚ â”‚Sales/HubSp â”‚ â”‚ArcGIS/QGIS â”‚ â”‚OSI/Ignitionâ”‚ â”‚ Meter Data â”‚ â”‚ Gateway    â”‚ â”‚       â”‚  â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”˜  â”‚    â”‚
â”‚  â”‚                                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”           â”‚    â”‚
â”‚  â”‚  â”‚ Government â”‚ â”‚ Email/SMS  â”‚ â”‚ Document   â”‚ â”‚ LDAP/AD   â”‚ â”‚ Identity   â”‚ â”‚ Custom     â”‚           â”‚    â”‚
â”‚  â”‚  â”‚ e-Invoice  â”‚ â”‚ /WhatsApp  â”‚ â”‚ Management â”‚ â”‚ Federation â”‚ â”‚ Provider   â”‚ â”‚ Connector  â”‚           â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜           â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                                         â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  OPERATIONS & OBSERVABILITY                                                                             â”‚    â”‚
â”‚  â”‚                                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚    â”‚
â”‚  â”‚  â”‚ Integration    â”‚ â”‚ SLA Monitoring â”‚ â”‚ Distributed    â”‚ â”‚ Error          â”‚ â”‚ Replay &           â”‚   â”‚    â”‚
â”‚  â”‚  â”‚ Health Dashboardâ”‚ â”‚ Uptime/Latency â”‚ â”‚ Tracing (spans)â”‚ â”‚ Investigation  â”‚ â”‚ Reprocessing Engineâ”‚   â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                                                               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  AI INTEGRATION OPERATIONS AGENT                                                                         â”‚    â”‚
â”‚  â”‚                                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                    â”‚    â”‚
â”‚  â”‚  â”‚ Anomaly Detection     â”‚ â”‚ Mapping                â”‚ â”‚ Failure Prediction    â”‚                    â”‚    â”‚
â”‚  â”‚  â”‚ (integration failures) â”‚ â”‚ Recommendations        â”‚ â”‚ (proactive alerting)  â”‚                    â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                    â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Integration Maturity Model

```
Level 1: AD-HOC (Current MeterVerse)
  Point-to-point integrations, manual mapping, no registry

Level 2: STANDARDIZED â€” C15 Target
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
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ name: String                          â† "Oracle ERP GL Export"
â”œâ”€â”€ code: String (UNIQUE)                 â† "ERP_ORACLE_GL"
â”œâ”€â”€ type: String                          â† API | EVENT | BATCH | WEBSOCKET | SFTP
â”œâ”€â”€ direction: String                     â† INBOUND | OUTBOUND | BIDIRECTIONAL
â”œâ”€â”€ category: String                      â† ERP | CRM | GIS | SCADA | AMI | PAYMENT | BANK | GOV | NOTIFICATION | IDENTITY | CUSTOM
â”œâ”€â”€ connectorType: String?                â† Reference to connector implementation
â”œâ”€â”€ version: String @default("1.0")
â”œâ”€â”€ status: String @default("ACTIVE")     â† ACTIVE | DEGRADED | FAILED | DEPRECATED | RETIRED
â”œâ”€â”€ endpointUrl: String?
â”œâ”€â”€ authMethod: String?                   â† API_KEY | OAUTH2 | OIDC | MTLS | BASIC
â”œâ”€â”€ authConfigId: String?                 â† FK â†’ SecretsManager
â”œâ”€â”€ slaUptime: Float?                     â† Target 99.9
â”œâ”€â”€ slaMaxLatency: Int?                   â† Max latency in ms
â”œâ”€â”€ slaMaxErrorRate: Float?               â† Max error rate 0.01
â”œâ”€â”€ lastHealthCheckAt: DateTime?
â”œâ”€â”€ lastHealthCheckStatus: String?        â† PASS | WARN | FAIL
â”œâ”€â”€ active: Boolean @default(true)
â”œâ”€â”€ metadata: String (JSON)?              â† Connector-specific config
â”œâ”€â”€ notes: String?
â”œâ”€â”€ createdAt, archivedAt, updatedAt

Indexes:
  @@index([type, category])
  @@index([status, lastHealthCheckAt])
  @@index([code])
```

### 3.2 IntegrationLog (NEW)

**Purpose:** Record every integration transaction for audit, replay, and SLA tracking.

```
IntegrationLog
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ registryId: String (FK â†’ IntegrationRegistry)
â”œâ”€â”€ direction: String                     â† INBOUND | OUTBOUND
â”œâ”€â”€ status: String                        â† SUCCESS | FAILED | RETRY | TIMEOUT
â”œâ”€â”€ requestPayload: String (JSON)?
â”œâ”€â”€ responsePayload: String (JSON)?
â”œâ”€â”€ requestHeaders: String (JSON)?
â”œâ”€â”€ responseHeaders: String (JSON)?
â”œâ”€â”€ correlationId: String
â”œâ”€â”€ traceId: String?
â”œâ”€â”€ spanId: String?
â”œâ”€â”€ httpMethod: String?
â”œâ”€â”€ httpPath: String?
â”œâ”€â”€ httpStatus: Int?
â”œâ”€â”€ durationMs: Int
â”œâ”€â”€ errorMessage: String?
â”œâ”€â”€ errorCode: String?
â”œâ”€â”€ retryCount: Int @default(0)
â”œâ”€â”€ attemptedAt: DateTime
â”œâ”€â”€ createdAt

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
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ name: String                          â† "Oracle ERP GL Export"
â”œâ”€â”€ code: String (UNIQUE)
â”œâ”€â”€ type: String                          â† REST | SOAP | GRAPHQL | SFTP | JDBC | CUSTOM
â”œâ”€â”€ version: String @default("1.0")
â”œâ”€â”€ configSchema: String (JSON)           â† JSON Schema for connector config
â”œâ”€â”€ authTypes: String (JSON)              â† Supported auth types
â”œâ”€â”€ events: String (JSON)                 â† Events this connector produces/consumes
â”œâ”€â”€ entities: String (JSON)               â† Canonical entities mapped
â”œâ”€â”€ active: Boolean @default(true)
â”œâ”€â”€ createdAt, archivedAt, updatedAt
```

### 3.4 IntegrationMapping (NEW)

**Purpose:** Define field-level mappings between internal and external schemas.

```
IntegrationMapping
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ registryId: String (FK â†’ IntegrationRegistry)
â”œâ”€â”€ sourceEntity: String                  â† Internal canonical entity name
â”œâ”€â”€ sourceField: String                   â† Internal field path
â”œâ”€â”€ targetEntity: String                  â† External entity name
â”œâ”€â”€ targetField: String                   â† External field path
â”œâ”€â”€ transformation: String?               â† Optional transformation function reference
â”œâ”€â”€ defaultValue: String?                 â† Default if source is null
â”œâ”€â”€ required: Boolean @default(false)
â”œâ”€â”€ active: Boolean @default(true)
â”œâ”€â”€ createdAt, archivedAt

Index:
  @@index([registryId, sourceEntity, targetEntity])
```

### 3.5 SchemaRegistry (NEW)

**Purpose:** Versioned schema registry for canonical data models and external formats.

```
SchemaRegistry
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ name: String                          â† "InvoiceCanonical", "MeterReadingCanonical"
â”œâ”€â”€ entityType: String                    â† INVOICE | PAYMENT | CUSTOMER | METER | READING | EVENT
â”œâ”€â”€ version: String                       â† Semantic version
â”œâ”€â”€ schema: String (JSON)                 â† JSON Schema definition
â”œâ”€â”€ compatibility: String @default("BACKWARD") â† BACKWARD | FORWARD | FULL | NONE
â”œâ”€â”€ status: String @default("ACTIVE")     â† ACTIVE | DEPRECATED | SUPERSEDED
â”œâ”€â”€ previousVersionId: String?            â† FK â†’ self
â”œâ”€â”€ createdAt, archivedAt

Unique: [entityType, version]
```

### 3.6 DeadLetterEntry (NEW)

**Purpose:** Store messages that failed processing after all retries.

```
DeadLetterEntry
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ source: String                        â† WEBHOOK | QUEUE | INTEGRATION | EVENT_BUS
â”œâ”€â”€ sourceId: String?                     â† Reference to source record
â”œâ”€â”€ registryId: String? (FK â†’ IntegrationRegistry)
â”œâ”€â”€ eventType: String
â”œâ”€â”€ payload: String (JSON)
â”œâ”€â”€ errorMessage: String
â”œâ”€â”€ errorStack: String?
â”œâ”€â”€ retryCount: Int @default(0)
â”œâ”€â”€ status: String @default("PENDING")    â† PENDING | REPROCESSING | RESOLVED | IGNORED
â”œâ”€â”€ reprocessedAt: DateTime?
â”œâ”€â”€ resolvedAt: DateTime?
â”œâ”€â”€ resolvedBy: String?
â”œâ”€â”€ createdAt, archivedAt

Indexes:
  @@index([status, createdAt])
  @@index([registryId, status])
```

### 3.7 CertificateStore (NEW)

**Purpose:** Manage TLS certificates for mTLS integrations.

```
CertificateStore
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ name: String
â”œâ”€â”€ type: String                          â† CA | CLIENT | SERVER
â”œâ”€â”€ issuer: String?
â”œâ”€â”€ subject: String?
â”œâ”€â”€ serialNumber: String?
â”œâ”€â”€ fingerprint: String?
â”œâ”€â”€ notBefore: DateTime
â”œâ”€â”€ notAfter: DateTime
â”œâ”€â”€ active: Boolean @default(true)
â”œâ”€â”€ status: String @default("VALID")      â† VALID | EXPIRING | EXPIRED | REVOKED
â”œâ”€â”€ expiresInDays: Int?                   â† Computed days until expiry
â”œâ”€â”€ autoRenew: Boolean @default(false)
â”œâ”€â”€ renewedFromId: String?                â† FK â†’ self
â”œâ”€â”€ createdAt, archivedAt

Indexes:
  @@index([status, notAfter])
  @@index([type, active])
```

### 3.8 IntegrationSchedule (NEW)

**Purpose:** Schedule batch synchronizations.

```
IntegrationSchedule
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ registryId: String (FK â†’ IntegrationRegistry)
â”œâ”€â”€ name: String
â”œâ”€â”€ frequency: String                     â† HOURLY | DAILY | WEEKLY | MONTHLY | CRON
â”œâ”€â”€ cronExpression: String?
â”œâ”€â”€ batchSize: Int @default(1000)
â”œâ”€â”€ maxDuration: Int?                     â† Max runtime in minutes
â”œâ”€â”€ retryOnFailure: Boolean @default(true)
â”œâ”€â”€ active: Boolean @default(true)
â”œâ”€â”€ lastRunAt: DateTime?
â”œâ”€â”€ lastRunStatus: String?               â† SUCCESS | FAILED | RUNNING
â”œâ”€â”€ nextRunAt: DateTime?
â”œâ”€â”€ createdAt, archivedAt
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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                     CONNECTOR FRAMEWORK                            â”‚
â”‚                                                                    â”‚
â”‚  BaseConnector (abstract)                                         â”‚
â”‚  â”œâ”€â”€ initialize(config)                                           â”‚
â”‚  â”œâ”€â”€ testConnection() â†’ boolean                                   â”‚
â”‚  â”œâ”€â”€ healthCheck() â†’ { status, latency, message }                â”‚
â”‚  â”œâ”€â”€ transform(data, mapping) â†’ transformedData                  â”‚
â”‚  â”œâ”€â”€ send(data) â†’ { success, response, error }                   â”‚
â”‚  â”œâ”€â”€ receive() â†’ { data, metadata }                              â”‚
â”‚  â”œâ”€â”€ validateAuth() â†’ boolean                                     â”‚
â”‚  â””â”€â”€ close()                                                      â”‚
â”‚                                                                    â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”           â”‚
â”‚  â”‚ RestConnector â”‚ â”‚ SoapConnector â”‚ â”‚ SftpConnector â”‚  ...      â”‚
â”‚  â”‚ (extends Base)â”‚ â”‚ (extends Base)â”‚ â”‚ (extends Base)â”‚           â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜           â”‚
â”‚                                                                    â”‚
â”‚  Specific Connectors (extend base type):                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”              â”‚
â”‚  â”‚ OracleERP    â”‚ â”‚ SalesforceCRMâ”‚ â”‚ ArcGIS       â”‚              â”‚
â”‚  â”‚ GL Connector â”‚ â”‚ Connector    â”‚ â”‚ Connector    â”‚              â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  DESIGN   â”‚â”€â”€â”€â†’â”‚  DEVELOP  â”‚â”€â”€â”€â†’â”‚  PUBLISH  â”‚â”€â”€â”€â†’â”‚  ACTIVE  â”‚â”€â”€â”€â†’â”‚ DEPRECATEâ”‚
â”‚ (DRAFT)   â”‚    â”‚ (BETA)    â”‚    â”‚ (STABLE)  â”‚    â”‚          â”‚    â”‚          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜
                                                                     â”‚
                                                                     â–¼
                                                               â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                                                               â”‚  RETIRED  â”‚
                                                               â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 5.2 Versioning Strategy

| Version Scheme | Example | When to Use |
|----------------|---------|-------------|
| **URI Path** | `/api/v1/customers`, `/api/v2/customers` | Breaking changes |
| **Header** | `Accept: application/vnd.meterverse.v2+json` | Internal APIs |
| **Query Param** | `?version=2` | Experimental endpoints |

**Version Policy:**
- Major version (v1â†’v2): Breaking schema changes
- Minor version (v1.0â†’v1.1): Additive changes only
- Deprecation notice: Minimum 6 months before retirement
- Sunset header: `Sunset: Sat, 01 Jan 2028 00:00:00 GMT`

### 5.3 Rate Limiting Strategy

| Tier | Rate Limit | Burst | Applied To |
|------|------------|-------|------------|
| **Internal Service** | 10,000 req/min | 15,000 | Backendâ†’backend |
| **External Partner** | 1,000 req/min | 2,000 | API key holders |
| **Customer Portal** | 500 req/min | 1,000 | Authenticated users |
| **Public Anonymous** | 100 req/min | 150 | Unauthenticated |
| **Webhook Outbound** | 100 req/min per target | 200 | Outbound webhooks |

---

## PART 6: EVENT-DRIVEN ARCHITECTURE

### 6.1 Enhanced Event Bus

```
Existing EventBus (in-memory) â†’ Enhanced Persistent EventBus:

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ENHANCED EVENT BUS                                               â”‚
â”‚                                                                   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  EventBus (existing in-memory, enhanced with persistence)  â”‚   â”‚
â”‚  â”‚                                                           â”‚   â”‚
â”‚  â”‚  emit(event, payload) â†’                                   â”‚   â”‚
â”‚  â”‚    1. Validate payload against SchemaRegistry             â”‚   â”‚
â”‚  â”‚    2. Add correlationId + traceId + timestamp             â”‚   â”‚
â”‚  â”‚    3. Store to EventLog (DB table) for durability         â”‚   â”‚
â”‚  â”‚    4. Dispatch to local in-memory listeners               â”‚   â”‚
â”‚  â”‚    5. Dispatch to matching IntegrationRegistry entries    â”‚   â”‚
â”‚  â”‚    6. Dispatch to matching Webhooks (via WebhookDispatcher)â”‚   â”‚
â”‚  â”‚    7. If no listener â†’ route to DLQ after TTL             â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                   â”‚
â”‚  Standard Events:                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚ meter.reading.received      â”‚ invoice.issued                â”‚ â”‚
â”‚  â”‚ meter.reading.validated     â”‚ invoice.paid                  â”‚ â”‚
â”‚  â”‚ meter.event.raised          â”‚ payment.received              â”‚ â”‚
â”‚  â”‚ meter.assigned              â”‚ payment.reversed              â”‚ â”‚
â”‚  â”‚ meter.deactivated           â”‚ customer.created              â”‚ â”‚
â”‚  â”‚ meter.maintenance.scheduled â”‚ customer.updated              â”‚ â”‚
â”‚  â”‚ connection.status.changed   â”‚ collection.case.created       â”‚ â”‚
â”‚  â”‚ sync.completed              â”‚ collection.case.resolved      â”‚ â”‚
â”‚  â”‚ tariff.changed              â”‚ bank.statement.reconciled     â”‚ â”‚
â”‚  â”‚ tariff.version.activated    â”‚ financial.period.closed       â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 6.2 Event Catalog

| Event | Publisher | Subscribers (Internal) | Subscribers (External via Webhook) |
|-------|-----------|----------------------|-----------------------------------|
| `meter.reading.received` | Reading Service | Validation, Billing, Analytics | AMI/MDM, Customer Portal |
| `invoice.issued` | Billing | GL (W01), Revenue (W02), Collections (W04), Notifications | ERP, Customer Portal, E-invoice Gov |
| `invoice.paid` | Payment | GL (W01), Collections (W04), Notifications | ERP, Customer Portal |
| `payment.received` | Payment | GL (W01), Notification | ERP, Customer Portal |
| `customer.created` | Customer Service | Notifications | CRM |
| `customer.updated` | Customer Service | â€” | CRM |
| `meter.assigned` | Meter Service | Billing | AMI/MDM |
| `tariff.changed` | Tariff Service | Revenue (W02), Billing | â€” |
| `financial.period.closed` | GL | Reporting (W06) | ERP |

---

## PART 7: INTEGRATION OBSERVABILITY

### 7.1 Integration Health Dashboard (`/admin/integrations`)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ INTEGRATION HEALTH DASHBOARD                                                                    â”‚
â”‚                                                                                                 â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”          â”‚
â”‚ â”‚ Total        â”‚ â”‚ Active       â”‚ â”‚ Degraded     â”‚ â”‚ Failed       â”‚ â”‚ SLA          â”‚          â”‚
â”‚ â”‚ Integrations â”‚ â”‚              â”‚ â”‚              â”‚ â”‚              â”‚ â”‚ Compliance   â”‚          â”‚
â”‚ â”‚         32   â”‚ â”‚        28    â”‚ â”‚         3    â”‚ â”‚         1    â”‚ â”‚      96.3%   â”‚          â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜          â”‚
â”‚                                                                                                 â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚ â”‚ INTEGRATION REGISTRY                                                    [Filter â–¼] [Search]â”‚   â”‚
â”‚ â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚   â”‚
â”‚ â”‚ â”‚ Code     â”‚ Name         â”‚ Type     â”‚ Status   â”‚ SLA      â”‚ Last OK  â”‚ Actions      â”‚   â”‚   â”‚
â”‚ â”‚ â”‚ ERP_GL   â”‚ Oracle GL    â”‚ OUTBOUND â”‚ âœ… OK    â”‚ 99.9%    â”‚ 2m ago   â”‚ [Logs] [Test]â”‚   â”‚   â”‚
â”‚ â”‚ â”‚ CRM_SYNC â”‚ Salesforce   â”‚ BIDIR    â”‚ âš  DEGRAD â”‚ 95.2%    â”‚ 15m ago  â”‚ [Logs] [Test]â”‚   â”‚   â”‚
â”‚ â”‚ â”‚ GOV_EINV â”‚ Tax Auth     â”‚ OUTBOUND â”‚ âœ… OK    â”‚ 99.8%    â”‚ 5m ago   â”‚ [Logs] [Test]â”‚   â”‚   â”‚
â”‚ â”‚ â”‚ BANK_NBE â”‚ NBE Stmts    â”‚ INBOUND  â”‚ âŒ FAIL  â”‚ 88.5%    â”‚ 2h ago   â”‚ [Logs] [Test]â”‚   â”‚   â”‚
â”‚ â”‚ â”‚ AMI_SYNC â”‚ GridIoT MDM  â”‚ BIDIR    â”‚ âœ… OK    â”‚ 99.9%    â”‚ 1m ago   â”‚ [Logs] [Test]â”‚   â”‚   â”‚
â”‚ â”‚ â”‚ PAYMOB   â”‚ Paymob GW    â”‚ INBOUND  â”‚ âœ… OK    â”‚ 100%     â”‚ 30s ago  â”‚ [Logs] [Test]â”‚   â”‚   â”‚
â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                                                 â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚ â”‚ INTEGRATION ACTIVITY (Last 24 hours)                                                       â”‚   â”‚
â”‚ â”‚                                                                                            â”‚   â”‚
â”‚ â”‚  500 â”¤    â–ˆâ–ˆ     â–ˆâ–ˆ     â–ˆâ–ˆ     â–ˆâ–ˆ     â–ˆâ–ˆ     â–ˆâ–ˆ                                            â”‚   â”‚
â”‚ â”‚  400 â”¤ â–ˆâ–ˆ â–ˆâ–ˆ  â–ˆâ–ˆ â–ˆâ–ˆ  â–ˆâ–ˆ â–ˆâ–ˆ  â–ˆâ–ˆ â–ˆâ–ˆ  â–ˆâ–ˆ â–ˆâ–ˆ  â–ˆâ–ˆ â–ˆâ–ˆ    â–ˆâ–ˆ                                    â”‚   â”‚
â”‚ â”‚  300 â”¤ â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ                                 â”‚   â”‚
â”‚ â”‚  200 â”¤ â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ                           â”‚   â”‚
â”‚ â”‚      â””â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€â”¬â”€â”€       â”‚   â”‚
â”‚ â”‚         0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23           â”‚   â”‚
â”‚ â”‚         Success â–ˆâ–ˆ  Error â–ˆâ–ˆ  Retry â–ˆâ–ˆ                                                     â”‚   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                                                 â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ DLQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚ â”‚ 3 failed messages awaiting reprocessing:                                                    â”‚    â”‚
â”‚ â”‚   â€¢ ERP_GL â€” Invoice INV-2026-0812 â€” "Timeout connecting to Oracle" â€” 2 retries â€” [Reprocess]â”‚
â”‚ â”‚   â€¢ BANK_NBE â€” Statement STMT-0726 â€” "Invalid format" â€” 3 retries â€” [Reprocess]             â”‚    â”‚
â”‚ â”‚   â€¢ CRM_SYNC â€” Customer C-4521 â€” "Rate limit exceeded" â€” 1 retry â€” [Reprocess]             â”‚    â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 7.2 Error Investigation Workbench (`/admin/integrations/logs/:id`)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ INTEGRATION LOG DETAIL                                                                          â”‚
â”‚                                                                                                 â”‚
â”‚ Integration: Oracle ERP GL Export (ERP_ORACLE_GL)                                               â”‚
â”‚ Transaction: #ilog-2026-0729-00123                                                              â”‚
â”‚ Timestamp: 2026-07-29 14:32:18.452Z                                                             â”‚
â”‚ Status: âŒ FAILED                                                                               â”‚
â”‚                                                                                                 â”‚
â”‚ â”Œâ”€â”€ REQUEST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚ â”‚ POST /api/v2/erp/oracle/gl/journal                                                       â”‚   â”‚
â”‚ â”‚ Headers: { "Authorization": "Bearer ***", "X-Correlation-ID": "corr-abc-123",              â”‚   â”‚
â”‚ â”‚           "Idempotency-Key": "idem-xyz-789" }                                             â”‚   â”‚
â”‚ â”‚ Body: { "journalEntries": [ { "entryNumber": "JE-202607-1234", ... } ] }                 â”‚   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                                                 â”‚
â”‚ â”Œâ”€â”€ RESPONSE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚ â”‚ HTTP 504 Gateway Timeout                                                                    â”‚   â”‚
â”‚ â”‚ Duration: 30,002 ms (timeout after 30s)                                                    â”‚   â”‚
â”‚ â”‚ Retry #2 of 3                                                                              â”‚   â”‚
â”‚ â”‚ Headers: { "X-Oracle-Request-ID": "req-456" }                                              â”‚   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                                                 â”‚
â”‚ â”Œâ”€â”€ TRACE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚ â”‚ Span 1: api-gateway â†’ 2ms                                                                  â”‚   â”‚
â”‚ â”‚ Span 2: integration-runtime â†’ 5ms                                                          â”‚   â”‚
â”‚ â”‚ Span 3: transform-engine â†’ 12ms                                                            â”‚   â”‚
â”‚ â”‚ Span 4: oracle-connector â†’ 29,983ms  â† FAILURE                                            â”‚   â”‚
â”‚ â”‚                                                                                             â”‚   â”‚
â”‚ â”‚ [View Full Trace in Grafana]                                                                â”‚   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                                                 â”‚
â”‚ [ Reprocess ] [ Move to DLQ ] [ Ignore ] [ Create Incident ]                                    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## PART 8: AI INTEGRATION OPERATIONS AGENT

### 8.1 Agent Design

**Agent Name:** Integration Operations Agent  
**Framework:** C12-W07 Operational Intelligence  
**Autonomy:** âš¡ Semi-autonomous  

| Capability | Autonomy | Human Approval |
|------------|----------|----------------|
| Anomaly detection (failure spikes) | âœ… Full | None (alert only) |
| Mapping recommendations | âš¡ Semi | Required for auto-apply |
| Failure prediction | âœ… Full | None (alert only) |
| Integration health scoring | âœ… Full | None (read-only) |

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
    IF errorRate > baselineErrorRate Ã— 3 AND errorRate > 0.05:
      CREATE ExecutiveInsight({
        type: "RISK",
        title: `Error spike: ${registry.name}`,
        description: `Error rate jumped from ${baselineErrorRate} to ${errorRate}`,
        severity: "CRITICAL",
      })
    
    // 2. Latency degradation
    avgLatency = AVG(recentLogs, durationMs)
    baselineLatency = historicalLatency(registryId, 7 days)
    IF avgLatency > baselineLatency Ã— 2:
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
| External API â€” Partner | API Key + HMAC | Vault/Env | 90 days |
| External API â€” Cloud | OAuth2 / OIDC | Vault | Auto-refresh |
| Bank / Government | mTLS + Certificate | CertificateStore | Auto-renew |
| ERP (Oracle/SAP) | Basic Auth + mTLS | Vault | 90 days |
| Webhook Outbound | HMAC Signature | Per-webhook secret | Manual |
| Webhook Inbound | Signature Verification | Per-webhook secret | Manual |
| SFTP | SSH Key | Vault | 180 days |
| LDAP / AD | Bind Credentials | Vault | 90 days |

### 9.2 Secrets Management Integration

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  SECRETS MANAGEMENT                                                â”‚
â”‚                                                                   â”‚
â”‚  Integration secrets stored via:                                  â”‚
â”‚  1. Environment variables (current â€” basic)                       â”‚
â”‚  2. HashedCorp Vault / Azure Key Vault (target â€” enterprise)     â”‚
â”‚  3. Encrypted at rest in DB (CertificateStore)                    â”‚
â”‚                                                                   â”‚
â”‚  Secret types:                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚ Type             â”‚ Storage      â”‚ Access Pattern               â”‚â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤â”‚
â”‚  â”‚ API Key          â”‚ Vault â†’ Mem  â”‚ Loaded on connector init    â”‚â”‚
â”‚  â”‚ OAuth2 Token     â”‚ Vault â†’ Mem  â”‚ Auto-refresh on expiry      â”‚â”‚
â”‚  â”‚ mTLS Certificate â”‚ CertStore    â”‚ Auto-renew before expiry    â”‚â”‚
â”‚  â”‚ SSH Key          â”‚ Vault â†’ File â”‚ Written temp, removed after â”‚â”‚
â”‚  â”‚ Database Cred    â”‚ Vault â†’ Mem  â”‚ Loaded on connection init   â”‚â”‚
â”‚  â”‚ Webhook Secret   â”‚ DB (encrypt) â”‚ Loaded per dispatch         â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## PART 10: TESTING STRATEGY â€” C15 (150 Tests)

### 10.1 Integration Registry Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Register new integration â†’ CREATED | Correct status |
| 2 | Health check â†’ PASS | Responds |
| 3 | Health check â†’ FAIL â†’ alerts | Alert created |
| 4 | Deactivate â†’ stops processing | Status change |
| 5 | Duplicate code â†’ rejected | Unique constraint |

### 10.2 Connector Framework Tests (25)

| # | Test | Expect |
|---|------|--------|
| 1 | REST connector â†’ POST succeeds | 200 |
| 2 | REST connector â†’ 4xx â†’ logged | Error logged |
| 3 | REST connector â†’ timeout â†’ retry | Retry count |
| 4 | REST connector â†’ max retries â†’ DLQ | DLQ entry |
| 5 | mTLS connector â†’ valid cert â†’ success | Authenticated |
| 6 | mTLS connector â†’ expired cert â†’ error | Rejected |
| 7 | SFTP connector â†’ file upload â†’ success | Transferred |
| 8 | OAuth2 connector â†’ token refresh â†’ auto | Refreshed |
| 9 | Connector testConnection â†’ valid â†’ true | Connection OK |
| 10 | Connector testConnection â†’ invalid â†’ false | Connection fail |

### 10.3 Schema Registry & Mapping Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Register schema â†’ ACTIVE | Correct status |
| 2 | Backward-compatible update â†’ allowed | Compatibility |
| 3 | Breaking change â†’ rejected | Compatibility |
| 4 | Deprecate schema â†’ warning | Deprecation notice |
| 5 | Transform using mapping â†’ correct output | Mapping correct |
| 6 | Missing required field â†’ error | Validation |
| 7 | Default value applied â†’ correct | Fallback |
| 8 | Unknown source field â†’ skipped gracefully | Graceful |

### 10.4 Webhook & Event Bus Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Emit event â†’ all listeners receive | Delivery |
| 2 | Emit event â†’ webhook dispatched | Webhook |
| 3 | Webhook timeout â†’ retry 3 times | Retry |
| 4 | Webhook fails â†’ DLQ after max retries | DLQ |
| 5 | Webhook HMAC signature â†’ verified | Security |
| 6 | Event with no listeners â†’ stored (persistent) | Durability |
| 7 | Event payload > limit â†’ rejected | Validation |
| 8 | DLQ reprocess â†’ retry delivery | Reprocess |
| 9 | DLQ max retries â†’ PERMANENTLY_FAILED | Terminal |
| 10 | Event correlation â†’ full trace | Tracing |

### 10.5 Rate Limiting & Throttling Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Under rate limit â†’ request succeeds | 200 |
| 2 | At rate limit â†’ request succeeds | 200 |
| 3 | Over rate limit â†’ 429 | Too Many Requests |
| 4 | Burst allowed â†’ succeeds | Burst |
| 5 | Burst exceeded â†’ 429 | Throttled |
| 6 | Reset after window â†’ requests succeed | Window reset |
| 7 | Tier-based limits â†’ correct per tier | Tiered |
| 8 | Rate limit headers returned | Standard headers |

### 10.6 Idempotency Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | First request â†’ processed | Idempotency key stored |
| 2 | Duplicate request (same key) â†’ skipped | Not processed |
| 3 | Duplicate request (same key, different body) â†’ rejected | Conflict |
| 4 | Expired key â†’ new request allowed | TTL expiry |
| 5 | Missing key â†’ normal processing | Pass-through |

### 10.7 ERP/CRM/GIS Connector Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Oracle GL export â†’ invoices transformed correctly | Mapping |
| 2 | Salesforce customer sync â†’ bidirectional | Sync |
| 3 | ArcGIS meter location â†’ coordinate mapped | GIS |
| 4 | OSIsoft PI reading â†’ historian format | SCADA |
| 5 | GridIoT AMI sync â†’ meter data aligned | AMI/MDM |
| 6 | Connector failure â†’ specific error message | Clarity |
| 7 | Connector auth refresh â†’ auto-renewed | Auth |
| 8 | Batch sync 10K records â†’ all transferred | Batch |
| 9 | Sync failure â†’ partial transfer handled | Partial |
| 10 | Schedule â†’ runs at correct time | Cron |

### 10.8 Payment & Banking Connector Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Paymob webhook â†’ payment recorded | Gateway |
| 2 | Fawry webhook â†’ payment recorded | Gateway |
| 3 | Bank statement (MT940) â†’ parsed | Import |
| 4 | Bank statement (CAMT.053) â†’ parsed | Import |
| 5 | Duplicate webhook â†’ idempotent | Idempotency |
| 6 | Invalid webhook signature â†’ rejected | Security |

### 10.9 Integration SLA & Observability Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | SLA within target â†’ PASS | Green |
| 2 | SLA breached â†’ alert | Alert |
| 3 | Integration log â†’ full request/response stored | Logging |
| 4 | Trace spans â†’ parent/child hierarchy | Tracing |
| 5 | DLQ count monitored â†’ correct | Monitoring |

---

## PART 11: C15 DEFINITION OF DONE

```
C15 â€” ENTERPRISE INTEGRATION PLATFORM
CERTIFICATION CHECKLIST

â–¡ CORE DATA MODELS â€” 8 NEW
   â–¡ IntegrationRegistry (catalog + health)
   â–¡ IntegrationLog (transaction audit)
   â–¡ ConnectorDefinition (connector metadata)
   â–¡ IntegrationMapping (field-level mapping)
   â–¡ SchemaRegistry (versioned canonical schemas)
   â–¡ DeadLetterEntry (failed message storage)
   â–¡ CertificateStore (TLS management)
   â–¡ IntegrationSchedule (batch sync scheduling)

â–¡ CONNECTOR FRAMEWORK â€” BASE + 8 IMPLEMENTED
   â–¡ BaseConnector abstract class
   â–¡ RestConnector, SoapConnector, SftpConnector
   â–¡ Oracle ERP GL Connector
   â–¡ Salesforce CRM Connector
   â–¡ ArcGIS Connector
   â–¡ OSIsoft/SCADA Connector
   â–¡ GridIoT AMI/MDM Connector
   â–¡ Paymob + Fawry Payment Connectors
   â–¡ NBE + CIB Bank Statement Connectors
   â–¡ Tax Authority e-Invoice Connector
   â–¡ Twilio/SendGrid/WhatsApp Notification Connectors

â–¡ API GATEWAY GOVERNANCE
   â–¡ API versioning (URI + Header + Query strategies)
   â–¡ API lifecycle (DESIGNâ†’ACTIVEâ†’RETIRED)
   â–¡ Deprecation policy with Sunset headers
   â–¡ Rate limiting (4 tiers)
   â–¡ Throttling with burst support

â–¡ EVENT-DRIVEN ARCHITECTURE
   â–¡ Enhanced EventBus with persistence
   â–¡ Standard event catalog (20+ events)
   â–¡ Webhook dispatcher enhanced (retry config, timeout)
   â–¡ Dead-letter queue with reprocessing
   â–¡ Callback orchestration

â–¡ CANONICAL DATA MODEL
   â–¡ Customer, Meter, Reading, Invoice, Payment, Event
   â–¡ Schema registry with versioning
   â–¡ Compatibility checking (BACKWARD)
   â–¡ Data transformation engine

â–¡ INTEGRATION OBSERVABILITY
   â–¡ Integration Health Dashboard
   â–¡ SLA monitoring (uptime, latency, error rate)
   â–¡ Distributed tracing (spans)
   â–¡ Error investigation workbench
   â–¡ DLQ management with reprocess

â–¡ AI INTEGRATION OPERATIONS AGENT
   â–¡ Anomaly detection (error spikes, latency, silence)
   â–¡ Mapping recommendations
   â–¡ Failure prediction (risk scoring)
   â–¡ C12 AIRecommendation integration

â–¡ SECURITY
   â–¡ Multi-auth support (API Key, OAuth2, mTLS, Basic, JWT)
   â–¡ Certificate lifecycle management
   â–¡ Secrets management integration
   â–¡ Webhook HMAC signing + verification
   â–¡ Idempotency key enforcement
   â–¡ Payload validation against schema

â–¡ TESTS â€” 150 PASSING
   â–¡ Integration registry: 15 tests
   â–¡ Connector framework: 25 tests
   â–¡ Schema registry: 20 tests
   â–¡ Webhook & event bus: 20 tests
   â–¡ Rate limiting: 15 tests
   â–¡ Idempotency: 10 tests
   â–¡ ERP/CRM/GIS connectors: 20 tests
   â–¡ Payment & banking: 15 tests
   â–¡ SLA & observability: 10 tests

C15 STATUS: â–¡ NOT IMPLEMENTED
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
C01 EventBus (existing) â”€â”€â”€â”€â”€â”€â”
C12 Identity (auth, audit) â”€â”€â”€â”¤
C13 Financial (GL posting) â”€â”€â”€â”¤
C14 Customer (portal events) â”€â”€â”¤
WebhookDispatcher (exist) â”€â”€â”€â”€â”¤
QueueJob (existing) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
correlationMiddleware (exist) â”€â”¤
                                â–¼
                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                     â”‚  C15 INTEGRATION PLATFORM â”‚
                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                           â”‚
                           â”œâ”€â”€â†’ Integration Registry
                           â”œâ”€â”€â†’ Connector Framework (base + 15 connectors)
                           â”œâ”€â”€â†’ Schema Registry + CDM
                           â”œâ”€â”€â†’ Enhanced EventBus
                           â”œâ”€â”€â†’ Webhook + DLQ + Idempotency
                           â”œâ”€â”€â†’ Integration Health Dashboard
                           â””â”€â”€â†’ AI Integration Ops Agent
```

---

*This document is a planning artifact only. No code, no implementation, no database migration.*
*C15 â€” Enterprise Integration Platform & External Ecosystem Hub. READ ONLY. GOVERNANCE PLANNING ONLY.*

