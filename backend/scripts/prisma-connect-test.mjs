import { PrismaClient } from "@prisma/client"
const p = new PrismaClient()
try {
  const m = await p.meter.findUnique({ where: { serial: "52051449" } })
  console.log("Prisma sees meter 52051449:", m ? `${m.id.slice(0, 8)} type=${m.type}` : "NO")
  const c = await p.customer.findFirst({ where: { name: "ايهاب امام حسنين شافعي" } })
  console.log("Prisma sees customer:", c ? `${c.id.slice(0, 8)} status=${c.status}` : "NO")
  const total = await p.meter.count()
  const types = await p.meter.groupBy({ by: ["type"], _count: true })
  console.log("meter total:", total, "| types:", types.map(t => `${t.type}=${t._count}`).join(", "))
} catch (e) {
  console.log("ERR:", e.message.slice(0, 120))
} finally {
  await p.$disconnect()
}
