# EEC-00C — Amendment-01: Adoption Validation & Root Cause Graph

**Status:** RATIFIED  
**Date:** 2026-07-02  
**Authority:** EEC-00C Section 8 (Amendment Protocol) — Chief Enterprise AI Architect  

---

## WP1 — Amendment Scope

This amendment adds Adoption Validation rules, Root Cause Graph, Automated Enforcement rules, Runtime Evidence requirements, and Certification Upgrade rules to EEC-00C.

It does NOT modify or delete any existing EEC-00C rule.

---

## WP2 — Adoption Validation Rules (AV)

Rules that validate whether implemented code actually executes at runtime.

| ID | Rule | Evidence Required | Validation Method |
|----|------|-------------------|-------------------|
| AV-01 | **Pipeline Adoption** — Service uses EnterpriseService.run() for at least one operation | `this.run()` call in service code | Static code analysis |
| AV-02 | **Runtime Execution** — Pipeline counters increment when service operates | `pipeline.operations.total` counter > 0 | RuntimeMetricsEngine snapshot |
| AV-03 | **Domain Event Publishing** — At least one domain event published per operation type | EventBus subscriber receives event | Event count log |
| AV-04 | **Policy Evaluation** — At least one policy evaluated per operation | PolicyEngine evaluate() called | Policy evaluation log |
| AV-05 | **Validator Execution** — At least one validator executed per operation | ValidationRuleService.validate() called | Validation result log |
| AV-06 | **Audit Trail** — Audit record created for each operation | AuditService.create() called | Audit query |
| AV-07 | **Transaction Boundary** — High-risk operations (riskScore ≥ 5) use Prisma.$transaction | Pipeline transaction stage executes | OperationLifecycle timeline |
| AV-08 | **Adoption Percentage** — Percentage of services using EnterpriseService must meet wave target | Count(services extending EnterpriseService) / Total services | Compliance test |

### AV Adoption Levels

| Level | Criteria | % Services |
|-------|----------|------------|
| 0 — None | No service uses EnterpriseService | 0% |
| 1 — Pilot | Core services adopt (auth, readings, payments, meters, customers) | 5-10% |
| 2 — Scaled | Business-domain services adopt (billing, invoices, collections, solar, gas) | 15-30% |
| 3 — Widespread | Infrastructure services adopt (tenant, secrets, audit, reports) | 30-50% |
| 4 — Universal | All services adopt | 100% |

---

## WP3 — Root Cause Graph (RC)

Canonical root cause graph for all enterprise findings. Every decision must reference this graph.

### Root Cause: RC-01 — Architecture Parallelism

**Type:** Structural  
**Findings caused:** ~66 (67%)  
**Severity:** CRITICAL  

Dependency chain:
```
Enterprise architecture built as parallel overlay
  → Services don't extend EnterpriseService (99/101)
  → Pipeline never executes (0 operations)
  → Domain events never published (18 defined, 0 emitted)
  → Policies never evaluated (8 registered, 0 called)
  → Validators never executed (12 rules, 0 validated)
  → Domain exceptions never thrown (13 defined, 0 used)
  → Approval levels defined but never enforced
  → Metrics at zero
```

### Root Cause: RC-02 — Architecture Enforcement

**Type:** Configuration  
**Findings caused:** ~15 (15%)  
**Severity:** HIGH  

Dependency chain:
```
Controllers import PrismaService directly
  → Service layer bypassed entirely
  → Business logic leaks into controllers
  → Inconsistent error handling
  → No transaction boundaries
  → God controllers emerge
```

### Root Cause: RC-03 — Configuration Omissions (RESOLVED in Wave-01)

**Type:** Configuration  
**Findings caused:** ~7 (7%)  
**Severity:** RESOLVED  

Dependency chain:
```
RolesGuard not registered as APP_GUARD
  → @Roles() decorators not enforced
  → RBAC is decorative, not functional

Secrets in docker-compose.yml
  → Credentials exposed in version control
```

### Root Cause: RC-04 — Coordination Errors (RESOLVED in Wave-01)

**Type:** Configuration  
**Findings caused:** ~7 (7%)  
**Severity:** RESOLVED  

Dependency chain:
```
Validator names use class naming (MeterExistsValidator) instead of dot-notation (meter.exists)
  → Pipeline cannot resolve validators
  → Validation stage always succeeds (no-ops)

ESM uuid module breaks Jest
  → 18 tests fail to execute
```

### Root Cause: RC-05 — Infrastructure Deferral

