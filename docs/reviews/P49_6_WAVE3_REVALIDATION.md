# P49.6 — Wave 3 Revalidation

**Date:** 2026-08-01 · Validates the C24/C25/C14 execution order before P50.
Current order: **C24 (Documents) → C25 (Communication) → C14 (Customer Experience)**

---

## 1. Dependency Analysis

| Relationship | Impact |
|---|---|
| **C24 → C25** | C24 documents need delivery channels (C25 notifications) for approval/share; C25 can build on C24's document/attachment models. ✅ C24 first is correct. |
| **C24 → C14** | C14 user portal needs documents (statements, bills) — C24 provides them. ✅ |
| **C25 → C14** | C14 portal needs notifications inbox (C25), email/SMS (C25 delivery), alerts. ✅ C25 before C14. |
| **C14 → C24/C25** | C14 consumes both; no reverse dependency. ✅ |

**Order validated: C24 → C25 → C14 is correct.** No change required.

## 2. Impact Assessment

### C24 — Documents & Records (21 models)
- **DB:** 21 new models (Document, DocumentVersion, Metadata, Category, Tag, Folder, RetentionPolicy, LegalHold, KnowledgeCollection, OCRResult, Approval, Comment, Subscription, Audit, Template, SearchIndex, Classification, Share, Disposition, Link, Relationship) → **B-11 migration**
- **API:** `/api/documents/*` (CRUD + lifecycle + retention + approval + search)
- **Frontend:** admin documents app (GenericAdminPage + lifecycle), user document portal (C14)
- **Security:** permission-gated (`documents.*`), audit on every mutation, legal-hold immutability
- **EOS:** documents as an app in the workspace, context-scoped
- **Testing:** +40 unit, +10 contract

### C25 — Communication (21 models)
- **DB:** 21 new models (Conversation, Message, Attachment, NotificationPreference, TemplateVersion, DeliveryAttempt, Channel, Rule, Reaction, Mention, InboxItem, Announcement, Campaign, EscalationPolicy, QuietHour, CommunicationAudit, Classification, Receipt, Suppression, ThreadLink) → **B-12 migration**
- **API:** `/api/communication/*` (inbox, delivery, channels, campaigns)
- **Frontend:** unified inbox (admin + user), notification center
- **Security:** `communication.*`, quiet-hours, suppression, audit
- **EOS:** notifications panel in workspace dock
- **Testing:** +40 unit, +10 contract

### C14 — Customer Experience (5 models + portal)
- **DB:** 5 new models (CustomerPreference, DelegatedAccess, ServiceRequest, ServiceRequestMessage, CustomerDocument) → **B-13 migration**
- **API:** `/api/portal/*` (my meters, my bills, pay, submit reading, tickets, notifications, documents, profile, service requests)
- **Frontend:** TRUE user portal (replaces green admin-reskin) — operations center views
- **Security:** row-level customer scoping (`filterByArea`/customerId), `portal.*` permissions
- **EOS:** the Operations Center identity (green) fulfilled
- **Testing:** +30 unit, +15 contract, Playwright portal flows

## 3. Cross-cutting considerations

| Aspect | Impact |
|---|---|
| **P49.5 extraction** | C14 should also add tickets/claims (from Mete/Abady) — fold into C14 portal scope. |
| **Migration baseline** | Must run B-10 (drift closure, 21 models) BEFORE B-11/12/13 so chains cleanly. |
| **C13 follow-on** | Settlement/wallet/gas + bank reconciliation NOT in Wave 3 — deferred to Wave 5 / C13-W05 to avoid overloading. |
| **User nav** | C14 must keep the P49 admin-only nav filtering; add user-scoped modules. |

## 4. Order Decision

**Keep: C24 → C25 → C14.** Rationale: build document + communication foundations first, then the customer portal consumes them. No roadmap change.

**Wave 3 adjusted scope (adds P49.5 extraction):**
- C14 additionally includes **tickets/support/claims** backend (from Mete/Abady patterns).
- C24 includes **invoice hash/QR** hardening.
- C25 wires **real email/SMS delivery** (closes placeholder).
