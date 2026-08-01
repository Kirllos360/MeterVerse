CREATE TABLE "public"."AccountMapping" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "debitAccountId" TEXT NOT NULL,
    "creditAccountId" TEXT NOT NULL,
    "condition" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountMapping_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."FinancialEvent" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "journalEntryId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "description" TEXT,
    "metadata" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "postedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "FinancialEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AccountMapping_creditAccountId_idx" ON "public"."AccountMapping"("creditAccountId" ASC);
CREATE INDEX "AccountMapping_debitAccountId_idx" ON "public"."AccountMapping"("debitAccountId" ASC);
CREATE INDEX "AccountMapping_transactionType_active_idx" ON "public"."AccountMapping"("transactionType" ASC, "active" ASC);
CREATE INDEX "FinancialEvent_eventType_createdAt_idx" ON "public"."FinancialEvent"("eventType" ASC, "createdAt" ASC);
CREATE INDEX "FinancialEvent_journalEntryId_idx" ON "public"."FinancialEvent"("journalEntryId" ASC);
CREATE INDEX "FinancialEvent_periodId_status_idx" ON "public"."FinancialEvent"("periodId" ASC, "status" ASC);
CREATE UNIQUE INDEX "FinancialEvent_sourceType_sourceId_key" ON "public"."FinancialEvent"("sourceType" ASC, "sourceId" ASC);

