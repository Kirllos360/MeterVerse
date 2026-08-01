CREATE TABLE "public"."EnvironmentProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "envType" TEXT NOT NULL DEFAULT 'DEV',
    "config" TEXT NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnvironmentProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'STARTER',
    "priceMonthly" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priceAnnual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "features" TEXT NOT NULL DEFAULT '{}',
    "limits" TEXT NOT NULL DEFAULT '{}',
    "supportLevel" TEXT NOT NULL DEFAULT 'STANDARD',
    "slaLevel" DOUBLE PRECISION NOT NULL DEFAULT 99.5,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'UTILITY',
    "countryId" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Cairo',
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "status" TEXT NOT NULL DEFAULT 'TRIAL',
    "lifecycleStatus" TEXT NOT NULL DEFAULT 'ONBOARDING',
    "isolationStrategy" TEXT NOT NULL DEFAULT 'ROW_LEVEL',
    "dataResidency" TEXT,
    "maxMeters" INTEGER NOT NULL DEFAULT 10000,
    "maxUsers" INTEGER NOT NULL DEFAULT 100,
    "maxStorage" INTEGER NOT NULL DEFAULT 10240,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "branding" TEXT NOT NULL DEFAULT '{}',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."TenantSetting" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "TenantSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."TenantSubscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TRIAL',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trialEndsAt" TIMESTAMP(3),
    "renewsAt" TIMESTAMP(3),
    "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "seats" INTEGER NOT NULL DEFAULT 1,
    "addOns" TEXT NOT NULL DEFAULT '{}',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "promoCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "TenantSubscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."UsageMeter" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'count',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageMeter_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EnvironmentProfile_code_key" ON "public"."EnvironmentProfile"("code" ASC);
CREATE INDEX "EnvironmentProfile_envType_active_idx" ON "public"."EnvironmentProfile"("envType" ASC, "active" ASC);
CREATE UNIQUE INDEX "EnvironmentProfile_name_key" ON "public"."EnvironmentProfile"("name" ASC);
CREATE UNIQUE INDEX "SubscriptionPlan_code_key" ON "public"."SubscriptionPlan"("code" ASC);
CREATE INDEX "SubscriptionPlan_tier_active_idx" ON "public"."SubscriptionPlan"("tier" ASC, "active" ASC);
CREATE INDEX "Tenant_countryId_idx" ON "public"."Tenant"("countryId" ASC);
CREATE INDEX "Tenant_slug_idx" ON "public"."Tenant"("slug" ASC);
CREATE UNIQUE INDEX "Tenant_slug_key" ON "public"."Tenant"("slug" ASC);
CREATE INDEX "Tenant_status_lifecycleStatus_idx" ON "public"."Tenant"("status" ASC, "lifecycleStatus" ASC);
CREATE INDEX "TenantSetting_tenantId_category_idx" ON "public"."TenantSetting"("tenantId" ASC, "category" ASC);
CREATE UNIQUE INDEX "TenantSetting_tenantId_key_key" ON "public"."TenantSetting"("tenantId" ASC, "key" ASC);
CREATE INDEX "TenantSubscription_planId_idx" ON "public"."TenantSubscription"("planId" ASC);
CREATE INDEX "TenantSubscription_status_renewsAt_idx" ON "public"."TenantSubscription"("status" ASC, "renewsAt" ASC);
CREATE INDEX "TenantSubscription_tenantId_status_idx" ON "public"."TenantSubscription"("tenantId" ASC, "status" ASC);
CREATE INDEX "UsageMeter_tenantId_metric_periodEnd_idx" ON "public"."UsageMeter"("tenantId" ASC, "metric" ASC, "periodEnd" ASC);
CREATE UNIQUE INDEX "UsageMeter_tenantId_metric_periodStart_periodEnd_key" ON "public"."UsageMeter"("tenantId" ASC, "metric" ASC, "periodStart" ASC, "periodEnd" ASC);

