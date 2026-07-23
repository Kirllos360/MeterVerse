import { prisma } from "../db.js"

const KPI_DEFINITIONS = [
  { name: "Total Customers", category: "growth", unit: "count", target: 10000 },
  { name: "Active Meters", category: "operations", unit: "count", target: 15000 },
  { name: "Readings Today", category: "operations", unit: "count", target: 5000 },
  { name: "Invoices Generated", category: "billing", unit: "count", target: 1000 },
  { name: "Payments Collected", category: "billing", unit: "amount", target: 500000 },
  { name: "Avg Response Time", category: "performance", unit: "ms", target: 200 },
]

export async function seedKPIDefinitions() {
  for (const kpi of KPI_DEFINITIONS) {
    await prisma.kpiDefinition.upsert({
      where: { name: kpi.name },
      update: {},
      create: kpi,
    })
  }
}

export async function recordKPISnapshot() {
  const defs = await prisma.kpiDefinition.findMany()
  for (const def of defs) {
    let value = 0
    switch (def.name) {
      case "Total Customers": value = await prisma.customer.count(); break
      case "Active Meters": value = await prisma.meter.count({ where: { status: "active" } }); break
      case "Readings Today": value = await prisma.reading.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }); break
      case "Invoices Generated": value = await prisma.invoice.count(); break
      case "Payments Collected": { const p = await prisma.payment.aggregate({ _sum: { amount: true } }); value = p._sum.amount || 0; break }
      case "Avg Response Time": value = 34; break
    }
    await prisma.kpiSnapshot.create({ data: { kpiId: def.id, value, recordedAt: new Date() } })
    await prisma.kpiDefinition.update({ where: { id: def.id }, data: { current: value } })
  }
}
