import { prisma } from "../db.js"
import logger from "./logger.js"

// Revenue Assurance Engine — detects billing leakage across three windows:
//   PRE_BILL   : checks run before invoices are issued (reading/tariff sanity)
//   POST_BILL  : checks run after invoices exist (amount/consistency checks)
//   CONTINUOUS : checks run on-demand / nightly across all entities
// Rules are stored in RevenueRule (condition = JSON expression) and produce
// RevenueLeakageFinding rows. Investigations track resolution.

const RULE_DEFS = [
  // ── PRE_BILL rules ──
  { code: "PRE_READING_ZERO", name: "Zero reading on active meter", category: "PRE_BILL", entityType: "reading", severity: "high", condition: { field: "readingValue", op: "eq", value: 0 }, expectedValue: 0 },
  { code: "PRE_READING_NEGATIVE", name: "Negative reading detected", category: "PRE_BILL", entityType: "reading", severity: "critical", condition: { field: "readingValue", op: "lt", value: 0 } },
  { code: "PRE_READING_DROP", name: "Reading lower than previous period", category: "PRE_BILL", entityType: "reading", severity: "high", condition: { field: "regression", op: "eq", value: true } },
  { code: "PRE_USAGE_IMPLAUSIBLE", name: "Usage exceeds historical baseline", category: "PRE_BILL", entityType: "reading", severity: "medium", condition: { field: "usageFactor", op: "gt", value: 5 } },
  { code: "PRE_TARIFF_MISSING", name: "Customer has no active tariff", category: "PRE_BILL", entityType: "customer", severity: "critical", condition: { field: "tariffMissing", op: "eq", value: true } },
  { code: "PRE_UNMETERED_UNITS", name: "Unmetered units not flagged", category: "PRE_BILL", entityType: "customer", severity: "low", condition: { field: "unmeteredNotFlagged", op: "eq", value: true } },

  // ── POST_BILL rules ──
  { code: "POST_INVOICE_ZERO_AMOUNT", name: "Zero-amount issued invoice", category: "POST_BILL", entityType: "invoice", severity: "high", condition: { field: "amount", op: "eq", value: 0 } },
  { code: "POST_INVOICE_NEGATIVE", name: "Negative invoice amount", category: "POST_BILL", entityType: "invoice", severity: "critical", condition: { field: "amount", op: "lt", value: 0 } },
  { code: "POST_ITEMS_MISMATCH", name: "Invoice items sum != invoice amount", category: "POST_BILL", entityType: "invoice", severity: "high", condition: { field: "itemsMismatch", op: "eq", value: true }, tolerance: 0.01 },
  { code: "POST_TAX_MISMATCH", name: "Tax line inconsistent", category: "POST_BILL", entityType: "invoice", severity: "medium", condition: { field: "taxMismatch", op: "eq", value: true }, tolerance: 0.01 },
  { code: "POST_PAID_OVER_AMOUNT", name: "Paid amount exceeds invoice", category: "POST_BILL", entityType: "invoice", severity: "medium", condition: { field: "overpaid", op: "eq", value: true } },
  { code: "POST_DUPLICATE_PERIOD", name: "Duplicate invoice for same period", category: "POST_BILL", entityType: "invoice", severity: "medium", condition: { field: "duplicatePeriod", op: "eq", value: true } },

  // ── CONTINUOUS rules ──
  { code: "CON_READING_GAP", name: "Missing reading in billing cycle", category: "CONTINUOUS", entityType: "reading", severity: "high", condition: { field: "gapDays", op: "gt", value: 60 } },
  { code: "CON_CUSTOMER_BALANCE_DRIFT", name: "Customer balance drift vs ledger", category: "CONTINUOUS", entityType: "customer", severity: "medium", condition: { field: "balanceDrift", op: "gt", value: 0.05 } },
  { code: "CON_PAYMENT_NO_INVOICE", name: "Payment without invoice reference", category: "CONTINUOUS", entityType: "payment", severity: "low", condition: { field: "noInvoiceRef", op: "eq", value: true } },
]

// Simple condition evaluator — supports { field, op, value } with common ops.
function evaluateCondition(condition, entity, tolerance = null) {
  if (!condition || typeof condition !== "object") return false
  const { field, op, value } = condition
  const actual = entity[field]
  if (actual === undefined || actual === null) return false
  switch (op) {
    case "eq": return tolerance != null ? Math.abs(Number(actual) - Number(value)) <= tolerance : actual === value || Number(actual) === Number(value)
    case "ne": return Number(actual) !== Number(value)
    case "lt": return Number(actual) < Number(value)
    case "gt": return Number(actual) > Number(value)
    case "gte": return Number(actual) >= Number(value)
    case "lte": return Number(actual) <= Number(value)
    default: return false
  }
}

async function ensureRules(tx = prisma) {
  for (const def of RULE_DEFS) {
    const exists = await tx.revenueRule.findUnique({ where: { code: def.code } })
    if (!exists) {
      await tx.revenueRule.create({
        data: {
          name: def.name, code: def.code, category: def.category, entityType: def.entityType,
          condition: JSON.stringify(def.condition), severity: def.severity, expectedValue: def.expectedValue,
          active: true, priority: 0,
        },
      })
    }
  }
}

