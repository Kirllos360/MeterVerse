CREATE TABLE "public"."Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "currentVersionId" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "storedFileId" TEXT,
    "customerId" TEXT,
    "areaId" TEXT,
    "projectId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "retentionPolicyId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."DocumentApproval" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "approverId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentApproval_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."DocumentCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "DocumentCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."DocumentComment" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."DocumentDocumentTag" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "DocumentDocumentTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."DocumentTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."DocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "storedFileId" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "checksum" TEXT,
    "changeNote" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."RetentionPolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "retentionDays" INTEGER,
    "action" TEXT NOT NULL DEFAULT 'ARCHIVE',
    "legalHold" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "RetentionPolicy_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Document_areaId_createdAt_idx" ON "public"."Document"("areaId" ASC, "createdAt" ASC);
CREATE INDEX "Document_categoryId_status_idx" ON "public"."Document"("categoryId" ASC, "status" ASC);
CREATE INDEX "Document_customerId_idx" ON "public"."Document"("customerId" ASC);
CREATE INDEX "Document_projectId_idx" ON "public"."Document"("projectId" ASC);
CREATE INDEX "Document_storedFileId_idx" ON "public"."Document"("storedFileId" ASC);
CREATE INDEX "DocumentApproval_documentId_status_idx" ON "public"."DocumentApproval"("documentId" ASC, "status" ASC);
CREATE UNIQUE INDEX "DocumentCategory_code_key" ON "public"."DocumentCategory"("code" ASC);
CREATE UNIQUE INDEX "DocumentCategory_name_key" ON "public"."DocumentCategory"("name" ASC);
CREATE INDEX "DocumentComment_documentId_idx" ON "public"."DocumentComment"("documentId" ASC);
CREATE UNIQUE INDEX "DocumentDocumentTag_documentId_tagId_key" ON "public"."DocumentDocumentTag"("documentId" ASC, "tagId" ASC);
CREATE UNIQUE INDEX "DocumentTag_name_key" ON "public"."DocumentTag"("name" ASC);
CREATE INDEX "DocumentVersion_documentId_idx" ON "public"."DocumentVersion"("documentId" ASC);
CREATE UNIQUE INDEX "DocumentVersion_documentId_versionNumber_key" ON "public"."DocumentVersion"("documentId" ASC, "versionNumber" ASC);
CREATE UNIQUE INDEX "RetentionPolicy_code_key" ON "public"."RetentionPolicy"("code" ASC);

