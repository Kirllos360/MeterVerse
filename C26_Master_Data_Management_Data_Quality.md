# C26 — Enterprise Master Data Management, Data Quality & Reference Data Platform
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY — GOVERNANCE PLANNING ONLY — NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Preceded by:** C01-C25  
**Constraint:** Web-first governance platform; no native mobile application.

---

## Part 1 — Enterprise Master Data Audit

### Existing master domains

MeterVerse has source records for User/Role, Organization, Country/Governorate, Area, Project, Zone, Unit, Customer, CustomerGroup, Meter/MeterType, SIMCard, Tariff, Account, and C25/C16/C22 planned entities. C17 has data architecture catalogs; C15 provides external synchronization; C21 provides ownership/governance; C18 provides AI and knowledge support.

### Maturity assessment

| Domain | Current | Principal issue | Target |
|---|---:|---|---:|
| Customers/organizations | 45% | Duplicate identities, weak canonical IDs | 90% |
| Locations | 50% | Area/project/unit hierarchy inconsistencies | 90% |
| Meters/assets/SIMs | 55% | Serial/source conflicts, lifecycle divergence | 92% |
| Suppliers/warehouses | 15% | C16 designed, no authoritative hub | 85% |
| Employees/roles | 45% | Identity and HR ownership split | 90% |
| Tariffs/accounts | 50% | Version/source conflicts across finance | 92% |
| Reference data | 25% | Statuses, units, currencies not governed centrally | 90% |
| Documents/knowledge | 35% | C24/C18 content needs canonical identity | 88% |
| Ownership/stewardship | 20% | No operational steward queue | 90% |
| Quality measurement | 20% | No enterprise score by domain/source | 90% |
| **Overall MDM maturity** | **32%** | | **90%** |

### Prioritized remediation matrix

| Priority | Remediation | Risk reduced |
|---|---|---|
| P0 | Tenant-safe canonical IDs for customer, organization, meter, asset, account | Cross-tenant corruption |
| P0 | Duplicate detection and merge approval | Billing, service, and reporting errors |
| P0 | Reference data registry and versioning | Invalid workflows and inconsistent analytics |
| P1 | Source ownership and survivorship rules | Conflicting updates |
| P1 | Orphan/reference integrity scans | Broken downstream integrations |
| P1 | Data quality scorecards and steward queues | Unresolved data defects |
| P2 | AI enrichment and relationship discovery | Manual stewardship effort |

---

## Part 2 — Enterprise MDM Architecture

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ MASTER DATA HUB                                                         │
│                                                                        │
│ Sources C01-C25 → Ingestion/Mapping → Identity Resolution              │
│                                      → Match/Merge                       │
│                                      → Golden Record Engine              │
│                                      → Steward Approval                 │
│                                      → Canonical Master                  │
│                                                                        │
│ Golden records → C15 sync → ERP/CRM/GIS/SCADA/identity                  │
│ Golden records → C17 analytics → facts/dimensions                        │
│ Golden records → C18 AI → approved context                               │
│ Quality/issues → C21 governance + C23 workflow + C25 communication      │
└──────────────────────────────────────────────────────────────────────────┘
```

Design principles:

- Source systems remain operational systems of record for their bounded transactions.
- C26 owns canonical identity, survivorship, quality, stewardship, and reference data.
- No merge is destructive: aliases and source lineage remain queryable.
- Every master record is tenant-scoped and has a stable enterprise ID.
- Golden records are published only after deterministic rules or steward approval.

### Source prioritization

```text
Regulatory authority / approved reference → enterprise governance registry
Contract/customer authority → Customer/Finance owner
Meter/asset authority → Asset Operations
Identity authority → C12 Identity
External integration source → C15 connector, never direct overwrite
```

---

## Part 3 — Reference Data Management

Central reference datasets include:

- Countries, regions, cities, governorates, areas, time zones, languages.
- Utilities, meter types, units of measure, currencies, tax codes.
- Status codes, priorities, categories, industry codes, service types.
- Roles, workflow states, issue types, document classifications, compliance frameworks.

Each dataset has owner, steward, version, effective dates, parent/inheritance, source authority, approval state, and deprecation policy. Consumers reference stable codes, not display labels.

```text
ReferenceDataset
  └── ReferenceValue (code, label, locale labels, parent, effective dates)
        └── ReferenceValueVersion (history and status)