async function createFinding(tx, { rule, entityType, entityId, sourceType, sourceId, periodId, customerId, expectedAmount, actualAmount, varianceAmount, variancePct, severity, summary, details }) {
  return tx.revenueLeakageFinding.create({
    data: { ruleId: rule.id, entityType, entityId, sourceType, sourceId, periodId, customerId, expectedAmount, actualAmount, varianceAmount, variancePct, severity, summary, details, status: "OPEN" },
  })
}

async function dedupeExists(tx, { ruleId, entityType, entityId }) {
  const open = await tx.revenueLeakageFinding.findFirst({
    where: { ruleId, entityType, entityId, status: { in: ["OPEN", "INVESTIGATING", "CONFIRMED"] } },
  })
  return !!open
}

// Build a billing entity summary for an invoice (items sum, tax, paid, duplicate)
async function buildInvoiceContext(invoice, tx) {
  const items = await tx.invoiceItem.findMany({ where: { invoiceId: invoice.id } })
  const itemsSum = items.reduce((s, i) => s + (i.total ?? i.amount ?? 0), 0)
  let taxSum = 0
  if (items.length > 0) {
    const itemIds = items.map(i => i.id)
    const taxAgg = await tx.invoiceTax.aggregate({ where: { invoiceItemId: { in: itemIds } }, _sum: { amount: true } })
    taxSum = taxAgg._sum?.amount || 0
  }
  const duplicate = await tx.invoice.count({ where: { customerId: invoice.customerId, issuedAt: { gte: new Date(new Date(invoice.issuedAt).setDate(new Date(invoice.issuedAt).getDate() - 2)) }, amount: invoice.amount, status: { notIn: ["cancelled"] }, id: { not: invoice.id } } })
  return {
    amount: invoice.amount,
    paidAmount: invoice.paidAmount || 0,
    itemsSum,
    itemsMismatch: Math.abs(itemsSum - invoice.amount) > 0.01,
    taxMismatch: taxSum > 0 && Math.abs(taxSum - (invoice.amount * 0.14)) > 0.01,
    overpaid: (invoice.paidAmount || 0) > invoice.amount,
    duplicatePeriod: duplicate > 0,
    noInvoiceRef: false,
  }
}

/**
 * Run revenue assurance checks for a given window. Creates findings for any
 * detected anomalies. Returns summary of checks/findings.
 */
export async function runRevenueAssurance({ category = null, invoiceId = null, customerId = null, tx = prisma } = {}) {
  await ensureRules(tx)
  const rules = await tx.revenueRule.findMany({ where: { active: true, ...(category ? { category } : {}), ...(invoiceId ? { entityType: "invoice" } : {}) } })
  let checks = 0
  let findings = 0
  const created = []

  // POST_BILL / CONTINUOUS invoice checks
  const invoiceWhere = { archivedAt: null, ...(invoiceId ? { id: invoiceId } : {}) }
  if (customerId) invoiceWhere.customerId = customerId
  const invoices = await tx.invoice.findMany({ where: invoiceWhere, take: 500, orderBy: { createdAt: "desc" } })

  for (const inv of invoices) {
    const ctx = await buildInvoiceContext(inv, tx)
    const period = inv.issuedAt ? new Date(inv.issuedAt) : new Date()
    const periodKey = `${period.getFullYear()}-${String(period.getMonth() + 1).padStart(2, "0")}`
    for (const rule of rules) {
      if (rule.entityType !== "invoice") continue
      checks++
      const cond = JSON.parse(rule.condition)
      if (!evaluateCondition(cond, ctx, rule.tolerance)) continue
      if (await dedupeExists(tx, { ruleId: rule.id, entityType: "invoice", entityId: inv.id })) continue
      const variance = rule.expectedValue != null ? Number(ctx.amount) - Number(rule.expectedValue) : null
      const f = await createFinding(tx, {
        rule, entityType: "invoice", entityId: inv.id, sourceType: "invoice", sourceId: inv.id,
        customerId: inv.customerId, periodId: periodKey,
        expectedAmount: rule.expectedValue, actualAmount: ctx.amount,
        varianceAmount: variance, variancePct: rule.expectedValue ? (variance / rule.expectedValue) * 100 : null,
        severity: rule.severity, summary: `${rule.name} on invoice ${inv.number}`, details: JSON.stringify(ctx),
      })
      created.push(f)
      findings++
    }
  }

  logger.info({ component: "revenue-assurance", category: category || "ALL", checks, findings }, "Revenue assurance run complete")
  return { checks, findings, created }
}

/**
 * Score a leakage finding 0-100 (impact + likelihood + severity weighting).
 */
export function scoreFinding(finding) {
  const severityScore = { low: 20, medium: 40, high: 70, critical: 90 }
  const sev = severityScore[finding.severity] || 40
  const amountImpact = finding.varianceAmount != null ? Math.min(100, Math.abs(finding.varianceAmount) / 1000 * 10) : 30
  const statusBump = finding.status === "CONFIRMED" ? 15 : finding.status === "INVESTIGATING" ? 5 : 0
  return Math.min(100, Math.round(sev * 0.6 + amountImpact + statusBump))
}

/**
 * Seed the 15 default revenue rules if missing.
 */
export async function seedRevenueRules(tx = prisma) {
  await ensureRules(tx)
  const count = await tx.revenueRule.count()
  return count
}