**Type:** Infrastructure  
**Findings caused:** ~15 (15%)  
**Severity:** HIGH (PARTIALLY RESOLVED in Wave-02)  

Dependency chain:
```
No Redis (RESOLVED Wave-02)
  → In-memory stores not persistent
  → Worker queue lost on restart

No area schema indexes (NOT RESOLVED)
  → All 63 area models full-table-scan
  → Tenant queries degrade with data volume

No connection pool configuration
  → Default pool may exhaust under load
```

### Root Cause: RC-06 — No Adoption Incentive

**Type:** Process  
**Findings caused:** 30+  
**Severity:** HIGH  

Dependency chain:
```
No requirement to use enterprise layer
  → Developers continue direct Prisma pattern
  → Enterprise layer remains parallel architecture
  → No enforcement mechanism exists
```

### Root Cause: RC-07 — Test Infrastructure Degradation

**Type:** Infrastructure  
**Findings caused:** ~10  
**Severity:** HIGH  

Dependency chain:
```
5 test suites fail to compile
  → No regression safety net
  → Implementation without validation is risky
  → Confidence in changes is low

No e2e pipeline tests
  → Pipeline cannot be validated
  → No contract tests exercise real endpoints
```

### Root Cause: RC-08 — No CI/CD

**Type:** Infrastructure  
**Findings caused:** ~5  
**Severity:** MEDIUM  

### Root Cause: RC-09 — No SSL/HTTPS

**Type:** Security  
**Findings caused:** ~3  
**Severity:** MEDIUM  

### Root Cause: RC-10 — Governance Fragmentation (RESOLVED)

**Type:** Process  
**Findings caused:** ~5  
**Severity:** RESOLVED  

Multiple governance frameworks (ECG, ERP, EV, ALPHA) consolidated under EEC-00C.

---

## WP4 — Automated Enforcement Rules (AE)

Rules that must be automated in CI when available.

| ID | Rule | CI Implementation |
|----|------|-------------------|
| AE-01 | Compliance test — every controller must NOT import PrismaService | `npm run test:compliance` |
| AE-02 | EnterpriseService extension — every new service must extend | Static analysis gate |
| AE-03 | Runtime evidence — pipeline counters must increment | Metrics endpoint check |
| AE-04 | HANDSHAKE stale check — fail if outdated | Script: `check-handshake-staleness` |
| AE-05 | Governance rule check — verify document hierarchy | Governance audit script |
| AE-06 | Wave dependency check — verify wave prerequisites met | Wave gate script |
| AE-07 | No dead code — unused exports fail | Tree-shaking analysis |
| AE-08 | Adoption metric — configured threshold met | Adoption dashboard |

---

## WP5 — Runtime Evidence Requirements

### Mandatory Runtime Evidence Per Wave

| Wave | Evidence | Collection Point |
|------|----------|-----------------|
| W03a | Compliance test pass/fail | Test suite output |
| W03b | Zero PrismaService imports in controllers | Compliance test |
| W04 | Pipeline operations > 0 | RuntimeMetricsEngine |
| W04 | Domain events published | EventBusService |
| W04 | Policies evaluated | PolicyEngine log |
| W04 | Validators executed | ValidationRuleService log |
| W05 | Audit records created | AuditService query |
| W06 | Pipeline ops per second | RuntimeMetricsEngine histogram |
| W07 | API response times | Observability metrics |
| W08 | All evidence collected | Evidence bundle |

### Evidence Format

```
Evidence Record
  Source: [service/file name]
  Metric: [counter/test name]
  Value: [numeric pass/fail]
  Timestamp: [ISO 8601]
  Collector: [AI session ID]
```

---

## WP6 — Certification Upgrade Rules (CC)

Additional certification rules extending EEC-00C CR-01 through CR-08.

| ID | Rule | Description |
|----|------|-------------|
| CC-14 | **Runtime Evidence Gate** — No certification without runtime evidence | Supersedes CR-02 (now requires runtime proof) |
| CC-15 | **Adoption Threshold** — Each wave must meet minimum adoption level | Wave-03a: 0%, Wave-04: 10%, Wave-06: 20%, Wave-08: 30% |
| CC-16 | **Confidence Floor** — Minimum 80% confidence for FULL certification | 50-79% = CONDITIONAL PASS only |

---

## Sign-off

**Ratified by:** Chief Enterprise AI Architect — 2026-07-02  
**Supersedes:** Nothing — additive amendment to EEC-00C
