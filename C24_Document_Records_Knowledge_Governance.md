# C24 — Enterprise Document, Records & Knowledge Governance Platform
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY — GOVERNANCE PLANNING ONLY — NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Preceded by:** C01-C23  
**Constraint:** Web-first platform; no native mobile application.

---

## Part 1 — Enterprise Information Governance Audit

### Current foundation

MeterVerse already contains:

- `StoredFile` with filename, MIME type, size, path, category, uploader, and archive marker.
- `OcrJob`, `PdfJob`, `ExcelJob`, and report/export jobs.
- PDF invoice/statement generation and document/template routes.
- `KnowledgeArticle`, `LearnedPattern`, C18 Knowledge OS design, C20 quality evidence, and C21 governance records.
- `AuditEntry`, C12 RBAC/Zero Trust, C22 tenant scope, and C23 workflow/approval foundations.

### Maturity assessment

| Capability | Current | Gap | Target |
|---|---:|---|---:|
| File storage | 35% | Path-based storage, no governed repository abstraction | 90% |
| Attachments | 25% | Limited entity linkage and metadata | 90% |
| Invoice PDFs/reports | 50% | Generated files, weak lifecycle/retention | 90% |
| SOPs/policies/manuals | 20% | Articles and planning files, no controlled publishing | 90% |
| Contracts/certificates | 15% | No records workflow | 90% |
| OCR/search | 25% | OCR job exists, no unified index | 85% |
| Versioning | 10% | No check-in/check-out or immutable versions | 90% |
| Retention/legal hold | 5% | No policy engine | 90% |
| Knowledge governance | 30% | Articles and patterns, no unified graph linkage | 90% |
| Security/classification | 25% | RBAC exists, classification inheritance missing | 90% |
| **Overall** | **23%** | | **88%** |

### Principal risks

- Duplicate copies of invoices, reports, procedures, and certificates with no authoritative record.
- Missing metadata makes search, retention, and audit evidence unreliable.
- Files can be archived without an approved retention or legal-hold decision.
- Knowledge content can be consumed by AI without classification or approval filtering.
- Tenant and department access is not consistently inherited by attachments.

---

## Part 2 — Enterprise Document Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ C24 INFORMATION GOVERNANCE PLATFORM                                     │
│                                                                         │
│ Document Repository → Metadata → Classification → Version Control       │
│        │                 │             │              │                 │
│        ▼                 ▼             ▼              ▼                 │
│ Folders/Tags       OCR/Search      Security      Check-in/Check-out     │
│                                                                         │
│ Records Lifecycle: Draft → Review → Approved → Published → Archived    │
│                                      │                                  │
│                         Legal Hold / Retention / Disposition            │
│                                      │                                  │
│ C18 Knowledge OS ← semantic index ← approved documents only             │
│ C12/C22 security ← tenant, role, classification, residency             │
└─────────────────────────────────────────────────────────────────────────┘
```

Repository capabilities:

- Folder abstraction independent of physical storage.
- Object storage adapter through C15; database stores metadata, not large binary payloads.
- Tags, categories, custom metadata, document relationships, and tenant/department ownership.
- Check-in/check-out with optimistic locking and conflict detection.
- Version comparison, redlining, annotations, digital signatures, and publishing.
- Immutable published records with content hash and signature metadata.
- Archive and disposal only through C23 workflow and C21 retention policy.

---

## Part 3 — Records Management

### Lifecycle

```text
DRAFT → REVIEW → APPROVED → PUBLISHED → ARCHIVED → DISPOSED
  │        │          │           │          │
  └────────┴──────────┴───────────┴──────────┴── Legal Hold blocks disposition
