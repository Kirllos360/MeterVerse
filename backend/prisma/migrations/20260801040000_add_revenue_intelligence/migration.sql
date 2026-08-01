CREATE TABLE "public"."RevenueInvestigation" (
    "id" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "assignedTo" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "outcome" TEXT,
    "resolution" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevenueInvestigation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."RevenueLeakageFinding" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'invoice',
    "sourceId" TEXT,
    "periodId" TEXT,
    "customerId" TEXT,
    "expectedAmount" DOUBLE PRECISION,
    "actualAmount" DOUBLE PRECISION,
    "varianceAmount" DOUBLE PRECISION,
    "variancePct" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "summary" TEXT,
    "details" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolutionNote" TEXT,
    "archivedAt" TIMESTAMP(3),
    "investigationId" TEXT,

    CONSTRAINT "RevenueLeakageFinding_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."RevenueRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'POST_BILL',
    "entityType" TEXT NOT NULL DEFAULT 'invoice',
    "condition" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "action" TEXT NOT NULL DEFAULT 'flag',
    "expectedValue" DOUBLE PRECISION,
    "tolerance" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "runFrequency" TEXT NOT NULL DEFAULT 'on_demand',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevenueRule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RevenueInvestigation_findingId_idx" ON "public"."RevenueInvestigation"("findingId" ASC);
CREATE INDEX "RevenueInvestigation_status_assignedTo_idx" ON "public"."RevenueInvestigation"("status" ASC, "assignedTo" ASC);
CREATE INDEX "RevenueLeakageFinding_customerId_status_idx" ON "public"."RevenueLeakageFinding"("customerId" ASC, "status" ASC);
CREATE INDEX "RevenueLeakageFinding_entityType_entityId_idx" ON "public"."RevenueLeakageFinding"("entityType" ASC, "entityId" ASC);
CREATE INDEX "RevenueLeakageFinding_periodId_status_idx" ON "public"."RevenueLeakageFinding"("periodId" ASC, "status" ASC);
CREATE INDEX "RevenueLeakageFinding_ruleId_status_idx" ON "public"."RevenueLeakageFinding"("ruleId" ASC, "status" ASC);
CREATE UNIQUE INDEX "RevenueRule_code_key" ON "public"."RevenueRule"("code" ASC);

