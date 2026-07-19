import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  const password = await bcrypt.hash("admin", 10)

  await prisma.user.upsert({
    where: { email: "admin@meterverse.com" },
    update: {},
    create: { email: "admin@meterverse.com", password, name: "Admin User", role: "admin" },
  })

  await prisma.user.upsert({
    where: { email: "operator@meterverse.com" },
    update: {},
    create: { email: "operator@meterverse.com", password, name: "Operator User", role: "operator" },
  })

  const customer = await prisma.customer.create({ data: { name: "Palm Hills Development", email: "billing@palmhills.com", area: "October" } })
  const meter = await prisma.meter.create({ data: { serial: "MV-10001", type: "Electric", location: "Building A", customerId: customer.id } })

  for (let i = 0; i < 30; i++) {
    await prisma.reading.create({
      data: { meterId: meter.id, value: 100 + Math.random() * 900, timestamp: new Date(Date.now() - i * 86400000) },
    })
  }

  const invoice = await prisma.invoice.create({
    data: { number: "INV-2026-001", customerId: customer.id, amount: 1250.00, status: "pending", dueDate: new Date("2026-08-15") },
  })

  await prisma.payment.create({
    data: { invoiceId: invoice.id, amount: 1250.00, method: "bank_transfer" },
  })

  console.log("Seed complete")
}

main().catch(console.error).finally(() => prisma.$disconnect())
