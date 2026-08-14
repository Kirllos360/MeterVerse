import { prisma } from "../db.js"

// ─── SETTLEMENT ENGINE (P59-C/LR-2) ──────────────────────────────────────────
// Recovered from legacy Collection System charge_engine.py (FIXED/PERCENTAGE/
// ONE_TIME) and adapted to the MeterVerse invoice pipeline. MeterVerse-native:
// settlements are applied to an invoice subtotal as InvoiceSettlement rows and
// surfaced as InvoiceItem lines, so they participate in the existing invoice,
// tax, and ledger flow without creating a parallel financial architecture.

const ROUND = 2

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

// ONE_TIME guard: a settlement may apply only once per customer. The legacy
// version matched by description; here we use an explicit ledger/reference
// check so the rule is deterministic and auditable.
async function oneTimeAlreadyApplied(settlement, customerId) {
  const existing = await prisma.invoiceSettlement.findFirst({
    where: { settlementId: settlement.id, invoice: { customerId } },
    include: { invoice: { select: { customerId: true } } },
  })
  return Boolean(existing)
}

// Compute the settlement amounts applicable to a customer's invoice subtotal.
// Returns array of { settlementId, name, nameAr, type, amount } for active
// settlements that produce a positive amount.
export async function calculateSettlements(subtotal, customerId) {
  const subtotalVal = Number(subtotal) || 0
  const settlements = await prisma.settlement.findMany({
    where: { active: true, archivedAt: null },
    orderBy: { createdAt: "asc" },
  })

  const result = []
  for (const s of settlements) {
    if (!s.active || s.archivedAt) continue
    const type = s.type || "fixed"
    if (type === "fixed") {
      const amount = round2(Number(s.amount) || 0)
      if (amount > 0) {
        result.push({ settlementId: s.id, name: s.name, nameAr: s.nameAr, type, amount })
      }
    } else if (type === "percentage") {
      const pct = Number(s.percentage) || 0
      const amount = round2((subtotalVal * pct) / 100)
      if (amount > 0) {
        result.push({ settlementId: s.id, name: s.name, nameAr: s.nameAr, type, amount })
      }
    } else if (type === "one_time") {
      const applied = await oneTimeAlreadyApplied(s, customerId)
      if (!applied) {
        const amount = round2(Number(s.amount) || 0)
        if (amount > 0) {
          result.push({ settlementId: s.id, name: s.name, nameAr: s.nameAr, type, amount })
        }
      }
    }
  }
  return result
}

// Apply settlements to an invoice: records InvoiceSettlement rows and returns
// { settlements, totalSettlementAmount }. Must run inside the invoice transaction.
export async function applySettlementsToInvoice(invoiceId, customerId, subtotal) {
  const settlements = await calculateSettlements(subtotal, customerId)
  let total = 0
  for (const s of settlements) {
    await prisma.invoiceSettlement.create({
      data: {
        invoiceId,
        settlementId: s.settlementId,
        type: s.type,
        amount: s.amount,
      },
    })
    total = round2(total + s.amount)
  }
  return { settlements, totalSettlementAmount: total }
}

// Convert settlement records into InvoiceItem lines for display on the invoice.
// Idempotent per invoice: only inserts lines not already present for these
// settlement references.
export async function materializeSettlementItems(invoiceId, settlements) {
  const existing = await prisma.invoiceItem.findMany({
    where: { invoiceId, type: "settlement" },
    select: { referenceId: true },
  })
  const have = new Set(existing.map((i) => i.referenceId))

  const items = []
  for (const s of settlements) {
    if (have.has(s.settlementId)) continue
    const item = await prisma.invoiceItem.create({
      data: {
        invoiceId,
        type: "settlement",
        description: s.nameAr || s.name,
        quantity: 1,
        unitPrice: s.amount,
        amount: s.amount,
        total: s.amount,
        referenceType: "settlement",
        referenceId: s.settlementId,
      },
    })
    items.push(item)
  }
  return items
}
