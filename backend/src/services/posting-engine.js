import { prisma } from "../db.js"
import logger from "./logger.js"

// PostingEngine — converts billing/payment events into balanced journal entries
// and posts them to the General Ledger. Handles invoice issue, payment receipt,
// cancellation reversal, and adjustment. Debit=credit enforced (0.001 tolerance).

const BALANCE_TOLERANCE = 0.001

function now() { return new Date() }

async function resolvePeriod(timestamp) {
  return prisma.financialPeriod.findFirst({
    where: {
      startDate: { lte: timestamp },
      endDate: { gte: timestamp },
      status: "OPEN",
      archivedAt: null,
    },
  })
}

async function resolveMapping(eventType, context = {}) {
  const mappings = await prisma.accountMapping.findMany({
    where: { transactionType: eventType, active: true, archivedAt: null },
    include: { debitAccount: true, creditAccount: true },
    orderBy: { priority: "asc" },
  })
  if (mappings.length === 0) return null
  // Prefer a mapping with a matching condition; fall back to the first (base mapping)
  for (const m of mappings) {
    if (m.condition) {
      try {
        const cond = JSON.parse(m.condition)
        const field = cond.field
        const value = cond.value
        if (context[field] === value || context[field]?.toString() === value?.toString()) return m
      } catch { /* ignore malformed condition */ }
    }
  }
  return mappings[0]
}

async function generateEntryNumber(prefix = "JE") {
  const nowDate = now()
  const yyyymm = `${nowDate.getFullYear()}${String(nowDate.getMonth() + 1).padStart(2, "0")}`
  const prefixKey = `${prefix}-${yyyymm}-`
  const count = await prisma.journalEntry.count({ where: { entryNumber: { startsWith: prefixKey } } })
  return `${prefixKey}${String(count + 1).padStart(4, "0")}`
}

/**
 * Post a financial event: create balanced journal entry and post to GL.
 * @param {Object} input
 * @param {string} input.sourceType - INVOICE | PAYMENT
 * @param {string} input.sourceId - source record id
 * @param {string} input.eventType - INVOICE_ISSUED | PAYMENT_RECEIVED | INVOICE_CANCELLED | PAYMENT_REVERSED | INVOICE_ADJUSTED
 * @param {number} input.amount - event amount (positive)
 * @param {string} input.description
 * @param {Object} [input.context] - { customerId, areaId, utilityType, ... } for mapping condition
 * @param {Object} [input.tx] - optional prisma transaction client
 */
