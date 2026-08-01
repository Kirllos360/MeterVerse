CREATE TABLE "public"."ArchitectureDecisionRecord" (
    "id" TEXT NOT NULL,
    "adrNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "context" TEXT,
    "decision" TEXT,
    "consequences" TEXT,
    "alternatives" TEXT,
    "relatedPrograms" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "supersededBy" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchitectureDecisionRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."BusinessRisk" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'OPERATIONAL',
    "likelihood" INTEGER NOT NULL DEFAULT 3,
    "impact" INTEGER NOT NULL DEFAULT 3,
    "inherentRisk" INTEGER,
    "residualRisk" INTEGER,
    "mitigation" TEXT,
    "contingency" TEXT,
    "owner" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IDENTIFIED',
    "lastReviewAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessRisk_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."ComplianceObligation" (
    "id" TEXT NOT NULL,
    "framework" TEXT NOT NULL DEFAULT 'ISO27001',
    "controlId" TEXT NOT NULL,
    "controlName" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOT_ASSESSED',
    "evidence" TEXT,
    "assessor" TEXT,
    "assessedAt" TIMESTAMP(3),
    "remediationPlan" TEXT,
    "dueDate" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceObligation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."GovernanceAuditFinding" (
    "id" TEXT NOT NULL,
    "auditType" TEXT NOT NULL DEFAULT 'INTERNAL',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "findingType" TEXT NOT NULL DEFAULT 'CONTROL',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "remediationPlan" TEXT,
    "evidence" TEXT,
    "dueDate" TIMESTAMP(3),
    "owner" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernanceAuditFinding_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."GovernanceDecision" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "decisionType" TEXT NOT NULL DEFAULT 'TACTICAL',
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "options" TEXT,
    "rationale" TEXT,
    "impactAnalysis" TEXT,
    "decidedBy" TEXT,
    "decidedAt" TIMESTAMP(3),
    "relatedDecisions" TEXT,
    "linkedRequirements" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernanceDecision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."GovernanceException" (
    "id" TEXT NOT NULL,
    "standardId" TEXT,
    "policyId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "justification" TEXT,
    "scope" TEXT,
    "duration" TEXT,
    "riskAssessment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "mitigationPlan" TEXT,
    "requestedBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernanceException_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."GovernancePolicy" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "category" TEXT NOT NULL DEFAULT 'OPERATIONAL',
    "description" TEXT,
    "rules" TEXT,
    "applicability" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "enforcementLevel" TEXT NOT NULL DEFAULT 'MANDATORY',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "supersedesId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernancePolicy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."GovernanceStandard" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "category" TEXT NOT NULL DEFAULT 'ARCHITECTURE',
    "description" TEXT,
    "content" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "supersedesId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernanceStandard_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."GovernanceWaiver" (
    "id" TEXT NOT NULL,
    "policyId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "waiverType" TEXT NOT NULL DEFAULT 'TEMPORARY',
    "justification" TEXT,
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernanceWaiver_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."TechnicalDebtItem" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'REVIEW',
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'CODE',
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "estimatedEffort" INTEGER,
    "interestRate" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "linkedProgram" TEXT,
    "owner" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnicalDebtItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ArchitectureDecisionRecord_adrNumber_key" ON "public"."ArchitectureDecisionRecord"("adrNumber" ASC);
CREATE INDEX "ArchitectureDecisionRecord_status_approvedAt_idx" ON "public"."ArchitectureDecisionRecord"("status" ASC, "approvedAt" ASC);
CREATE INDEX "BusinessRisk_category_status_idx" ON "public"."BusinessRisk"("category" ASC, "status" ASC);
CREATE INDEX "BusinessRisk_status_nextReviewAt_idx" ON "public"."BusinessRisk"("status" ASC, "nextReviewAt" ASC);
CREATE UNIQUE INDEX "ComplianceObligation_framework_controlId_key" ON "public"."ComplianceObligation"("framework" ASC, "controlId" ASC);
CREATE INDEX "ComplianceObligation_framework_status_idx" ON "public"."ComplianceObligation"("framework" ASC, "status" ASC);
CREATE INDEX "ComplianceObligation_status_dueDate_idx" ON "public"."ComplianceObligation"("status" ASC, "dueDate" ASC);
CREATE INDEX "GovernanceAuditFinding_auditType_createdAt_idx" ON "public"."GovernanceAuditFinding"("auditType" ASC, "createdAt" ASC);
CREATE INDEX "GovernanceAuditFinding_severity_status_idx" ON "public"."GovernanceAuditFinding"("severity" ASC, "status" ASC);
CREATE INDEX "GovernanceAuditFinding_status_dueDate_idx" ON "public"."GovernanceAuditFinding"("status" ASC, "dueDate" ASC);
CREATE INDEX "GovernanceDecision_decisionType_status_idx" ON "public"."GovernanceDecision"("decisionType" ASC, "status" ASC);
CREATE UNIQUE INDEX "GovernanceDecision_reference_key" ON "public"."GovernanceDecision"("reference" ASC);
CREATE INDEX "GovernanceDecision_status_decidedAt_idx" ON "public"."GovernanceDecision"("status" ASC, "decidedAt" ASC);
CREATE INDEX "GovernanceException_policyId_status_idx" ON "public"."GovernanceException"("policyId" ASC, "status" ASC);
CREATE INDEX "GovernanceException_standardId_status_idx" ON "public"."GovernanceException"("standardId" ASC, "status" ASC);
CREATE INDEX "GovernanceException_status_expiresAt_idx" ON "public"."GovernanceException"("status" ASC, "expiresAt" ASC);
CREATE INDEX "GovernancePolicy_category_status_idx" ON "public"."GovernancePolicy"("category" ASC, "status" ASC);
CREATE UNIQUE INDEX "GovernancePolicy_code_key" ON "public"."GovernancePolicy"("code" ASC);
CREATE INDEX "GovernancePolicy_status_nextReviewAt_idx" ON "public"."GovernancePolicy"("status" ASC, "nextReviewAt" ASC);
CREATE INDEX "GovernanceStandard_category_status_idx" ON "public"."GovernanceStandard"("category" ASC, "status" ASC);
CREATE UNIQUE INDEX "GovernanceStandard_code_key" ON "public"."GovernanceStandard"("code" ASC);
CREATE INDEX "GovernanceStandard_status_approvedAt_idx" ON "public"."GovernanceStandard"("status" ASC, "approvedAt" ASC);
CREATE INDEX "GovernanceWaiver_status_expiresAt_idx" ON "public"."GovernanceWaiver"("status" ASC, "expiresAt" ASC);
CREATE INDEX "TechnicalDebtItem_category_severity_idx" ON "public"."TechnicalDebtItem"("category" ASC, "severity" ASC);
CREATE INDEX "TechnicalDebtItem_status_createdAt_idx" ON "public"."TechnicalDebtItem"("status" ASC, "createdAt" ASC);

