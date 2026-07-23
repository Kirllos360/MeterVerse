import { prisma } from "../db.js"

export async function generateInvoice(customerId, periodStart, periodEnd) {
  const readings = await prisma.reading.findMany({
    where: { meter: { customerId }, timestamp: { gte: periodStart, lte: periodEnd } },
    include: { meter: true },
  })
  const totalKwh = readings.reduce((s, r) => s + r.value, 0)
  const tariff = await prisma.tariff.findFirst({ where: { status: "active" }, include: { rates: true } })
  const rate = tariff?.rates?.[0]?.rate || 0.5
  const amount = totalKwh * rate

  const invoice = await prisma.invoice.create({
    data: {
      number: "INV-" + Date.now(),
      customerId,
      amount,
      status: "pending",
      dueDate: new Date(Date.now() + 30 * 86400000),
      issuedAt: new Date(),
    },
  })
  return invoice
}