```

Inheritance follows `GLOBAL → REGION → COUNTRY → TENANT → BUSINESS UNIT`, with the most specific approved value winning.

---

## Part 4 — Golden Record Engine

### Matching stages

```text
Incoming source record
  → normalize (case, whitespace, phone, email, serial, address)
  → deterministic keys (tax ID, serial, email, external ID)
  → probabilistic scoring (name, address, phone, date, relationships)
  → candidate cluster
  → merge proposal
  → steward approval for merge
  → golden record publication
  → source-system reconciliation and audit
```

### Match score

```text
matchScore = deterministicMatch × 0.50
           + identityAttributes × 0.25
           + relationshipEvidence × 0.15
           + sourceReliability × 0.10

≥ 0.95: deterministic auto-link, no destructive merge
0.75–0.94: steward review required
< 0.75: retain separate records and monitor
```

Human approval is mandatory for merges involving customers, organizations, financial accounts, assets with financial history, legal records, or restricted tenants.

Merge rollback restores previous attribute values and relationships using the immutable merge audit; source records are never deleted.

---

## Part 5 — Data Quality Framework

| Dimension | Example rule | Failure action |
|---|---|---|
| Completeness | Customer email required for portal-enabled customer | Steward issue |
| Uniqueness | Meter serial and tax ID unique per tenant/global policy | Block or merge candidate |
| Validity | Country code, currency, phone, status in reference set | Reject/quarantine |
| Consistency | Invoice customer, contract, meter assignment agree | Investigation |
| Timeliness | Master updated within source SLA | Alert source owner |
| Conformity | Units, dates, codes, locale formats canonical | Transform or issue |
| Referential integrity | No orphan meter assignment or asset owner | Block publication |
| Business rules | Active meter has valid type and location | Workflow issue |

### Quality score

```text
domainScore = completeness × .15 + uniqueness × .15 + validity × .15
            + consistency × .15 + timeliness × .10 + conformity × .10
            + referentialIntegrity × .15 + businessRules × .15
```

Scores are stored by domain, tenant, source, and period. Red domains create C23 stewardship workflows and C25 notifications.

---

## Part 6 — Data Stewardship

### Stewardship workflow

```text
QUALITY ISSUE → assigned to domain steward → investigate → propose correction
  → approval (if sensitive) → apply/propagate → verify → close
```

Steward responsibilities:

- Own a domain and approve canonical definitions.
- Review match/merge proposals and exceptions.
- Resolve orphan references and conflicting source values.
- Certify quality score and remediation evidence.
- Escalate unresolved issues according to SLA.

Assignments are tenant, domain, region, and classification scoped. C21 governance owns exceptions and waivers; C23 manages task states; C25 routes reminders and escalations.

---

## Part 7 — AI Data Intelligence

| Capability | Output | Governance |
|---|---|---|
| Duplicate detection | Candidate pairs/clusters | Human merge approval |
| Anomaly detection | Unexpected attribute/relationship changes | Advisory |
| Enrichment recommendation | Missing address/type/category suggestion | Steward approval |
| Missing data prediction | Likely value/source | Never auto-publish restricted data |
| Quality forecasting | Future score and risk | Read-only forecast |
| Merge confidence | Score and evidence | Threshold-gated |
| Relationship discovery | Suggested graph relationships | Human approval for master links |

All AI output includes confidence, evidence, source ranking, alternatives, limitations, and C18 audit logs. No AI may autonomously merge protected master domains.

---

## Part 8 — Data Lineage & Impact Analysis

```text
SOURCE → C15 connector → mapping/transformation → MasterRecord
  → GoldenRecord → downstream workflow/report/AI/document
