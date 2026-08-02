CREATE TABLE "public"."Consumption" (
    "id" TEXT NOT NULL,
    "meterId" TEXT NOT NULL,
    "fromReadingId" TEXT,
    "toReadingId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'kWh',
    "source" TEXT NOT NULL DEFAULT 'calculated',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "validationNote" TEXT,
    "invoiceId" TEXT,
    "areaId" TEXT,
    "projectId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Consumption_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Consumption_areaId_periodStart_idx" ON "public"."Consumption"("areaId" ASC, "periodStart" ASC);
CREATE INDEX "Consumption_invoiceId_idx" ON "public"."Consumption"("invoiceId" ASC);
CREATE INDEX "Consumption_meterId_periodStart_periodEnd_idx" ON "public"."Consumption"("meterId" ASC, "periodStart" ASC, "periodEnd" ASC);
CREATE UNIQUE INDEX "Consumption_meterId_periodStart_periodEnd_key" ON "public"."Consumption"("meterId" ASC, "periodStart" ASC, "periodEnd" ASC);
CREATE INDEX "Consumption_meterId_status_idx" ON "public"."Consumption"("meterId" ASC, "status" ASC);
CREATE INDEX "Consumption_projectId_periodStart_idx" ON "public"."Consumption"("projectId" ASC, "periodStart" ASC);

