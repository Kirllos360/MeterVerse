CREATE TABLE "public"."CustomerTariff" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "tariffVersionId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "assignedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "CustomerTariff_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."TariffChangeLog" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "changedBy" TEXT,
    "changeType" TEXT NOT NULL DEFAULT 'UPDATE',
    "summary" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TariffChangeLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."TariffDemandRate" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kW',
    "threshold" DOUBLE PRECISION,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TariffDemandRate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."TariffFixedCharge" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TariffFixedCharge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."TariffTax" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "amount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TariffTax_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."TariffToUSchedule" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL DEFAULT 'ALL',
    "startHour" INTEGER NOT NULL,
    "endHour" INTEGER NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TariffToUSchedule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."TariffVersion" (
    "id" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "label" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "baseRate" DOUBLE PRECISION,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TariffVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."TariffVersionRate" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kWh',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TariffVersionRate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."TariffVersionTier" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "rate" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kWh',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TariffVersionTier_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomerTariff_customerId_status_idx" ON "public"."CustomerTariff"("customerId" ASC, "status" ASC);
CREATE INDEX "CustomerTariff_effectiveFrom_status_idx" ON "public"."CustomerTariff"("effectiveFrom" ASC, "status" ASC);
CREATE INDEX "CustomerTariff_tariffVersionId_idx" ON "public"."CustomerTariff"("tariffVersionId" ASC);
CREATE INDEX "TariffChangeLog_versionId_idx" ON "public"."TariffChangeLog"("versionId" ASC);
CREATE INDEX "TariffDemandRate_versionId_idx" ON "public"."TariffDemandRate"("versionId" ASC);
CREATE INDEX "TariffFixedCharge_versionId_idx" ON "public"."TariffFixedCharge"("versionId" ASC);
CREATE INDEX "TariffTax_versionId_idx" ON "public"."TariffTax"("versionId" ASC);
CREATE INDEX "TariffToUSchedule_versionId_dayOfWeek_idx" ON "public"."TariffToUSchedule"("versionId" ASC, "dayOfWeek" ASC);
CREATE INDEX "TariffVersion_effectiveFrom_status_idx" ON "public"."TariffVersion"("effectiveFrom" ASC, "status" ASC);
CREATE INDEX "TariffVersion_tariffId_status_idx" ON "public"."TariffVersion"("tariffId" ASC, "status" ASC);
CREATE UNIQUE INDEX "TariffVersion_tariffId_versionNumber_key" ON "public"."TariffVersion"("tariffId" ASC, "versionNumber" ASC);
CREATE INDEX "TariffVersionRate_versionId_idx" ON "public"."TariffVersionRate"("versionId" ASC);
CREATE INDEX "TariffVersionTier_versionId_idx" ON "public"."TariffVersionTier"("versionId" ASC);