```

Rules:

- Approved/published records are immutable; corrections create a new version or superseding record.
- Financial, audit, tax, contract, safety, and regulatory records require retention schedules.
- Legal hold suspends retention expiry and disposal across all versions and derivatives.
- Disposition requires dual approval, evidence of retention expiry, hold check, and destruction certificate.
- Every lifecycle action is appended to `DocumentAudit` and C12 `AuditEntry`.

---

## Part 4 — Document Classification

| Classification | Examples | Default Controls |
|---|---|---|
| Public | Published FAQ, public tariff guide | Public read, integrity protected |
| Internal | SOPs, internal reports | Authenticated employees |
| Confidential | Contracts, customer statements | Tenant/department RBAC, watermark |
| Restricted | Financial audit, security, legal hold | Explicit allow-list, masking, download control |
| Financial | Invoices, GL evidence, tax records | Financial retention, C13 access policy |
| Operational | Work orders, maintenance records | Operations scope |
| Technical | Schemas, manuals, architecture | Engineering scope |
| Security | Threat reports, certificates | Security office only |
| Legal | Contracts, disputes, legal notices | Legal/authorized approver |

Classification inheritance:

```text
GLOBAL → TENANT → DEPARTMENT → FOLDER → DOCUMENT → VERSION
```

The most restrictive applicable classification wins unless an authorized data steward records an approved downgrade.

---

## Part 5 — Enterprise Search

### Hybrid retrieval pipeline

```text
Query → Tenant/security filter → parallel retrieval
  ├── Metadata search (category, owner, date, classification, tags)
  ├── Full-text search (OCR + extracted text)
  ├── Semantic vector search (C18 pgvector Knowledge OS)
  └── Structured relationship search (invoice, asset, customer, project)
       ↓
  Security filter → reranker → multilingual result list → citations
```

Capabilities:

- OCR extraction via existing `OcrJob`, with language detection for Arabic/English.
- Arabic RTL-aware tokenization and normalization.
- Filters for tenant, department, document type, owner, status, classification, date, retention, and source entity.
- AI ranking only after authorization filtering; ranking cannot reveal hidden documents.
- Search results cite document ID, version, page/section, classification, and source relationship.
- C18 retrieval receives approved/published knowledge only unless a user explicitly has draft permission.

---

## Part 6 — Knowledge Governance

C24 supplies authoritative knowledge artifacts to C18:

| Knowledge collection | Sources |
|---|---|
| SOPs and procedures | Approved process documents, C23 workflow definitions |
| Troubleshooting | C01-C10 diagnostics, C16 maintenance records |
| RCA and lessons learned | C12-W07 RCA, incidents, post-mortems |
| Standards and policies | C21 Standard/Policy registry |
| Engineering notes | C15 connectors, C19 operations, architecture ADRs |
| Technical articles | Approved manuals, integration guides, meter protocols |

Only approved and classification-authorized documents enter the active C18 retrieval index. Superseded content remains searchable for audit but is demoted and clearly labeled.

---

## Part 7 — AI Knowledge Assistant

| Capability | Output | Autonomy |
|---|---|---|
| Summarize document | Cited summary with confidence | Read-only |
| Answer from approved knowledge | Answer with citations and limitations | Read-only |
| Duplicate detection | Similar documents and likely canonical source | Recommendation |
| Related-document recommendation | Graph/vector relationships | Read-only |
| Automatic classification | Suggested class/category/tags | Human approval |
| Metadata extraction | Suggested dates, parties, asset/customer refs | Human approval |
| Missing-approval detection | Workflow gap finding | Human approval for remediation |

Governance:

- No answer may use unauthorized or unpublished content.
- Confidence below 0.70 requires human review or an explicit uncertainty response.
- Legal, financial, security, and customer-restricted documents require elevated permissions.
- AI actions are reversible, explainable, cited, and logged through C18/C21.

---

## Part 8 — Retention & Compliance

### Retention schedule examples

| Record | Retention | Trigger |
|---|---:|---|
| Invoice/financial evidence | 7–10 years | Period close/issue |
| Tax/e-invoice record | Jurisdiction-specific | Tax submission |
| Contract | Contract end + 7 years | Termination |
| Audit evidence | 5–7 years | Audit closure |
| Operational work order | 5 years | Completion |
| Calibration certificate | Asset life + 5 years | Certificate date |
| Customer correspondence | 3 years | Case closure |
| Draft working files | 1 year | Last access |

Retention is resolved by jurisdiction, tenant policy, record category, and legal hold. Secure destruction produces a signed `RecordDisposition` certificate and audit event.

### Legal hold

```text
LegalHold created → identify scope → freeze records/versions → notify owners
  → preserve exports and hashes → review hold → release or extend
