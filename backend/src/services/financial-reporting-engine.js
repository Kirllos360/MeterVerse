import { prisma } from "../db.js"
import logger from "./logger.js"

// Financial Reporting Engine — builds P&L, Balance Sheet, Cash Flow,
// AR Aging, Budget vs Actual, and financial ratios from GL data.

function round2(n) { return Math.round(n * 100) / 100 }
function now() { return new Date() }
function periodKeyOf(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` }

// Statement line classification by Account.type + code prefix
const REVENUE_TYPES = ["REVENUE", "INCOME", "SALES"]
const EXPENSE_TYPES = ["EXPENSE", "COST"]
const ASSET_TYPES = ["ASSET"]
const LIABILITY_TYPES = ["LIABILITY"]
const EQUITY_TYPES = ["EQUITY", "CAPITAL"]

async function periodBounds(periodKey) {
  const [y, m] = periodKey.split("-").map(Number)
  const start = new Date(y, m - 1, 1)
  const end = new Date(y, m, 1)
  return { start, end }
}

/**
 * Load GL balances for a period, grouped by account.
 */
async function loadGlByAccount(periodKey, tx = prisma) {
  const { start, end } = await periodBounds(periodKey)
  const [accounts, ledgers] = await Promise.all([
    tx.account.findMany({ where: { archivedAt: null } }),
    tx.generalLedgerEntry.findMany({ where: { period: { startDate: { gte: start }, endDate: { lt: end } } }, include: { account: true } }),
  ])
  const byId = new Map(accounts.map(a => [a.id, a]))
  const totals = new Map()
  for (const gl of ledgers) {
    const acc = gl.account || byId.get(gl.accountId)
    const t = totals.get(gl.accountId) || { account: acc, totalDebit: 0, totalCredit: 0, closingBalance: 0, openingBalance: gl.openingBalance || 0 }
    t.totalDebit += gl.totalDebit
    t.totalCredit += gl.totalCredit
    t.closingBalance = gl.closingBalance
    totals.set(gl.accountId, t)
  }
  return totals
}

function signForType(type) {
  if (ASSET_TYPES.includes(type) || EXPENSE_TYPES.includes(type)) return 1  // debit-normal
  return -1  // credit-normal (liability, equity, revenue)
}

/**
 * Build a P&L statement for a period.
 */
export async function buildPnl(periodKey, tx = prisma) {
  const totals = await loadGlByAccount(periodKey, tx)
  const revenue = []
  const expenses = []
  let totalRevenue = 0
  let totalExpenses = 0

  for (const [accountId, t] of totals) {
    const type = (t.account?.type || "").toUpperCase()
    const signed = round2(t.closingBalance * signForType(type))
    if (REVENUE_TYPES.includes(type)) {
      revenue.push({ accountId, code: t.account?.code, name: t.account?.name, amount: signed })
      totalRevenue += signed
    } else if (EXPENSE_TYPES.includes(type)) {
      expenses.push({ accountId, code: t.account?.code, name: t.account?.name, amount: signed })
      totalExpenses += signed
    }
  }

  const grossProfit = round2(totalRevenue - totalExpenses)
  const netIncome = grossProfit
  return { periodKey, revenue, expenses, totalRevenue: round2(totalRevenue), totalExpenses: round2(totalExpenses), grossProfit, netIncome }
}

/**
 * Build a Balance Sheet as of a period.
 */
export async function buildBalanceSheet(periodKey, tx = prisma) {
  const totals = await loadGlByAccount(periodKey, tx)
  const assets = []
  const liabilities = []
  const equity = []
  let totalAssets = 0
  let totalLiabilities = 0
  let totalEquity = 0

  for (const [accountId, t] of totals) {
    const type = (t.account?.type || "").toUpperCase()
    const balance = round2(t.closingBalance)
    if (ASSET_TYPES.includes(type)) {
      assets.push({ accountId, code: t.account?.code, name: t.account?.name, balance: Math.abs(balance) })
      totalAssets += Math.abs(balance)
    } else if (LIABILITY_TYPES.includes(type)) {
      liabilities.push({ accountId, code: t.account?.code, name: t.account?.name, balance: Math.abs(balance) })
      totalLiabilities += Math.abs(balance)
    } else if (EQUITY_TYPES.includes(type)) {
      equity.push({ accountId, code: t.account?.code, name: t.account?.name, balance: Math.abs(balance) })
      totalEquity += Math.abs(balance)
    }
  }

  totalAssets = round2(totalAssets)
  totalLiabilities = round2(totalLiabilities)
  totalEquity = round2(totalEquity)
  return { periodKey, assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity, balanceCheck: round2(totalAssets - totalLiabilities - totalEquity) }
}

/**
 * Build a Cash Flow statement (indirect method, simplified from GL).
 */
export async function buildCashFlow(periodKey, tx = prisma) {
  const { start, end } = await periodBounds(periodKey)
  const journalEntries = await tx.journalEntry.findMany({
    where: { entryDate: { gte: start, lt: end }, status: { in: ["POSTED", "APPROVED"] } },
    include: { lines: { include: { account: true } } },
  })

  let operating = 0
  let investing = 0
  let financing = 0
  for (const je of journalEntries) {
    const source = (je.source || "").toUpperCase()
    for (const line of je.lines) {
      const net = round2(line.debitAmount - line.creditAmount)
      if (source.includes("PAYMENT") || source.includes("INVOICE") || source === "MANUAL") {
        operating += net
      } else if (source.includes("CAPEX") || source.includes("ASSET") || source.includes("FIXED")) {
        investing += net
      } else {
        financing += net
      }
    }
  }

  operating = round2(-operating) // invert to cash convention (inflows positive)
  investing = round2(investing)
  financing = round2(financing)
  return { periodKey, operating, investing, financing, netCashFlow: round2(operating + investing + financing) }
}

/**
 * AR aging report from open invoices.
 */
export async function buildArAging(asOf = now(), tx = prisma) {
  const invoices = await tx.invoice.findMany({
    where: { status: { in: ["issued", "partial", "overdue"] }, archivedAt: null },
    include: { customer: { select: { id: true, name: true } } },
  })
  const buckets = { "0-30": [], "31-60": [], "61-90": [], "90+": [] }
  const totals = { "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 }
  for (const inv of invoices) {
    const outstanding = inv.amount - (inv.paidAmount || 0)
    if (outstanding <= 0) continue
    const due = inv.dueDate ? Math.floor((asOf - inv.dueDate) / 86400000) : 0
    const key = due > 90 ? "90+" : due > 60 ? "61-90" : due > 30 ? "31-60" : "0-30"
    buckets[key].push({ invoiceId: inv.id, number: inv.number, customerName: inv.customer?.name, outstanding: round2(outstanding), daysOverdue: due })
    totals[key] = round2(totals[key] + outstanding)
  }
  const totalOutstanding = round2(Object.values(totals).reduce((s, v) => s + v, 0))
  return { asOf: asOf.toISOString(), buckets, totals, totalOutstanding }
}

/**
 * Budget vs Actual comparison.
 */
export async function buildBvA(periodKey, tx = prisma) {
  const budgets = await tx.budget.findMany({ where: { periodKey, status: "ACTIVE", archivedAt: null } })
  const totals = await loadGlByAccount(periodKey, tx)
  const rows = []
  const actualByCode = new Map()
  for (const [accountId, t] of totals) {
    const type = (t.account?.type || "").toUpperCase()
    const signed = round2(t.closingBalance * signForType(type))
    actualByCode.set(t.account?.code, signed)
  }

  let totalBudget = 0
  let totalActual = 0
  for (const b of budgets) {
    const actual = b.accountCode ? (actualByCode.get(b.accountCode) || 0) : 0
    const variance = round2(actual - b.amount)
    const variancePct = b.amount !== 0 ? round2(variance / b.amount * 100) : null
    totalBudget += b.amount
    totalActual += actual
    rows.push({ budgetId: b.id, name: b.name, category: b.category, accountCode: b.accountCode, budget: b.amount, actual, variance, variancePct })
  }
  const bva = await tx.budgetVsActual.create({
    data: { periodKey, category: "ALL", budgetAmount: totalBudget, actualAmount: round2(totalActual), variance: round2(totalBudget - totalActual) },
  })
  return { periodKey, rows, totalBudget: round2(totalBudget), totalActual: round2(totalActual), totalVariance: round2(totalBudget - totalActual), storedId: bva.id }
}

/**
 * Compute key financial ratios.
 */
export async function computeRatios(periodKey, tx = prisma) {
  const pnl = await buildPnl(periodKey, tx)
  const bs = await buildBalanceSheet(periodKey, tx)
  const ratios = {
    netMargin: pnl.totalRevenue !== 0 ? round2(pnl.netIncome / pnl.totalRevenue * 100) : 0,
    currentRatio: bs.totalLiabilities !== 0 ? round2(bs.totalAssets / bs.totalLiabilities) : 0,
    debtToEquity: bs.totalEquity !== 0 ? round2(bs.totalLiabilities / bs.totalEquity) : 0,
    returnOnAssets: bs.totalAssets !== 0 ? round2(pnl.netIncome / bs.totalAssets * 100) : 0,
  }
  const defs = [
    { code: "NET_MARGIN", name: "Net Profit Margin", formula: "Net Income / Total Revenue", value: ratios.netMargin },
    { code: "CURRENT_RATIO", name: "Current Ratio", formula: "Total Assets / Total Liabilities", value: ratios.currentRatio },
    { code: "DEBT_TO_EQUITY", name: "Debt to Equity", formula: "Total Liabilities / Total Equity", value: ratios.debtToEquity },
    { code: "ROA", name: "Return on Assets", formula: "Net Income / Total Assets", value: ratios.returnOnAssets },
  ]
  for (const d of defs) {
    await tx.financialRatio.upsert({
      where: { code: d.code },
      update: { value: d.value, periodKey, computedAt: now() },
      create: { ...d, periodKey, computedAt: now() },
    })
  }
  return { periodKey, ratios }
}

/**
 * Capture a full financial snapshot (all statements) for a period.
 */
export async function captureSnapshot(periodKey, tx = prisma) {
  const [pnl, bs, cf, bva, ratios] = await Promise.all([
    buildPnl(periodKey, tx),
    buildBalanceSheet(periodKey, tx),
    buildCashFlow(periodKey, tx),
    buildBvA(periodKey, tx),
    computeRatios(periodKey, tx),
  ])
  const data = JSON.stringify({ pnl, balanceSheet: bs, cashFlow: cf, bva, ratios })
  const snapshot = await tx.financialSnapshot.upsert({
    where: { snapshotType_periodKey: { snapshotType: "MONTHLY", periodKey } },
    update: { data, label: `Financial snapshot ${periodKey}`, generatedAt: now() },
    create: { snapshotType: "MONTHLY", periodKey, label: `Financial snapshot ${periodKey}`, data },
  })
  logger.info({ component: "financial-reporting", periodKey }, "Snapshot captured")
  return snapshot
}

export { logger as reportingLogger }
