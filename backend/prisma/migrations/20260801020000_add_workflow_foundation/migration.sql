CREATE TABLE "public"."ApprovalDecision" (
    "id" TEXT NOT NULL,
    "approvalId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "approverName" TEXT,
    "decision" TEXT NOT NULL,
    "comment" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "ApprovalDecision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."ApprovalRequest" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'SEQUENTIAL',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approverIds" TEXT NOT NULL DEFAULT '[]',
    "currentIndex" INTEGER NOT NULL DEFAULT 0,
    "threshold" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "requestedBy" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."WorkflowDefinition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "domain" TEXT NOT NULL DEFAULT 'GENERAL',
    "trigger" TEXT NOT NULL DEFAULT 'MANUAL',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "tenantId" TEXT,
    "createdBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "variables" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."WorkflowEdge" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "fromNodeId" TEXT,
    "toNodeId" TEXT,
    "condition" TEXT,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "WorkflowEdge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."WorkflowInstance" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "tenantId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "currentNode" TEXT,
    "variables" TEXT NOT NULL DEFAULT '{}',
    "correlationId" TEXT,
    "startedBy" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "WorkflowInstance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."WorkflowNode" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL DEFAULT 'TASK',
    "name" TEXT NOT NULL,
    "config" TEXT NOT NULL DEFAULT '{}',
    "positionX" DOUBLE PRECISION,
    "positionY" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "WorkflowNode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."WorkflowTask" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "nodeId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'HUMAN',
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "assigneeId" TEXT,
    "payload" TEXT NOT NULL DEFAULT '{}',
    "result" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "WorkflowTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."WorkflowVersion" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "nodes" TEXT NOT NULL DEFAULT '[]',
    "edges" TEXT NOT NULL DEFAULT '[]',
    "policies" TEXT NOT NULL DEFAULT '{}',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "WorkflowVersion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ApprovalDecision_approvalId_idx" ON "public"."ApprovalDecision"("approvalId" ASC);
CREATE INDEX "ApprovalDecision_approverId_idx" ON "public"."ApprovalDecision"("approverId" ASC);
CREATE INDEX "ApprovalRequest_instanceId_idx" ON "public"."ApprovalRequest"("instanceId" ASC);
CREATE INDEX "ApprovalRequest_status_requestedAt_idx" ON "public"."ApprovalRequest"("status" ASC, "requestedAt" ASC);
CREATE INDEX "WorkflowDefinition_code_idx" ON "public"."WorkflowDefinition"("code" ASC);
CREATE UNIQUE INDEX "WorkflowDefinition_code_key" ON "public"."WorkflowDefinition"("code" ASC);
CREATE INDEX "WorkflowDefinition_domain_status_idx" ON "public"."WorkflowDefinition"("domain" ASC, "status" ASC);
CREATE INDEX "WorkflowEdge_versionId_idx" ON "public"."WorkflowEdge"("versionId" ASC);
CREATE INDEX "WorkflowInstance_correlationId_idx" ON "public"."WorkflowInstance"("correlationId" ASC);
CREATE INDEX "WorkflowInstance_tenantId_status_idx" ON "public"."WorkflowInstance"("tenantId" ASC, "status" ASC);
CREATE INDEX "WorkflowInstance_versionId_status_idx" ON "public"."WorkflowInstance"("versionId" ASC, "status" ASC);
CREATE INDEX "WorkflowNode_versionId_idx" ON "public"."WorkflowNode"("versionId" ASC);
CREATE INDEX "WorkflowTask_assigneeId_status_idx" ON "public"."WorkflowTask"("assigneeId" ASC, "status" ASC);
CREATE INDEX "WorkflowTask_instanceId_idx" ON "public"."WorkflowTask"("instanceId" ASC);
CREATE INDEX "WorkflowVersion_definitionId_status_idx" ON "public"."WorkflowVersion"("definitionId" ASC, "status" ASC);
CREATE UNIQUE INDEX "WorkflowVersion_definitionId_versionNumber_key" ON "public"."WorkflowVersion"("definitionId" ASC, "versionNumber" ASC);

