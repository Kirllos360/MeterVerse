CREATE TABLE "public"."AiModelVersion" (
    "id" TEXT NOT NULL,
    "modelKey" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'STAGING',
    "metrics" TEXT NOT NULL DEFAULT '{}',
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiModelVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."AiRecommendationLog" (
    "id" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'FINANCIAL',
    "impact" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "appliedBy" TEXT,
    "appliedAt" TIMESTAMP(3),
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiRecommendationLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."BusinessHealthScore" (
    "id" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "overall" DOUBLE PRECISION NOT NULL,
    "dimensions" TEXT NOT NULL DEFAULT '{}',
    "drivers" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessHealthScore_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."ExecutiveInsight" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'FINANCIAL',
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "metric" TEXT,
    "value" DOUBLE PRECISION,
    "recommendation" TEXT,
    "periodKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutiveInsight_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."FinancialForecast" (
    "id" TEXT NOT NULL,
    "forecastType" TEXT NOT NULL DEFAULT 'REVENUE',
    "horizon" INTEGER NOT NULL DEFAULT 3,
    "periodKey" TEXT NOT NULL,
    "values" TEXT NOT NULL DEFAULT '[]',
    "confidence" TEXT NOT NULL DEFAULT 'medium',
    "methodology" TEXT NOT NULL DEFAULT 'linear-trend',
    "params" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialForecast_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."FinancialScenario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scenarioType" TEXT NOT NULL DEFAULT 'CUSTOM',
    "adjustments" TEXT NOT NULL DEFAULT '{}',
    "inputs" TEXT NOT NULL DEFAULT '{}',
    "results" TEXT NOT NULL DEFAULT '{}',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialScenario_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."MonteCarloResult" (
    "id" TEXT NOT NULL,
    "forecastType" TEXT NOT NULL DEFAULT 'REVENUE',
    "periodKey" TEXT NOT NULL,
    "iterations" INTEGER NOT NULL DEFAULT 1000,
    "mean" DOUBLE PRECISION NOT NULL,
    "median" DOUBLE PRECISION NOT NULL,
    "p5" DOUBLE PRECISION NOT NULL,
    "p95" DOUBLE PRECISION NOT NULL,
    "stdDev" DOUBLE PRECISION NOT NULL,
    "distribution" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonteCarloResult_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AiModelVersion_modelKey_status_idx" ON "public"."AiModelVersion"("modelKey" ASC, "status" ASC);
CREATE INDEX "AiRecommendationLog_category_status_idx" ON "public"."AiRecommendationLog"("category" ASC, "status" ASC);
CREATE INDEX "AiRecommendationLog_createdAt_idx" ON "public"."AiRecommendationLog"("createdAt" ASC);
CREATE INDEX "BusinessHealthScore_periodKey_idx" ON "public"."BusinessHealthScore"("periodKey" ASC);
CREATE UNIQUE INDEX "BusinessHealthScore_periodKey_key" ON "public"."BusinessHealthScore"("periodKey" ASC);
CREATE INDEX "ExecutiveInsight_category_createdAt_idx" ON "public"."ExecutiveInsight"("category" ASC, "createdAt" ASC);
CREATE INDEX "FinancialForecast_createdAt_idx" ON "public"."FinancialForecast"("createdAt" ASC);
CREATE INDEX "FinancialForecast_forecastType_periodKey_idx" ON "public"."FinancialForecast"("forecastType" ASC, "periodKey" ASC);
CREATE INDEX "MonteCarloResult_forecastType_periodKey_idx" ON "public"."MonteCarloResult"("forecastType" ASC, "periodKey" ASC);

