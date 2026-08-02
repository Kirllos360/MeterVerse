CREATE TABLE "public"."Conversation" (
    "id" TEXT NOT NULL,
    "subject" TEXT,
    "type" TEXT NOT NULL DEFAULT 'INTERNAL',
    "customerId" TEXT,
    "areaId" TEXT,
    "projectId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "participantIds" TEXT NOT NULL DEFAULT '[]',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."DeliveryAttempt" (
    "id" TEXT NOT NULL,
    "messageId" TEXT,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "providerResponse" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT,
    "body" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "channel" TEXT NOT NULL DEFAULT 'in_app',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "channels" TEXT NOT NULL DEFAULT '["in_app"]',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Conversation_areaId_updatedAt_idx" ON "public"."Conversation"("areaId" ASC, "updatedAt" ASC);
CREATE INDEX "Conversation_customerId_idx" ON "public"."Conversation"("customerId" ASC);
CREATE INDEX "Conversation_type_status_idx" ON "public"."Conversation"("type" ASC, "status" ASC);
CREATE INDEX "DeliveryAttempt_channel_status_idx" ON "public"."DeliveryAttempt"("channel" ASC, "status" ASC);
CREATE INDEX "DeliveryAttempt_recipient_createdAt_idx" ON "public"."DeliveryAttempt"("recipient" ASC, "createdAt" ASC);
CREATE INDEX "Message_conversationId_createdAt_idx" ON "public"."Message"("conversationId" ASC, "createdAt" ASC);
CREATE INDEX "Message_senderId_idx" ON "public"."Message"("senderId" ASC);
CREATE UNIQUE INDEX "NotificationPreference_userId_category_key" ON "public"."NotificationPreference"("userId" ASC, "category" ASC);
CREATE INDEX "NotificationPreference_userId_idx" ON "public"."NotificationPreference"("userId" ASC);

