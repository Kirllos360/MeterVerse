import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// ─── Active System Enablement: operational demo seed (idempotent) ────────────
// Creates: 5 role users, 20+ customers, 50+ meters, 30+ service connections,
// 100+ readings, 50+ invoices, 20+ payments. Prefixes P50-OPER to enable
// idempotent cleanup/re-run.

const PREFIX = "P50-OPER"
const now = new Date()

async function main() {
  console.log("Seeding active-system operational dataset...")

  // 1) Role users
  const roleUsers = [
    { email: "ops.manager@meterverse.com", password: "Ops@123456", name: "Operations Manager", role: "area_manager" },
    { email: "billing.user@meterverse.com", password: "Bill@123456", name: "Billing User", role: "billing" },
    { email: "support.user@meterverse.com", password: "Supp@123456", name: "Support User", role: "viewer" },
    { email: "portal.user@meterverse.com", password: "Portal@123456", name: "Portal User", role: "viewer" },
  ]
  for (const u of roleUsers) {
    const hashed = await bcrypt.hash(u.password, 10)
    await prisma.user.upsert({ where: { email: u.email }, update: { role: u.role, password: hashed }, create: { email: u.email, password: hashed, name: u.name, role: u.role, status: "active", emailVerified: true } })
  }
  console.log("  ✅ 4 role users (System Admin exists)")

  // 2) Areas
  const areaDefs = [{ name: "October", code: "OCT" }, { name: "New Cairo", code: "NEW" }, { name: "SODIC", code: "SOD" }]
  const areaIds = {}
  for (const a of areaDefs) {
    const rec = await prisma.area.upsert({ where: { code: a.code }, update: {}, create: { name: a.name, code: a.code } })
    areaIds[a.code] = rec.id
  }
  console.log("  ✅ 3 areas")

  // 3) Customers (25)
  const customerNames = ["Ahmed El-Sayed", "Mariam Ibrahim", "Hossam Mahmoud", "Laila Mostafa", "Tamer Fathy",
    "Nadia Lotfy", "Omar Khaled", "Sara Adel", "Youssef Nabil", "Dina Hassan",
    "Karim Youssef", "Mona Said", "Sherif Aly", "Rania Fouad", "Mostafa Kamel",
    "Heba Samir", "Amr Diab", "Salma Nour", "Hany Fawzy", "Ghada Tarek",
    "Tarek Zaki", "Maha Soliman", "Wael Ezzat", "Farida Ashraf", "Ibrahim Nasr"]
  const customerIds = []
  for (let i = 0; i < customerNames.length; i++) {
    const email = `${PREFIX}.cust${i}@example.com`
    const existing = await prisma.customer.findFirst({ where: { email } })
    if (existing) { customerIds.push(existing.id); continue }
    const c = await prisma.customer.create({ data: { name: customerNames[i], email, phone: `0100${String(10000000 + i * 137)}`, address: `Area ${["October", "New Cairo", "SODIC"][i % 3]} — Building ${i + 1}`, status: "active", areaId: areaIds[["OCT", "NEW", "SOD"][i % 3]] } })
    customerIds.push(c.id)
  }
  console.log(`  ✅ ${customerIds.length} customers`)

  // 4) Meters (60) + assignments + service connections
  const meterIds = []
  const mtype = await prisma.meterType.findFirst()
  for (let i = 0; i < 60; i++) {
    const serial = `${PREFIX}-M-${String(i + 1).padStart(4, "0")}`
    const existing = await prisma.meter.findFirst({ where: { serial } })
    if (existing) { meterIds.push(existing.id); continue }
    const cust = customerIds[i % customerIds.length]
    const m = await prisma.meter.create({
      data: { serial, type: mtype?.name || "electric", area: ["October", "New Cairo", "SODIC"][i % 3], areaId: areaIds[["OCT", "NEW", "SOD"][i % 3]], customerId: cust, status: "active", meterTypeId: mtype?.id },
    })
    meterIds.push(m.id)
    await prisma.serviceConnection.upsert({
      where: { id: `${PREFIX}-sc-${i}` },
      update: {},
      create: { id: `${PREFIX}-sc-${i}`, meterId: m.id, customerId: cust, type: "main", status: "active", startDate: new Date(now.getFullYear(), now.getMonth() - 6, 1) },
    }).catch(() => {})
  }
  console.log(`  ✅ ${meterIds.length} meters + service connections`)

  // 5) Readings (150) — 3 per meter across 3 months
  let readingCount = 0
  for (let i = 0; i < meterIds.length; i++) {
    const mid = meterIds[i]
    let prev = 0
    for (let month = 2; month >= 0; month--) {
      const d = new Date(now.getFullYear(), now.getMonth() - month, 15)
      const ts = d.toISOString()
      const existing = await prisma.reading.findFirst({ where: { meterId: mid, timestamp: new Date(ts) } })
      if (existing) { prev = existing.value; readingCount++; continue }
      const value = prev + 80 + (i * 7 % 90)
      await prisma.reading.create({ data: { meterId: mid, value, unit: "kWh", source: "p50-seed", status: "valid", timestamp: new Date(ts) } })
      prev = value
      readingCount++
    }
  }
  console.log(`  ✅ ${readingCount} readings`)

  // 6) Invoices (60) + payments (25)
  let invCount = 0, payCount = 0
  for (let i = 0; i < 60; i++) {
    const cust = customerIds[i % customerIds.length]
    const number = `${PREFIX}-INV-${String(i + 1).padStart(4, "0")}`
    const existingInv = await prisma.invoice.findFirst({ where: { number } })
    if (existingInv) { invCount++; continue }
    const amount = 300 + (i * 47 % 900)
    await prisma.invoice.create({ data: { number, customerId: cust, amount, status: i < 40 ? "paid" : "issued", dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 15), paidAmount: i < 40 ? amount : 0, paidAt: i < 40 ? now : null } })
    invCount++
    if (i < 25) {
      await prisma.payment.create({ data: { customerId: cust, amount, method: ["cash", "bank_transfer", "card"][i % 3], status: "completed" } })
      payCount++
    }
  }
  console.log(`  ✅ ${invCount} invoices, ${payCount} payments`)

  console.log("Active-system operational seed complete.")
}

main().catch(e => { console.error("SEED ERROR:", e.message); process.exit(1) }).finally(() => prisma.$disconnect())
