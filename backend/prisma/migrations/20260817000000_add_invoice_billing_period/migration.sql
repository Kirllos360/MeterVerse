-- Add billing period columns to Invoice (Solar vertical gate G13)
ALTER TABLE "Invoice" ADD COLUMN "billingPeriodStart" TIMESTAMP(3);
ALTER TABLE "Invoice" ADD COLUMN "billingPeriodEnd" TIMESTAMP(3);