```

---

## Part 9 — Collaboration

- Comments, mentions, threaded discussion, and annotations on non-immutable drafts.
- Review requests routed through C23 approval workflows.
- Redlining and side-by-side version comparison.
- Digital signature envelope with signer identity, timestamp, hash, and certificate reference.
- Published records prohibit mutation; comments remain separate audit-linked records.
- Document shares are tenant-scoped, time-limited, permission-scoped, and revocable.

---

## Part 10 — Enterprise Models

The target design adds approximately 21 models:

1. `Document`
2. `DocumentVersion`
3. `DocumentMetadata`
4. `DocumentCategory`
5. `DocumentTag`
6. `Folder`
7. `RetentionPolicy`
8. `LegalHold`
9. `KnowledgeCollection`
10. `KnowledgeRelationship`
11. `OCRResult`
12. `DocumentApproval`
13. `DocumentComment`
14. `DocumentSubscription`
15. `DocumentAudit`
16. `DocumentTemplate`
17. `SearchIndex`
18. `ClassificationPolicy`
19. `DocumentShare`
20. `RecordDisposition`
21. `DocumentLink`

Existing `StoredFile`, `OcrJob`, `PdfJob`, `ExcelJob`, `KnowledgeArticle`, `ReportDefinition`, and `AuditEntry` are preserved and linked through adapters/migrations, not replaced.

### Core entity contract

```text
Document
  id, tenantId, folderId, categoryId, title, description
  classification, status, owner, sourceEntityType, sourceEntityId
  currentVersionId, retentionPolicyId, legalHoldState
  contentHash, createdAt, archivedAt

DocumentVersion
  id, documentId, version, storageKey, size, mimeType, contentHash
  extractedTextRef, ocrResultId, createdBy, createdAt, supersedesId
  status: DRAFT | REVIEW | APPROVED | PUBLISHED | SUPERSEDED
```

---

## Part 11 — Security & Governance

- C12 Zero Trust authenticates every action and resolves tenant/department scope.
- C22 tenant isolation applies to binary storage, metadata, OCR, embeddings, search, shares, and audit.
- C18 Knowledge OS indexes only permitted content and stores source citations.
- C19 secrets, storage credentials, certificates, logging, backup, and DR controls apply.
- C20 validates upload, version, OCR, search, retention, security, and recovery behavior.
- C21 controls classification policy, retention policy, exceptions, legal holds, and audit findings.
- C23 controls review, approval, publishing, disposition, and escalation workflows.
- C13 controls financial record immutability and retention.
- Encryption at rest and in transit; optional tenant-scoped encryption keys for restricted tenants.
- Watermarks and download restrictions apply to Confidential/Restricted records.
- Malware scanning, MIME validation, content hash, size limits, and quarantine occur before publication.

---

## Part 12 — Testing Strategy — 300 Tests

| Category | Tests | Coverage |
|---|---:|---|
| Upload/storage | 30 | MIME, size, malware, checksum, object storage |
| Versioning/lifecycle | 30 | Check-in/out, publish, supersede, immutable records |
| Permissions/tenant isolation | 35 | RBAC, classification, tenant and department boundaries |
| OCR/metadata | 25 | Arabic/English OCR, extraction, confidence, correction |
| Search/retrieval | 30 | Metadata, full text, semantic, filters, citations |
| Retention/disposition | 25 | schedules, expiry, destruction approval, evidence |
| Legal hold | 20 | scope, freeze, release, extension, disposal blocking |
| AI assistant | 25 | approved sources, summaries, duplicates, confidence, injection |
| Collaboration/approval | 20 | comments, review, signatures, redline, routing |
| Audit integrity | 15 | append-only records, hashes, traceability |
| Disaster recovery | 15 | restore, export packages, tenant isolation after restore |
| Compliance/security | 20 | encryption, masking, ASVS, privacy controls |
| Performance | 10 | large files, bulk OCR, search latency |
| **Total** | **300** | |

Critical acceptance: zero unauthorized document reads, zero deletion during legal hold, zero mutation of published records, reproducible search citations, and complete audit reconstruction.

---

## Part 13 — Implementation Roadmap

| Wave | Duration | Dependencies | Deliverables | Gate | Rollback |
|---|---:|---|---|---|---|
| W01 | 5 days | C15, C19, existing StoredFile | Repository, folders, metadata, storage adapter | Upload/security validation | Keep StoredFile path flow |
| W02 | 5 days | W01, C23 | Versioning, check-in/out, lifecycle, publishing | Immutable version tests | Read-only repository |
| W03 | 5 days | W01-W02, C21 | Classification, retention, legal hold, disposition | Policy/hold certification | Disable disposition |
| W04 | 5 days | W01, C18 | OCR, hybrid search, Knowledge OS indexing | Search precision and isolation | Existing article search |
| W05 | 4 days | W02-W04, C23 | Collaboration, comments, approvals, signatures | Approval evidence gate | Manual review |
| W06 | 4 days | W04, C18 | AI knowledge assistant and duplicate detection | Human approval + citation gate | AI feature flag off |
| W07 | 4 days | W01-W06, C20 | Dashboards, compliance evidence, recovery/export | DR and audit evidence | Existing reports |
| W08 | 3 days | W01-W07 | 300 certification tests and enterprise sign-off | Enterprise certification | Roll back C24 adapters |
| **Total** | **35 days** | | | | |

### Rollout phases

1. Inventory existing files and classify without changing access.
2. Dual-write metadata while retaining existing file paths.
3. Migrate low-risk documents first.
4. Migrate financial, legal, and audit records with reconciliation.
5. Activate controlled publishing and retention.
6. Enable C18 semantic indexing and AI assistant.

---

## Part 14 — Executive Command Center

| Dashboard | Audience | Key content |
|---|---|---|
| Knowledge Management | Knowledge Office | collections, freshness, search quality, stale content |
| Compliance | Compliance Office | retention, holds, audit evidence, dispositions |
| Quality | QCO | approvals, missing metadata, document defects, certification |
| Operations | COO/Operations | work orders, manuals, certificates, active reviews |
| Executive Leadership | Board/C-suite | repository health, risk, compliance, knowledge value |

Core metrics: total documents, published records, unclassified items, stale content, OCR queue, search success, retention exceptions, legal holds, pending approvals, duplicate candidates, storage growth, AI citation confidence.

---

## Part 15 — Definition of Done

```text
□ Governed repository covers documents, attachments, reports, invoices, SOPs,
  contracts, certificates, manuals, calibration records, policies, templates,
  audit evidence, and knowledge articles.
