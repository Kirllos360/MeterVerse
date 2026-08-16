-- P12.2-A: EVENT RELIABILITY FOUNDATION
-- Additive migration: OutboxEvent, EventDelivery, EventDeadLetter,
-- IdempotencyRecord, ServiceIdentity, ServiceCredential.
-- No existing table is modified (AuditEntry.correlationId already exists).

-- CreateTable
CREATE TABLE "OutboxEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventVersion" INTEGER NOT NULL DEFAULT 1,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "tenantId" TEXT,
    "areaId" TEXT,
    "projectId" TEXT,
    "correlationId" TEXT NOT NULL,
    "causationId" TEXT,
    "idempotencyKey" TEXT,
    "payload" TEXT NOT NULL DEFAULT '{}',
    "metadata" TEXT,
    "sourceService" TEXT,
    "actorId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "lastError" TEXT,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "deadLetteredAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDelivery" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "consumerKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDeadLetter" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "consumerKey" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "lastError" TEXT,
    "replayed" BOOLEAN NOT NULL DEFAULT false,
    "replayedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventDeadLetter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyRecord" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "tenantId" TEXT,
    "areaId" TEXT,
    "projectId" TEXT,
    "operation" TEXT,
    "requestHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "responseBody" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdempotencyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceIdentity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scopes" TEXT NOT NULL DEFAULT '[]',
    "areaScope" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCredential" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "ServiceCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OutboxEvent_status_nextRetryAt_idx" ON "OutboxEvent"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "OutboxEvent_aggregateType_aggregateId_idx" ON "OutboxEvent"("aggregateType", "aggregateId");

-- CreateIndex
CREATE INDEX "OutboxEvent_correlationId_idx" ON "OutboxEvent"("correlationId");

-- CreateIndex
CREATE INDEX "OutboxEvent_areaId_idx" ON "OutboxEvent"("areaId");

-- CreateIndex
CREATE INDEX "OutboxEvent_eventType_status_idx" ON "OutboxEvent"("eventType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EventDelivery_eventId_consumerKey_key" ON "EventDelivery"("eventId", "consumerKey");

-- CreateIndex
CREATE INDEX "EventDelivery_consumerKey_status_idx" ON "EventDelivery"("consumerKey", "status");

-- CreateIndex
CREATE INDEX "EventDeadLetter_eventId_consumerKey_idx" ON "EventDeadLetter"("eventId", "consumerKey");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyRecord_scope_areaId_operation_key_key" ON "IdempotencyRecord"("scope", "areaId", "operation", "key");

-- CreateIndex
CREATE INDEX "IdempotencyRecord_expiresAt_idx" ON "IdempotencyRecord"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceIdentity_name_key" ON "ServiceIdentity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCredential_keyPrefix_key" ON "ServiceCredential"("keyPrefix");

-- CreateIndex
CREATE INDEX "ServiceCredential_serviceId_idx" ON "ServiceCredential"("serviceId");

-- AddForeignKey
ALTER TABLE "EventDelivery" ADD CONSTRAINT "EventDelivery_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "OutboxEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDeadLetter" ADD CONSTRAINT "EventDeadLetter_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "OutboxEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCredential" ADD CONSTRAINT "ServiceCredential_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceIdentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
