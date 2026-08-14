import { prisma } from "../db.js"

// ─── SOLAR WALLET ENGINE (P59-C/LR-5) ────────────────────────────────────────
// Recovered from legacy Collection System runtime (routes_admin.py solar_invoice)
// and adapted to MeterVerse. PURE compute + persistence via EXISTING structures
// (CustomerLedgerEntry, InvoiceItem, Tariff) — no new financial architecture.
//
// OBIS BOUNDARY: the engine accepts already-resolved directional readings
// (consumption_180, production_280) as inputs. Capturing/storing directional
// registers on `Reading` is a SEPARATE, OBIS-gated decision — NOT done here.
//
// Verified legacy rules (repository evidence, NOT the CR-2047 2.23 EGP/kWh myth):
//   consumption = max(curr180 - prev180, 0)
//   production  = max(curr280 - prev280, 0)
//   net         = max(consumption - production, 0)
//   surplus     = max(production - consumption, 0)
//   wallet credit = surplus (CREDIT, balance_before/after)
//   tariff      = tiered [(50,0.48)..(1000,1.58)] + >1000 @ 1.68
//   admin_fee   = 2% of amount; service_fee = 9.10; total = amount+fees

const ROUND = 2
export const SOLAR_TARIFF_TIERS = [
  { limit: 50, rate: 0.48 }, { limit: 100, rate: 0.58 }, { limit: 150, rate: 0.68 },
  { limit: 200, rate: 0.78 }, { limit: 300, rate: 0.88 }, { limit: 400, rate: 0.98 },
  { limit: 500, rate: 1.08 }, { limit: 600, rate: 1.18 }, { limit: 700, rate: 1.28 },
  { limit: 800, rate: 1.38 }, { limit: 900, rate: 1.48 }, { limit: 1000, rate: 1.58 },
]
export const SOLAR_OVER_LIMIT_RATE = 1.68
export const SOLAR_ADMIN_FEE_RATE = 0.02
export const SOLAR_SERVICE_FEE = 9.10

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

// Pure computation — no DB. Inputs are resolved directional readings.
// Returns { consumption, production, net, surplus, walletCredit, amount, adminFee, serviceFee, total }
export function computeSolar({ curr180 = 0, prev180 = 0, curr280 = 0, prev280 = 0 }) {
  const consumption = Math.max(curr180 - prev180, 0)
  const production = Math.max(curr280 - prev280, 0)
  const net = Math.max(consumption - production, 0)
  const surplus = Math.max(production - consumption, 0)

  // Tiered tariff (verified runtime evidence)
  let amount = 0
  let remaining = net
  for (const { limit, rate } of SOLAR_TARIFF_TIERS) {
    if (remaining <= 0) break
    const chunk = Math.min(remaining, limit)
    amount += chunk * rate
    remaining -= chunk
  }
  if (remaining > 0) amount += remaining * SOLAR_OVER_LIMIT_RATE
  amount = round2(amount)

  const adminFee = round2(amount * SOLAR_ADMIN_FEE_RATE)
  const serviceFee = SOLAR_SERVICE_FEE
  const total = round2(amount + adminFee + serviceFee)

  return { consumption, production, net, surplus, walletCredit: surplus, amount, adminFee, serviceFee, total }
}

// Persist a solar invoice via existing MeterVerse structures.
// - CustomerLedgerEntry (type="solar_credit") for the surplus credit
// - InvoiceItem rows (type="charge") for tariff amount + admin fee + service fee
// Returns { ledgerEntry, invoice, items }
export async function persistSolarInvoice({ customerId, periodStart, periodEnd, meterId, result, meta = {} }) {
  if (result.surplus > 0) {
    await prisma.customerLedgerEntry.create({
      data: {
        customerId,
        type: "solar_credit",
        amount: result.surplus,
        description: `Solar surplus credit ${meta.month || ""}`.trim(),
        reference: meterId ? `meter:${meterId}` : undefined,
      },
    })
  }

  const invoice = await prisma.invoice.create({
    data: {
      number: `SOLAR-${Date.now()}`,
      customerId,
      amount: result.total,
      status: "pending",
      issuedAt: new Date(),
      dueDate: new Date(Date.now() + 30 * 86400000),
      areaId: meta.areaId || null,
      projectId: meta.projectId || null,
    },
  })

  const items = []
  const lineDefs = [
    { type: "charge", description: "Solar energy (tiered)", amount: result.amount },
    { type: "charge", description: "Admin fee (2%)", amount: result.adminFee },
    { type: "charge", description: "Service fee", amount: result.serviceFee },
  ]
  for (const def of lineDefs) {
    if (def.amount <= 0) continue
    const item = await prisma.invoiceItem.create({
      data: { invoiceId: invoice.id, type: def.type, description: def.description, quantity: 1, unitPrice: def.amount, amount: def.amount, total: def.amount },
    })
    items.push(item)
  }

  return { invoice, items }
}