□ Existing StoredFile/OCR/PDF/report capabilities remain supported through adapters.
□ Document versions are immutable after publication and content-hashed.
□ Records lifecycle supports Draft→Review→Approved→Published→Archived→Disposed.
□ Retention policies, jurisdiction rules, legal holds, destruction approvals, and certificates work.
□ Classification inherits GLOBAL→TENANT→DEPARTMENT→FOLDER→DOCUMENT and never weakens silently.
□ Hybrid search supports metadata, OCR, full text, semantic, multilingual, filters, and citations.
□ C18 Knowledge OS receives approved, authorized knowledge with version/source links.
□ AI assistant is read-only by default, confidence-gated, cited, explainable, and auditable.
□ Collaboration and approvals use C23 workflow and C12/C21 governance.
□ C20 quality gates pass all 300 certification tests.
□ C01-C23 integration map is validated and C24 production rollout is reversible.
```

---

## Appendix A — Maturity Improvement

| Dimension | Before C24 | Target After C24 |
|---|---:|---:|
| Repository governance | 35% | 90% |
| Records lifecycle | 15% | 90% |
| Search/retrieval | 25% | 88% |
| Classification/security | 25% | 90% |
| Retention/compliance | 5% | 90% |
| Knowledge governance | 30% | 90% |
| Collaboration | 10% | 80% |
| AI knowledge assistance | 10% | 85% |
| **Overall information governance** | **23%** | **88%** |

## Appendix B — Integration Map

| Program | C24 integration |
|---|---|
| C01-C10 | Connectivity manuals, diagnostics, event evidence |
| C12 | Identity, RBAC, audit, compliance, restricted content |
| C13 | Invoice PDFs, financial records, retention, immutable evidence |
| C14 | Customer documents, statements, portal downloads, disputes |
| C15 | Storage, OCR, external repositories, e-signatures |
| C16 | Asset manuals, calibration, warranty, work-order evidence |
| C17 | Search analytics, data catalog, document metrics |
| C18 | Knowledge graph, embeddings, retrieval, AI assistant |
| C19 | Backups, logs, secrets, DR, operational monitoring |
| C20 | Test evidence, certification packages, traceability |
| C21 | Policies, standards, retention, legal holds, audit findings |
| C22 | Tenant storage/isolation, residency, branding, quotas |
| C23 | Review, approval, publishing, disposition workflows |

## Appendix C — Estimated Size

| Artifact | Estimate |
|---|---:|
| New models | 21 |
| New services | ~12 |
| Web workspaces/dashboards | ~5 |
| Estimated implementation | ~5,300 lines |
| Estimated documentation | ~3,600 lines |
| Certification tests | 300 |
| Initial rollout | 35 implementation days |

---

*This is an architecture and governance planning artifact only. No code, migration, or implementation is included.*
*C24 — Enterprise Document, Records & Knowledge Governance Platform.*
