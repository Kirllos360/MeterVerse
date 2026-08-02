# P47 — Wave 3 Rebaseline (C24, C25, C14)

Rebaselined against the **current repository**, not original planning assumptions. Reduces duplicated work by marking what already exists.

## Current repo state (evidence)

- **C24 Documents & Records:** 25% → **5%** (only legacy StoredFile/OcrJob/PdfJob/ImportJob/ExportJob; **0 of 21 planned models**)
- **C25 Communication:** 30% → **8%** (only legacy Notification/EmailLog/SmsLog/PushNotification/Webhook/notification-engine; **0 of 21 planned models**)
- **C14 Customer Experience:** 15% → **8%** (legacy user pages only; **0 of 5 planned models**; no portal)

## Already implemented (reuse, do NOT rebuild)

| Wave-3 plan item | Reusable asset (exists) |
|---|---|
| C24 file infrastructure | StoredFile, OcrJob, PdfJob, ExcelJob, ImportJob, ExportJob models + documents.js + templates.js |
| C24 knowledge base | KnowledgeArticle, LearnedPattern (drift), knowledge-articles.js, learned-patterns.js |
| C25 notification engine | Notification, NotificationTemplate, EmailLog, SmsLog, PushNotification models + notification-engine.js + webhook-dispatcher.js + notifications.js |
| C25 event plumbing | event-bus.js, webhook model, queue (QueueJob) |
| C14 auth foundation | Customer model, full identity (C12), location selector, /login, ListGridPage/GenericAdminPage patterns |
| C14 reporting foundation | reports.js, financial-reports, consumption configs |

## Must BUILD (the real Wave-3 work)

### C24 — Documents & Records (21 models)
Document, DocumentVersion, DocumentMetadata, DocumentCategory, DocumentTag, Folder, RetentionPolicy, LegalHold, KnowledgeCollection, KnowledgeRelationship, OCRResult, DocumentApproval, DocumentComment, DocumentSubscription, DocumentAudit, DocumentTemplate, SearchIndex, ClassificationPolicy, DocumentShare, RecordDisposition, DocumentLink.
**Build order:** core Document/Version/Metadata → retention/lifecycle → OCR/search → approvals/audit.

### C25 — Communication (21 models)
Conversation, ConversationParticipant, Message, MessageAttachment, NotificationPreference, NotificationTemplateVersion, DeliveryAttempt, DeliveryChannel, CommunicationRule, MessageReaction, Mention, InboxItem, Announcement, BroadcastCampaign, EscalationPolicy, QuietHourProfile, CommunicationAudit, MessageClassification, DeliveryReceipt, MessageSuppression, CommunicationThreadLink.
**Build order:** unified inbox (Conversation/Message) → delivery (Attempt/Channel/Receipt) → preferences/rules → campaigns/announcements.

### C14 — Customer Experience (5 models)
CustomerPreference, DelegatedAccess, ServiceRequest, ServiceRequestMessage, CustomerDocument.
**Plus (the real gap):** a **true user portal** replacing the admin-reskin shell — pages for: profile/preferences, my meters (ownership), my bills + pay, submit reading, consumption analytics, tickets (real, backend-backed), notifications inbox, documents, service requests, delegated access.

## Rebaselined scope notes

1. **Don't count legacy as deliverable** — tracker corrected (OBS-054).
2. **Add B-10 drift migration first** (21 unmigrated models) so Wave-3 migrations chain cleanly.
3. **C14 is the largest effort** — it's not "5 models," it's the user self-service portal (boundaries per P47 responsibility matrix).
4. **Reuse patterns:** GenericAdminPage for admin CRUD; ListGridPage for user grids; BFF handlers for proxying.
5. **Estimated Wave-3 scope** (rebaselined): C24 ~35% of effort, C25 ~30%, C14 portal ~35% (portal UI dominates).
