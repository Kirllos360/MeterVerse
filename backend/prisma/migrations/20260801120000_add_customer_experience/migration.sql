CREATE TABLE "public"."CustomerDocument" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "documentId" TEXT,
    "title" TEXT NOT NULL,
    "docType" TEXT NOT NULL DEFAULT 'STATEMENT',
    "storedFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "CustomerDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."CustomerPreference" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "theme" TEXT NOT NULL DEFAULT 'adaptive',
    "notifyChannels" TEXT NOT NULL DEFAULT '["in_app","email"]',
    "billingEmail" TEXT,
    "billingPhone" TEXT,
    "preferences" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerPreference_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."DelegatedAccess" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "delegateUserId" TEXT,
    "delegateEmail" TEXT,
    "permissions" TEXT NOT NULL DEFAULT '["view"]',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "DelegatedAccess_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."ServiceRequest" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "assignedTo" TEXT,
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."ServiceRequestMessage" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'in_app',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceRequestMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."Ticket" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'SUPPORT',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomerDocument_customerId_docType_idx" ON "public"."CustomerDocument"("customerId" ASC, "docType" ASC);
CREATE INDEX "CustomerPreference_customerId_idx" ON "public"."CustomerPreference"("customerId" ASC);
CREATE UNIQUE INDEX "CustomerPreference_customerId_key" ON "public"."CustomerPreference"("customerId" ASC);
CREATE INDEX "DelegatedAccess_customerId_status_idx" ON "public"."DelegatedAccess"("customerId" ASC, "status" ASC);
CREATE INDEX "DelegatedAccess_delegateUserId_idx" ON "public"."DelegatedAccess"("delegateUserId" ASC);
CREATE INDEX "ServiceRequest_customerId_status_idx" ON "public"."ServiceRequest"("customerId" ASC, "status" ASC);
CREATE INDEX "ServiceRequest_type_status_idx" ON "public"."ServiceRequest"("type" ASC, "status" ASC);
CREATE INDEX "ServiceRequestMessage_requestId_idx" ON "public"."ServiceRequestMessage"("requestId" ASC);
CREATE INDEX "Ticket_category_status_idx" ON "public"."Ticket"("category" ASC, "status" ASC);
CREATE INDEX "Ticket_customerId_status_idx" ON "public"."Ticket"("customerId" ASC, "status" ASC);
CREATE INDEX "Ticket_status_createdAt_idx" ON "public"."Ticket"("status" ASC, "createdAt" ASC);

