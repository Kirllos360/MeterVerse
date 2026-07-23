import { prisma } from "../src/db.js"
import { processEvent } from "../src/services/notification-engine.js"

async function runTest() {
  console.log("═══ Notification Engine Test ═══\n")

  // Ensure template exists
  const template = await prisma.notificationTemplate.upsert({
    where: { key: "invoice.generated" },
    update: {},
    create: {
      key: "invoice.generated",
      name: "Invoice Generated",
      type: "email",
      subject: "Invoice #{number} Generated",
      body: "Invoice #{number} for {amount} EGP has been generated for {customer}.",
      variables: JSON.stringify(["number", "amount", "customer"]),
    },
  })
  console.log(`  ✅ Template: ${template.key} (${template.id.slice(0, 8)}...)`)

  // Test 1: Process invoice.generated event
  const result = await processEvent("invoice.generated", {
    number: "INV-2026-001",
    amount: "1250.00",
    customer: "Test Customer",
    recipientId: "test-user-001",
    recipientEmail: "test@example.com",
  })
  console.log(`\n  Test 1: invoice.generated`)
  console.log(`    Skipped: ${result.skipped || false}`)
  console.log(`    Channels: ${result.channels?.join(", ") || "none"}`)
  console.log(`    Results: ${result.results?.length || 0} records created`)
  if (result.results) {
    for (const r of result.results) {
      console.log(`      → ${r.channel}: ${r.id?.slice(0,8) || "N/A"}... (${r.status})`)
    }
  }

  // Test 2: Unmapped event should skip
  const result2 = await processEvent("unknown.event", {})
  console.log(`\n  Test 2: unknown.event`)
  console.log(`    Skipped: ${result2.skipped}`)
  console.log(`    Reason: ${result2.reason}`)

  // Test 3: Event with no template should skip
  const result3 = await processEvent("auth.login_success", { recipientId: "test-user-001" })
  console.log(`\n  Test 3: auth.login_success (no template yet)`)
  console.log(`    Skipped: ${result3.skipped}`)
  console.log(`    Reason: ${result3.reason}`)

  // Verify DB records
  const notifications = await prisma.notification.findMany({
    where: { recipientId: "test-user-001" },
    orderBy: { createdAt: "desc" },
    take: 3,
  })
  console.log(`\n  DB Verification: ${notifications.length} notifications created`)
  for (const n of notifications) {
    console.log(`    → ${n.title}: ${n.body.slice(0, 60)}... (${n.status})`)
  }

  console.log(`\n═══ Test Complete ═══`)
}

runTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
