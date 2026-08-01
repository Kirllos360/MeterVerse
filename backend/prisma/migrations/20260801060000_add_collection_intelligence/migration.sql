CREATE TABLE "public"."BadDebtProvision" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT,
    "customerId" TEXT,
    "periodId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "bucketDays" INTEGER NOT NULL DEFAULT 0,
    "outstanding" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "provisionPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "period" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BadDebtProvision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."CustomerRiskProfile" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "riskBand" TEXT NOT NULL DEFAULT 'MEDIUM',
    "agingDays" INTEGER NOT NULL DEFAULT 0,
    "totalOwing" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overdueCount" INTEGER NOT NULL DEFAULT 0,
    "promiseKeptRate" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "lastPaymentDaysAgo" INTEGER,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerRiskProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."Dispute" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "reason" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."DunningRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "stage" INTEGER NOT NULL DEFAULT 1,
    "minDays" INTEGER NOT NULL DEFAULT 0,
    "maxDays" INTEGER,
    "action" TEXT NOT NULL DEFAULT 'REMINDER',
    "channel" TEXT,
    "message" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DunningRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."InstallmentPlan" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "collectionCaseId" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "downPayment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "installments" INTEGER NOT NULL DEFAULT 1,
    "frequencyDays" INTEGER NOT NULL DEFAULT 30,
    "startDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "InstallmentPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."PlanInstallment" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanInstallment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."ProvisionRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "bucketDays" INTEGER NOT NULL DEFAULT 90,
    "provisionPct" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "ProvisionRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."WriteOffRequest" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "collectionCaseId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvalId" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "executedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WriteOffRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BadDebtProvision_customerId_idx" ON "public"."BadDebtProvision"("customerId" ASC);
CREATE INDEX "BadDebtProvision_period_amount_idx" ON "public"."BadDebtProvision"("period" ASC, "amount" ASC);
CREATE INDEX "BadDebtProvision_ruleId_idx" ON "public"."BadDebtProvision"("ruleId" ASC);
CREATE UNIQUE INDEX "CustomerRiskProfile_customerId_key" ON "public"."CustomerRiskProfile"("customerId" ASC);
CREATE INDEX "CustomerRiskProfile_riskBand_riskScore_idx" ON "public"."CustomerRiskProfile"("riskBand" ASC, "riskScore" ASC);
CREATE INDEX "Dispute_customerId_status_idx" ON "public"."Dispute"("customerId" ASC, "status" ASC);
CREATE INDEX "Dispute_invoiceId_status_idx" ON "public"."Dispute"("invoiceId" ASC, "status" ASC);
CREATE INDEX "DunningRule_active_stage_idx" ON "public"."DunningRule"("active" ASC, "stage" ASC);
CREATE UNIQUE INDEX "DunningRule_code_key" ON "public"."DunningRule"("code" ASC);
CREATE INDEX "InstallmentPlan_collectionCaseId_idx" ON "public"."InstallmentPlan"("collectionCaseId" ASC);
CREATE INDEX "InstallmentPlan_customerId_status_idx" ON "public"."InstallmentPlan"("customerId" ASC, "status" ASC);
CREATE INDEX "PlanInstallment_dueDate_status_idx" ON "public"."PlanInstallment"("dueDate" ASC, "status" ASC);
CREATE INDEX "PlanInstallment_planId_status_idx" ON "public"."PlanInstallment"("planId" ASC, "status" ASC);
CREATE INDEX "ProvisionRule_active_bucketDays_idx" ON "public"."ProvisionRule"("active" ASC, "bucketDays" ASC);
CREATE UNIQUE INDEX "ProvisionRule_code_key" ON "public"."ProvisionRule"("code" ASC);
CREATE INDEX "WriteOffRequest_customerId_status_idx" ON "public"."WriteOffRequest"("customerId" ASC, "status" ASC);
CREATE INDEX "WriteOffRequest_status_createdAt_idx" ON "public"."WriteOffRequest"("status" ASC, "createdAt" ASC);

