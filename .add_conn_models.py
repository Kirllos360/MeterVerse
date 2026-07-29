with open(r'D:\meter\backend\prisma\schema.prisma', 'r') as f:
    content = f.read()

conn_models = """

model ConnectionProfile {
  id              String   @id @default(uuid())
  name            String
  description     String?
  status          String   @default("draft")
  active          Boolean  @default(false)
  priority        Int      @default(1)

  // TCP Configuration
  host            String
  port            Int      @default(9000)
  tlsEnabled      Boolean  @default(true)
  keepAlive       Int      @default(60)
  heartbeatInterval Int    @default(30)
  connTimeout     Int      @default(10)
  queryTimeout    Int      @default(30)

  // DB Configuration
  dbType          String   @default("postgresql")
  dbHost          String
  dbPort          Int
  dbName          String
  dbSchema        String   @default("public")
  dbSsl           Boolean  @default(true)
  dbUser          String

  // FK relationships
  areaId          String
  projectId       String?
  gatewayId       String?
  templateId      String?
  createdBy       String?
  approvedBy      String?
  version         Int      @default(1)
  approvedAt      DateTime?

  // Lifecycle
  lastTestedAt    DateTime?
  lastSyncAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  archivedAt      DateTime?

  // Relations
  credentials     ConnectionCredential?
  backups         BackupConfig[]
  healthChecks    HealthCheck[]
  syncLogs        SyncLog[]
  connectionTests ConnectionTest[]

  @@unique([name, areaId])
  @@index([areaId, status])
  @@index([status, active])
}

model ConnectionCredential {
  id                  String   @id @default(uuid())
  connectionProfileId String   @unique
  connectionProfile   ConnectionProfile @relation(fields: [connectionProfileId], references: [id], onDelete: Cascade)
  password            String
  dbPassword          String
  tlsKey              String?
  keyVersion          Int      @default(1)
  rotatedAt           DateTime?
  createdAt           DateTime @default(now())
}

model BackupConfig {
  id                  String   @id @default(uuid())
  connectionProfileId String
  connectionProfile   ConnectionProfile @relation(fields: [connectionProfileId], references: [id], onDelete: Cascade)
  host                String
  port                Int
  tlsEnabled          Boolean  @default(true)
  priority            Int      @default(1)
  isActive            Boolean  @default(false)
  lastUsedAt          DateTime?
  createdAt           DateTime @default(now())

  @@index([connectionProfileId, priority])
}

model HealthCheck {
  id                  String   @id @default(uuid())
  connectionProfileId String
  connectionProfile   ConnectionProfile @relation(fields: [connectionProfileId], references: [id], onDelete: Cascade)
  status              String   @default("ok")
  latencyMs           Int      @default(0)
  error               String?
  checkedAt           DateTime @default(now())

  @@index([connectionProfileId, checkedAt])
}

model SyncLog {
  id                  String   @id @default(uuid())
  connectionProfileId String
  connectionProfile   ConnectionProfile @relation(fields: [connectionProfileId], references: [id], onDelete: Cascade)
  syncType            String   @default("incremental")
  status              String   @default("running")
  recordsProcessed    Int      @default(0)
  recordsFailed       Int      @default(0)
  durationMs          Int      @default(0)
  error               String?
  startedAt           DateTime @default(now())
  completedAt         DateTime?

  @@index([connectionProfileId, startedAt])
}

model ConnectionTest {
  id                  String   @id @default(uuid())
  connectionProfileId String
  connectionProfile   ConnectionProfile @relation(fields: [connectionProfileId], references: [id], onDelete: Cascade)
  testType            String   @default("tcp")
  status              String   @default("pending")
  latencyMs           Int      @default(0)
  details             String?
  testedAt            DateTime @default(now())

  @@index([connectionProfileId, testedAt])
}

model ConnectionTemplate {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  config      String   @default("{}")
  category    String   @default("general")
  createdBy   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
"""

# Insert after Gateway model (find its end)
pos = content.find('model ConnectionProfile')
if pos < 0:
    gateway_end = content.index('}', content.index('model Gateway {'))
    end_of_gateway = content.index('}', gateway_end + 1) + 1
    content = content[:end_of_gateway] + conn_models + content[end_of_gateway:]
    print("Added Connectivity Center models after Gateway")
else:
    print("Models already exist, skipping")

with open(r'D:\meter\backend\prisma\schema.prisma', 'w') as f:
    f.write(content)
