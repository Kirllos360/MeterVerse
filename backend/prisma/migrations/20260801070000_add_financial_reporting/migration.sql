CREATE TABLE "public"."Budget" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "accountCode" TEXT,
    "accountId" TEXT,
    "category" TEXT NOT NULL DEFAULT 'OPERATING',
    "amount" DOUBLE PRECISION NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."BudgetVsActual" (
    "id" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "budgetId" TEXT,
    "accountCode" TEXT,
    "category" TEXT NOT NULL,
    "budgetAmount" DOUBLE PRECISION NOT NULL,
    "actualAmount" DOUBLE PRECISION NOT NULL,
    "variance" DOUBLE PRECISION NOT NULL,
    "variancePct" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetVsActual_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."FinancialNote" (
    "id" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."FinancialRatio" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "formula" TEXT NOT NULL,
    "numerator" TEXT,
    "denominator" TEXT,
    "value" DOUBLE PRECISION,
    "periodKey" TEXT,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialRatio_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."FinancialSnapshot" (
    "id" TEXT NOT NULL,
    "snapshotType" TEXT NOT NULL DEFAULT 'MONTHLY',
    "periodKey" TEXT NOT NULL,
    "periodId" TEXT,
    "label" TEXT,
    "data" TEXT NOT NULL DEFAULT '{}',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."IFRSMapping" (
    "id" TEXT NOT NULL,
    "ifrsCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "accountCode" TEXT,
    "accountType" TEXT,
    "category" TEXT NOT NULL DEFAULT 'UNCATEGORIZED',
    "mapping" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IFRSMapping_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."ReportSchedule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
    "recipients" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "ReportSchedule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."SegmentPerformance" (
    "id" TEXT NOT NULL,
    "segmentType" TEXT NOT NULL,
    "segmentKey" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "margin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marginPct" DOUBLE PRECISION,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SegmentPerformance_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Budget_accountCode_periodKey_idx" ON "public"."Budget"("accountCode" ASC, "periodKey" ASC);
CREATE INDEX "Budget_periodKey_category_idx" ON "public"."Budget"("periodKey" ASC, "category" ASC);
CREATE INDEX "BudgetVsActual_periodKey_category_idx" ON "public"."BudgetVsActual"("periodKey" ASC, "category" ASC);
CREATE INDEX "FinancialNote_reportType_periodKey_idx" ON "public"."FinancialNote"("reportType" ASC, "periodKey" ASC);
CREATE UNIQUE INDEX "FinancialRatio_code_key" ON "public"."FinancialRatio"("code" ASC);
CREATE INDEX "FinancialRatio_code_periodKey_idx" ON "public"."FinancialRatio"("code" ASC, "periodKey" ASC);
CREATE INDEX "FinancialSnapshot_periodKey_idx" ON "public"."FinancialSnapshot"("periodKey" ASC);
CREATE UNIQUE INDEX "FinancialSnapshot_snapshotType_periodKey_key" ON "public"."FinancialSnapshot"("snapshotType" ASC, "periodKey" ASC);
CREATE INDEX "IFRSMapping_category_idx" ON "public"."IFRSMapping"("category" ASC);
CREATE UNIQUE INDEX "IFRSMapping_ifrsCode_accountCode_key" ON "public"."IFRSMapping"("ifrsCode" ASC, "accountCode" ASC);
CREATE INDEX "SegmentPerformance_segmentType_periodKey_idx" ON "public"."SegmentPerformance"("segmentType" ASC, "periodKey" ASC);
CREATE UNIQUE INDEX "SegmentPerformance_segmentType_segmentKey_periodKey_key" ON "public"."SegmentPerformance"("segmentType" ASC, "segmentKey" ASC, "periodKey" ASC);