export async function postEvent({ sourceType, sourceId, eventType, amount, description, context = {}, tx = prisma }) {
  const client = tx
  const timestamp = now()

  // Guard: event must not already exist (allow retry of FAILED events)
  const existing = await client.financialEvent.findUnique({
    where: { sourceType_sourceId: { sourceType, sourceId } },
  })
  if (existing && existing.status === "POSTED") {
    return { ok: false, skipped: true, reason: "event_already_processed", event: existing }
  }
  if (existing && existing.status === "FAILED") {
    await client.financialEvent.delete({ where: { id: existing.id } })
  }

  // Resolve OPEN financial period
  const period = await resolvePeriod(timestamp)
  if (!period) {
    await client.financialEvent.create({
      data: { sourceType, sourceId, eventType, periodId: "", amount, description, status: "FAILED", errorMessage: "No open financial period" },
    })
    return { ok: false, error: "No open financial period for event date" }
  }

  // Resolve account mapping
  const mapping = await resolveMapping(eventType, context)
  if (!mapping) {
    await client.financialEvent.create({
      data: { sourceType, sourceId, eventType, periodId: period.id, amount, description, status: "FAILED", errorMessage: `No account mapping for ${eventType}` },
    })
    return { ok: false, error: `No account mapping for ${eventType}` }
  }

  // Build balanced journal lines
  const lines = [
    { accountId: mapping.debitAccountId, debitAmount: amount, creditAmount: 0, description: description || eventType },
    { accountId: mapping.creditAccountId, debitAmount: 0, creditAmount: amount, description: description || eventType },
  ]

  const totalDebit = lines.reduce((s, l) => s + l.debitAmount, 0)
  const totalCredit = lines.reduce((s, l) => s + l.creditAmount, 0)
  if (Math.abs(totalDebit - totalCredit) > BALANCE_TOLERANCE) {
    await client.financialEvent.create({
      data: { sourceType, sourceId, eventType, periodId: period.id, amount, description, status: "FAILED", errorMessage: "Debit/credit imbalance" },
    })
    return { ok: false, error: "Debit/credit imbalance" }
  }

  const entryNumber = await generateEntryNumber("JE")

  // Create journal entry (DRAFT) with lines
  const entry = await client.journalEntry.create({
    data: {
      entryNumber,
      description: description || eventType,
      entryDate: timestamp,
      periodId: period.id,
      status: "POSTED",
      source: eventType,
      referenceId: sourceId,
      referenceType: sourceType,
      totalDebit,
      totalCredit,
      postedAt: timestamp,
      createdBy: "posting-engine",
      lines: { create: lines },
    },
    include: { lines: true },
  })

  // Update GL balances for each account in the period
  const accountTotals = {}
  for (const line of entry.lines) {
    if (!accountTotals[line.accountId]) accountTotals[line.accountId] = { debit: 0, credit: 0 }
    accountTotals[line.accountId].debit += line.debitAmount
    accountTotals[line.accountId].credit += line.creditAmount
  }
  for (const [accountId, totals] of Object.entries(accountTotals)) {
    const existingGl = await client.generalLedgerEntry.findUnique({
      where: { accountId_periodId: { accountId, periodId: period.id } },
    })
    if (existingGl) {
      await client.generalLedgerEntry.update({
        where: { id: existingGl.id },
        data: { totalDebit: { increment: totals.debit }, totalCredit: { increment: totals.credit }, closingBalance: { increment: totals.debit - totals.credit } },
      })
    } else {
      const prev = await client.generalLedgerEntry.findFirst({
        where: { accountId, period: { status: "CLOSED" } },
        orderBy: [{ period: { year: "desc" } }, { period: { month: "desc" } }],
      })
      const opening = prev ? prev.closingBalance : 0
      await client.generalLedgerEntry.create({
        data: { accountId, periodId: period.id, openingBalance: opening, totalDebit: totals.debit, totalCredit: totals.credit, closingBalance: opening + totals.debit - totals.credit },
      })
    }
  }

  // Mark event as POSTED, link journal
  const event = await client.financialEvent.update({
    where: { sourceType_sourceId: { sourceType, sourceId } },
    data: { status: "POSTED", journalEntryId: entry.id, postedAt: timestamp },
  }).catch(async () => {
    return client.financialEvent.create({
      data: { sourceType, sourceId, eventType, periodId: period.id, journalEntryId: entry.id, amount, description, status: "POSTED", postedAt: timestamp },
    })
  })

  logger.info({ component: "posting-engine", eventType, sourceId, entryNumber, amount }, "Financial event posted")
  return { ok: true, event, journalEntry: entry }
}

/**
 * Reverse a previously posted financial event by creating a negated journal entry.
 */
export async function reverseEvent({ sourceType, sourceId, eventType, amount, description, context = {}, tx = prisma }) {
  const client = tx
  const original = await client.financialEvent.findUnique({ where: { sourceType_sourceId: { sourceType, sourceId } } })
  if (!original || original.status !== "POSTED") {
    return { ok: false, error: "Original event not found or not posted" }
  }
  return postEvent({
    sourceType: `${sourceType}_REVERSAL`,
    sourceId: `${sourceId}_rev`,
    eventType: eventType === "INVOICE_ISSUED" ? "INVOICE_CANCELLED" : eventType === "PAYMENT_RECEIVED" ? "PAYMENT_REVERSED" : eventType,
    amount,
    description: `Reversal: ${description || original.description}`,
    context,
    tx: client,
  })
}
