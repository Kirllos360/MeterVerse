import { PrismaClient } from "@prisma/client"
const p = new PrismaClient()
try {
  const c = await p.customer.count()
  const m = await p.meter.count()
  const r = await p.reading.count()
  console.log(`PRISMA CONNECTED: customers=${c} meters=${m} readings=${r}`)
  const s = await p.meter.findFirst({ where: { serial: "52051449" } })
  console.log("meter 52051449 found:", !!s)
  const inv = await p.invoice.count()
  console.log("invoices:", inv)
} catch (e) {
  console.log("PRISMA ERROR:", e.message.slice(0, 120))
} finally {
  await p.$disconnect()
}