```

Lineage tracks source system, source ID, field transformation, mapping version, sync attempt, target record, workflow consumers, reports, C17 facts, C18 retrieval use, and C24 document references.

Impact analysis answers:

- Which invoices, tariffs, work orders, dashboards, AI prompts, documents, and integrations depend on this master?
- What breaks if a reference value is deprecated?
- Which tenants/regions receive a propagated change?
- Which published records must remain unchanged?

---

## Part 9 — Enterprise Synchronization

Sync adapters use C15 connectors and canonical mappings:

| Source | Master domains | Conflict policy |
|---|---|---|
| ERP | suppliers, accounts, financial organization | finance authority wins |
| CRM | customers, contacts, organizations | customer authority with steward review |
| GIS | locations, sites, coordinates | GIS wins geometry; C26 owns identity |
| SCADA/AMI | meters, devices, readings | operational device source wins telemetry |
| External APIs | reference/customer/asset extensions | mapping + source reliability |
| Identity systems | users, roles, groups | C12 identity authority wins |

Conflict states: `DETECTED → CLASSIFIED → ASSIGNED → RESOLVED → PROPAGATED`. Every conflict has both values, source timestamps, authority scores, resolution reason, and rollback reference.

---

## Part 10 — Enterprise Models

The target design adds approximately 22 models:

1. `MasterRecord`
2. `GoldenRecord`
3. `DataSource`
4. `MatchCandidate`
5. `MergeDecision`
6. `StewardAssignment`
7. `DataQualityRule`
8. `DataQualityIssue`
9. `DataQualityScore`
10. `ReferenceDataset`
11. `ReferenceValue`
12. `CanonicalMapping`
13. `LineageRecord`
14. `SyncConflict`
15. `DataCertification`
16. `IdentityCluster`
17. `AttributeHistory`
18. `MergeAudit`
19. `DataException`
20. `StewardReview`
21. `EntityRelationship`
22. `DataOwnership`

Each model carries tenant scope, lifecycle status, source authority, version, timestamps, and audit linkage where applicable.

### Core contracts

```text
MasterRecord
  id, tenantId, domain, entityType, sourceSystem, sourceId
  canonicalKey, currentGoldenRecordId, status, firstSeenAt, lastSeenAt

GoldenRecord
  id, tenantId, entityType, canonicalKey, attributes, qualityScore
  status, approvedBy, approvedAt, version, createdAt

MergeDecision
  id, entityType, survivorId, duplicateIds, score, evidence
  status: PROPOSED | APPROVED | REJECTED | ROLLED_BACK
  decidedBy, decidedAt, rollbackAt
```

---

## Part 11 — Security & Governance

- C12 Zero Trust authenticates stewards, source operators, and service identities.
- C15 controls ingestion, connectors, mapping, retries, idempotency, and propagation.
- C17 consumes certified dimensions and quality scores; uncertified masters are marked.
- C18 uses approved golden records and quality metadata in retrieval/context.
- C21 governs standards, ownership, exceptions, waivers, risks, and certifications.
- C22 enforces tenant/region/data-residency isolation.
- C23 orchestrates steward reviews, merge approvals, conflicts, and escalations.
- C24 preserves master-data evidence, versions, documents, and legal holds.
- C25 sends issue assignments, conflict alerts, and approval notifications.
- Every merge, rollback, reference change, quality result, and propagation is immutable-audited.

---

## Part 12 — Testing Strategy — 340 Tests

| Category | Tests | Coverage |
|---|---:|---|
| Matching/identity resolution | 40 | deterministic, probabilistic, normalization, clusters |
| Merge/rollback | 35 | approval, survivor, relationships, rollback, immutable audit |
| Synchronization | 35 | ERP, CRM, GIS, SCADA, identity, external APIs |
| Reference data | 25 | inheritance, versioning, deprecation, locale |
| Quality rules | 40 | eight quality dimensions and scoring |
| Stewardship workflow | 25 | assignment, SLA, approval, exception, certification |
| Lineage/impact | 25 | source→transform→master→consumer chains |
| AI recommendations | 25 | confidence, evidence, human merge approval |
| Tenant isolation | 30 | cross-tenant matching, search, sync, AI, exports |
| Performance | 20 | million-record match, batch sync, quality scans |
| Compliance/security | 25 | RBAC, PII, retention, audit, classification |
| DR/recovery | 15 | restore, replay, lineage and merge consistency |
| **Total** | **340** | |

Critical acceptance: zero unauthorized cross-tenant matches, no destructive merge without approval, deterministic rollback, no orphan masters after propagation, and complete source lineage.

---

## Part 13 — Implementation Roadmap

| Wave | Duration | Dependencies | Deliverables | Gate | Rollback |
|---|---:|---|---|---|---|
| W01 | 5 days | C17/C21/C22 | MDM hub, source catalog, ownership model | Domain inventory and ownership approved | Read-only catalog |
| W02 | 5 days | W01, C15 | Canonical model, mappings, reference registry | Mapping contracts pass | Keep source APIs |
| W03 | 5 days | W01-W02 | Deterministic/probabilistic match engine | Golden dataset precision gate | Disable merges |
| W04 | 5 days | W03, C23 | Stewardship, merge approval, rollback | Human approval and rollback gate | Candidate-only mode |
| W05 | 4 days | W02-W04 | Quality rules, scoring, certification | Quality score accuracy gate | Report-only quality |
| W06 | 4 days | W02, C15 | Synchronization, conflict reconciliation, lineage | Connector/lineage gate | Pause propagation |
| W07 | 4 days | W04-W06, C18/C24 | AI enrichment, relationship discovery, dashboards | AI confidence/records gate | AI disabled |
| W08 | 3 days | W01-W07, C20/C21 | 340 tests, certification, rollout | Enterprise MDM certification | Source systems remain authoritative |
| **Total** | **35 days** | | | | |

### Rollout phases

1. Inventory and profile without changing source records.
2. Register reference datasets and source ownership.
3. Run candidate matching in shadow mode.
4. Approve golden records for low-risk reference domains.
5. Expand to customers, meters, assets, suppliers, and accounts with human merge approval.
6. Activate synchronization and AI enrichment after quality certification.

---

## Part 14 — Executive Command Center

| Dashboard | Audience | Key content |
|---|---|---|
| Data Governance Office | CDO/DGC | quality score, ownership, domains, exceptions, certifications |
| Data Stewards | Stewards | match candidates, issue queue, conflicts, SLA, approvals |
| Operations | COO/Ops | meter/asset master health, orphan records, sync status |
| Integration | C15 operators | source health, conflicts, mapping failures, propagation |
| Executive Leadership | C-suite/board | master-data maturity, duplicate risk, quality trend, business impact |

Core metrics: golden-record coverage, duplicate rate, merge precision, quality score, steward backlog, lineage coverage, sync success, conflict age, orphan references, reference-data compliance, certification status.

---

## Part 15 — Definition of Done

```text
□ Master Data Hub covers customer, organization, location, meter, asset, SIM,
  supplier, warehouse, employee, role, tariff, account, country, region, utility,
  product, service, document, and knowledge domains.
