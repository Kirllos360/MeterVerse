import { prisma } from "../src/db.js"
import { auditLog } from "../src/middleware/security.js"

// Mock request object
const mockReq = {
  user: { email: "admin@test.com", sub: "test-user-001" },
  ip: "127.0.0.1",
  headers: { "user-agent": "test-agent" },
  originalUrl: "/api/test",
}

async function test() {
  console.log("═══ Wire Events Test ═══\n")

  // Test events that should trigger notifications
  const events = [
    "customer.created",
    "meter.created",
    "invoice.generated",
    "payment.created",
    "assignment.created",
    "auth.login_failed",
    "auth.login_success",
    "invoice.created",
    "reading.created",
  ]

  for (const event of events) {
    auditLog(mockReq, event, {
      name: "Test User",
      email: "test@example.com",
      number: "INV-001",
      amount: "500",
      serial: "MTR-001",
      customer: "Test User",
      invoiceId: "test-inv-001",
    })
  }

  // Wait for async operations
  await new Promise(r => setTimeout(r, 1000))

  // Check what was created
  const notifs = await prisma.notification.findMany({
    where: { recipientId: "test-user-001" },
    orderBy: { createdAt: "desc" },
  })

  const emails = await prisma.emailLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const auditEntries = await prisma.auditEntry.findMany({
    where: { actorId: "test-user-001" },
    orderBy: { timestamp: "desc" },
    take: 10,
  })

  console.log(`Audit entries: ${auditEntries.length}`)
  console.log(`Notifications created: ${notifs.length}`)
  console.log(`Email logs created: ${emails.length}`)

  if (notifs.length > 0) {
    console.log("\nNotification samples:")
    for (const n of notifs.slice(0, 5)) {
      console.log(`  [${n.status}] ${n.title}: ${n.body.slice(0, 60)}...`)
    }
  }

  if (emails.length > 0) {
    console.log("\nEmail samples:")
    for (const e of emails.slice(0, 3)) {
      console.log(`  [${e.status}] To: ${e.to} | Subject: ${e.subject}`)
    }
  }

  const passed = notifs.length >= 5 && emails.length >= 2
  console.log(`\n${passed ? "✅ PASSED" : "❌ FAILED"} — ${notifs.length} notifications, ${emails.length} emails`)

  await prisma.$disconnect()
  process.exit(passed ? 0 : 1)
}

test().catch(e => { console.error(e); process.exit(1) })
