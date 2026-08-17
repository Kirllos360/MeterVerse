import { PrismaClient } from "@prisma/client"
const p = new PrismaClient()
try {
  const m = await p.meter.findUnique({ where: { serial: "52051449" }, include: { readings: true } })
  console.log("meter 52051449:", m ? `${m.id.slice(0,8)} type=${m.type} readings=${m.readings.length}` : "NO")
  const c = await p.customer.findFirst({ where: { name: "ايهاب امام حسنين شافعي" }, include: { invoices: true } })
  console.log("customer invoices:", c ? c.invoices.length : "NO")
  const cons = await p.consumption.count({ where: { meterId: m?.id } })
  console.log("consumptions for golden meter:", cons)
} catch (e) {
  console.log("ERR:", e.message.slice(0, 120))
} finally {
  await p.$disconnect()
}
