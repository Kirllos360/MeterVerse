-- P59-C/LR-2: Settlement Engine (recovered from legacy Collection System)
-- Additive only — does not touch existing tables or the frozen P59-B population.

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "type" TEXT NOT NULL DEFAULT 'fixed',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceSettlement" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvoiceSettlement_invoiceId_idx" ON "InvoiceSettlement"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceSettlement_settlementId_idx" ON "InvoiceSettlement"("settlementId");

-- AddForeignKey
ALTER TABLE "InvoiceSettlement" ADD CONSTRAINT "InvoiceSettlement_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceSettlement" ADD CONSTRAINT "InvoiceSettlement_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "Settlement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
