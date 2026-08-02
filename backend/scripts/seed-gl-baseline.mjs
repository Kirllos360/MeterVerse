import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

// 1) Ensure chart of accounts (AR, Revenue, Cash)
const accDefs = [
  { code: "1000", name: "Cash", type: "ASSET" },
  { code: "1200", name: "Accounts Receivable", type: "ASSET" },
  { code: "4000", name: "Revenue", type: "REVENUE" },
]
const accounts = {}
for (const d of accDefs) {
  const acc = await prisma.account.upsert({ where: { code: d.code }, update: {}, create: { ...d, currency: "EGP" } })
  accounts[d.code] = acc
  console.log("account:", d.code, acc.id)
}

// 2) Ensure OPEN financial period for 2026-08
const now = new Date()
const period = await prisma.financialPeriod.upsert({
  where: { year_month: { year: 2026, month: 8 } },
  update: { status: "OPEN", startDate: new Date("2026-08-01"), endDate: new Date("2026-08-31") },
  create: { year: 2026, month: 8, quarter: 3, startDate: new Date("2026-08-01"), endDate: new Date("2026-08-31"), status: "OPEN" },
})
console.log("period:", period.id, period.status)

// 3) Account mappings
const mappings = [
  { name: "Invoice AR/Revenue", transactionType: "INVOICE_ISSUED", debit: "1200", credit: "4000", priority: 100 },
  { name: "Payment Cash/AR", transactionType: "PAYMENT_RECEIVED", debit: "1000", credit: "1200", priority: 100 },
]
for (const m of mappings) {
  const map = await prisma.accountMapping.create({
    data: { name: m.name, transactionType: m.transactionType, debitAccountId: accounts[m.debit].id, creditAccountId: accounts[m.credit].id, priority: m.priority, active: true, effectiveFrom: new Date("2026-08-01") },
  })
  console.log("mapping:", m.transactionType, map.id)
}
console.log("GL seed complete")
await prisma.$disconnect()
