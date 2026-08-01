import { prisma } from "../db.js"
import logger from "./logger.js"

// Collections Intelligence Engine — risk profiling, dunning stages, PTP,
// installment plans, bad-debt provisioning, and write-off workflow.

function now() { return new Date() }

function daysBetween(a, b) { return Math.floor((b - a) / 86400000) }

/**
 * Compute a customer's risk profile (0-100) from aging/owing/payment behavior.
 */
export function computeRiskScore({ agingDays = 0, totalOwing = 0, overdueCount = 0, promiseKeptRate = 1, lastPaymentDaysAgo = 30, maxAgingDays = 180 }) {
  let score = 0
  score += Math.min(40, (agingDays / maxAgingDays) * 40)
  score += Math.min(20, (totalOwing / 5000) * 20)
  score += Math.min(15, overdueCount * 5)
  score += (1 - promiseKeptRate) * 20
  if (lastPaymentDaysAgo == null) score += 5
  else if (lastPaymentDaysAgo > 90) score += 10
  else if (lastPaymentDaysAgo > 30) score += 5
  return Math.min(100, Math.round(score))
}

export function riskBandFromScore(score) {
  if (score >= 80) return "CRITICAL"
  if (score >= 60) return "HIGH"
  if (score >= 35) return "MEDIUM"
  return "LOW"
}

/**
 * Resolve the applicable dunning stage for an invoice given days overdue.
 */
export async function resolveDunningStage(daysOverdue, rules, tx = prisma) {
  const active = rules || (await tx.dunningRule.findMany({ where: { active: true }, orderBy: { stage: "asc" } }))
  for (const rule of active) {
    if (daysOverdue >= rule.minDays && (rule.maxDays == null || daysOverdue <= rule.maxDays)) return rule
  }
  return active[active.length - 1] || null
}

/**
 * Run the dunning engine across overdue invoices: updates collection cases and
 * returns planned actions per stage.
 */
export async function runDunning({ invoiceId = null, tx = prisma } = {}) {
  const rules = await tx.dunningRule.findMany({ where: { active: true }, orderBy: { stage: "asc" } })
  if (rules.length === 0) {
    // Seed default 4-stage dunning ladder
    const defaults = [
      { name: "Stage 1 Reminder", code: "DUN_1", stage: 1, minDays: 1, maxDays: 15, action: "REMINDER", channel: "EMAIL" },
      { name: "Stage 2 Notice", code: "DUN_2", stage: 2, minDays: 16, maxDays: 30, action: "EMAIL", channel: "EMAIL" },
      { name: "Stage 3 Warning", code: "DUN_3", stage: 3, minDays: 31, maxDays: 60, action: "SMS", channel: "SMS" },
      { name: "Stage 4 Escalation", code: "DUN_4", stage: 4, minDays: 61, maxDays: null, action: "ESCALATE", channel: "CALL" },
    ]
    for (const d of defaults) await tx.dunningRule.create({ data: d })
    const seeded = await tx.dunningRule.findMany({ where: { active: true }, orderBy: { stage: "asc" } })
    rules.push(...seeded)
  }

  const invoices = await tx.invoice.findMany({
    where: { ...(invoiceId ? { id: invoiceId } : {}), status: { in: ["issued", "overdue", "partial"] }, archivedAt: null, dueDate: { lt: now() } },
    take: 500,
    orderBy: { dueDate: "asc" },
    include: { customer: true },
  })

  const planned = []
  for (const inv of invoices) {
    const daysOverdue = daysBetween(inv.dueDate, now())
    const rule = await resolveDunningStage(daysOverdue, rules, tx)
    if (!rule) continue
    const outstanding = inv.amount - (inv.paidAmount || 0)
    planned.push({ invoiceId: inv.id, customerId: inv.customerId, daysOverdue, stage: rule.stage, action: rule.action, channel: rule.channel, outstanding })
    // Ensure a collection case exists
    const existingCase = await tx.collectionCase.findFirst({ where: { customerId: inv.customerId, invoiceId: inv.id, status: { notIn: ["closed", "resolved"] } } })
    if (!existingCase) {
      await tx.collectionCase.create({
        data: { customerId: inv.customerId, invoiceId: inv.id, status: "open", priority: rule.stage >= 3 ? "high" : "normal", totalAmount: outstanding, paidAmount: 0, assignedTo: null },
      })
    }
  }

  logger.info({ component: "collections-dunning", scanned: invoices.length, planned: planned.length }, "Dunning run complete")
  return { scanned: invoices.length, planned }
}

/**
 * Compute bad-debt provision for a period from active ProvisionRules.
 */
export async function computeProvisions({ period = null, tx = prisma } = {}) {
  const periodKey = period || `${now().getFullYear()}-${String(now().getMonth() + 1).padStart(2, "0")}`
  const rules = await tx.provisionRule.findMany({ where: { active: true }, orderBy: { bucketDays: "asc" } })
  if (rules.length === 0) {
    const defaults = [
      { name: "30d Bucket", code: "PROV_30", bucketDays: 30, provisionPct: 5 },
      { name: "60d Bucket", code: "PROV_60", bucketDays: 60, provisionPct: 15 },
      { name: "90d Bucket", code: "PROV_90", bucketDays: 90, provisionPct: 30 },
      { name: "120d Bucket", code: "PROV_120", bucketDays: 120, provisionPct: 60 },
      { name: "180d Bucket", code: "PROV_180", bucketDays: 180, provisionPct: 100 },
    ]
    for (const d of defaults) await tx.provisionRule.create({ data: d })
    rules.push(...defaults.map(d => ({ id: d.code, ...d })))
  }

  const invoices = await tx.invoice.findMany({ where: { status: { in: ["issued", "overdue", "partial"] }, archivedAt: null, dueDate: { lt: now() } }, select: { id: true, amount: true, paidAmount: true, dueDate: true } })
  const provisions = []
  for (const inv of invoices) {
    const daysOverdue = daysBetween(inv.dueDate, now())
    const outstanding = inv.amount - (inv.paidAmount || 0)
    let applicable = null
    for (const rule of rules) {
      if (daysOverdue >= rule.bucketDays) applicable = rule
    }
    if (applicable) {
      const provisionAmount = Math.round(outstanding * applicable.provisionPct / 100 * 100) / 100
      provisions.push({ invoiceId: inv.id, bucketDays: applicable.bucketDays, outstanding, provisionPct: applicable.provisionPct, amount: provisionAmount })
    }
  }
  const total = provisions.reduce((s, p) => s + p.amount, 0)
  const stored = await tx.badDebtProvision.create({ data: { amount: total, period: periodKey, periodId: periodKey, outstanding: provisions.reduce((s, p) => s + p.outstanding, 0) } })

  logger.info({ component: "collections-provision", period: periodKey, invoices: invoices.length, total }, "Provision computed")
  return { period: periodKey, total, storedId: stored.id, provisions }
}

export { logger as collectionsLogger }