□ Golden Record Engine supports deterministic and probabilistic matching,
  candidate scoring, human-approved merge, rollback, and lineage.
□ Reference datasets are versioned, inherited, owned, and deprecable.
□ Eight data-quality dimensions are measured with domain/source/tenant scores.
□ Stewardship assignments, issue workflow, approvals, exceptions, escalation,
  and certification are operational.
□ C15 synchronization supports conflict detection and reconciliation.
□ C17 lineage and dimensions consume certified master records.
□ C18 AI uses quality/classification context; merges always require humans.
□ C21 governance owns standards, ownership, exceptions, risks, and audits.
□ C22 tenant isolation and residency apply to all MDM records and indexes.
□ C23 routes stewardship and merge workflows; C24 preserves evidence; C25 notifies.
□ 340 certification tests pass across matching, quality, sync, security, DR, and compliance.
```

---

## Appendix A — Maturity Improvement

| Dimension | Before C26 | Target After C26 |
|---|---:|---:|
| Master identity | 32% | 92% |
| Reference data | 25% | 90% |
| Data quality | 20% | 90% |
| Stewardship | 20% | 90% |
| Golden records | 10% | 90% |
| Synchronization | 30% | 88% |
| Lineage | 25% | 90% |
| AI data intelligence | 15% | 85% |
| **Overall MDM maturity** | **32%** | **90%** |

## Appendix B — Integration Map

| Program | C26 integration |
|---|---|
| C01-C10 | meters, gateways, SIMs, readings, connection sources |
| C12 | users, roles, identity authority, RBAC, audit |
| C13 | customers, tariffs, accounts, financial master lineage |
| C14 | customer portal identity and master profile |
| C15 | source connectors, canonical mappings, synchronization |
| C16 | assets, suppliers, warehouses, technicians |
| C17 | certified dimensions, quality scores, metric lineage |
| C18 | AI matching, enrichment, relationship discovery, knowledge context |
| C19 | operations, backups, configuration, monitoring |
| C20 | quality/certification evidence and test datasets |
| C21 | standards, policies, ownership, exceptions, audit findings |
| C22 | tenant scope, region/country, residency, quotas |
| C23 | stewardship, merge, conflict, certification workflows |
| C24 | document/knowledge masters, retention, legal holds |
| C25 | steward notifications, conflict alerts, approval communications |

## Appendix C — Estimated Size

| Artifact | Estimate |
|---|---:|
| New models | 22 |
| New services | ~12 |
| Web workspaces/dashboards | ~5 |
| Estimated implementation | ~5,500 lines |
| Estimated documentation | ~3,700 lines |
| Certification tests | 340 |
| Initial rollout | 35 implementation days |

---

*This is an architecture and governance planning artifact only. No code, migration, or implementation is included.*
*C26 — Enterprise Master Data Management, Data Quality & Reference Data Platform.*
