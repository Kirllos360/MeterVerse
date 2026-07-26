import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

// ─── Account Schemas ──────────────────────────────────────────────────────────

const createAccountSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  type: z.string().default("ASSET"),
  category: z.string().max(100).optional().or(z.literal("")),
  parentId: z.string().uuid().optional().or(z.literal("")),
  currency: z.string().max(10).default("EGP"),
  description: z.string().max(500).optional().or(z.literal("")),
})

const updateAccountSchema = createAccountSchema.partial()

// ─── Journal Entry Schemas ────────────────────────────────────────────────────

const journalLineSchema = z.object({
  accountId: z.string().uuid(),
  description: z.string().max(500).optional().or(z.literal("")),
  debitAmount: z.number().min(0).default(0),
  creditAmount: z.number().min(0).default(0),
})

const createJournalSchema = z.object({
  description: z.string().min(1).max(1000),
  entryDate: z.string().min(1),
  periodId: z.string().uuid(),
  lines: z.array(journalLineSchema).min(1).max(500),
  source: z.string().default("MANUAL"),
})

const updateJournalSchema = z.object({
  description: z.string().min(1).max(1000).optional(),
  entryDate: z.string().optional(),
  lines: z.array(journalLineSchema).min(1).max(500).optional(),
})

// ─── Financial Period Schema ──────────────────────────────────────────────────

const createPeriodSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
})

// ═══════════════════════════════════════════════════════════════════════════════
//  ACCOUNTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /accounts — List accounts (filterable)
router.get("/accounts", requirePermission("accounting.accounts.list"), async (req, res, next) => {
  try {
    const { type, active, parentId } = req.query
    const where = { archivedAt: null }
    if (type) where.type = type
    if (active !== undefined) where.active = active === "true"
    if (parentId) where.parentId = parentId
    if (parentId === "null") where.parentId = null

    const accounts = await prisma.account.findMany({
      where,
      orderBy: { code: "asc" },
      include: { children: { where: { archivedAt: null }, select: { id: true, code: true, name: true, type: true, active: true } } },
    })
    res.json({ accounts })
  } catch (err) { next(err) }
})

// GET /accounts/:id — Single account with children
router.get("/accounts/:id", requirePermission("accounting.accounts.list"), async (req, res, next) => {
  try {
    const account = await prisma.account.findFirst({
      where: { id: req.params.id, archivedAt: null },
      include: {
        children: { where: { archivedAt: null }, orderBy: { code: "asc" } },
        parent: true,
      },
    })
    if (!account) return res.status(404).json({ error: "Account not found" })
    auditLog(req, "accounting.account.viewed", { accountId: req.params.id })
    res.json({ account })
  } catch (err) { next(err) }
})

// POST /accounts — Create account
router.post("/accounts", requirePermission("accounting.accounts.create"), async (req, res, next) => {
  try {
    const data = createAccountSchema.parse(req.body)
    if (data.parentId === "") data.parentId = undefined

    const existing = await prisma.account.findUnique({ where: { code: data.code } })
    if (existing) return res.status(409).json({ error: "Account code already exists" })

    const account = await prisma.account.create({ data })
    auditLog(req, "accounting.account.created", { accountId: account.id, code: account.code })
    res.status(201).json({ account })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// PUT /accounts/:id — Update account
router.put("/accounts/:id", requirePermission("accounting.accounts.update"), async (req, res, next) => {
  try {
    const data = updateAccountSchema.parse(req.body)
    if (data.parentId === "") data.parentId = null

    const account = await prisma.account.findFirst({ where: { id: req.params.id, archivedAt: null } })
    if (!account) return res.status(404).json({ error: "Account not found" })

    if (data.code && data.code !== account.code) {
      const dup = await prisma.account.findUnique({ where: { code: data.code } })
      if (dup) return res.status(409).json({ error: "Account code already in use" })
    }

    const updated = await prisma.account.update({ where: { id: req.params.id }, data })
    auditLog(req, "accounting.account.updated", { accountId: updated.id, changes: Object.keys(data) })
    res.json({ account: updated })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// DELETE /accounts/:id — Soft delete (guard: no journal lines)
router.delete("/accounts/:id", requirePermission("accounting.accounts.delete"), async (req, res, next) => {
  try {
    const account = await prisma.account.findFirst({ where: { id: req.params.id, archivedAt: null } })
    if (!account) return res.status(404).json({ error: "Account not found" })

    const childCount = await prisma.account.count({ where: { parentId: req.params.id, archivedAt: null } })
    if (childCount > 0) return res.status(400).json({ error: "Cannot delete account with active child accounts" })

    const lineCount = await prisma.journalLineItem.count({ where: { accountId: req.params.id } })
    if (lineCount > 0) return res.status(400).json({ error: "Cannot delete account with journal line references" })

    await prisma.account.update({ where: { id: req.params.id }, data: { archivedAt: new Date(), active: false } })
    auditLog(req, "accounting.account.deleted", { accountId: req.params.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ═══════════════════════════════════════════════════════════════════════════════
//  JOURNAL ENTRIES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /journal-entries — List journal entries (filterable)
router.get("/journal-entries", requirePermission("accounting.journal.list"), async (req, res, next) => {
  try {
    const { periodId, status, dateFrom, dateTo, page = 1, limit = 20 } = req.query
    const where = { archivedAt: null }
    if (periodId) where.periodId = periodId
    if (status) where.status = status
    if (dateFrom || dateTo) {
      where.entryDate = {}
      if (dateFrom) where.entryDate.gte = new Date(dateFrom)
      if (dateTo) where.entryDate.lte = new Date(dateTo)
    }

    const skip = (Math.max(1, Number(page)) - 1) * Math.min(100, Math.max(1, Number(limit)))
    const take = Math.min(100, Math.max(1, Number(limit)))

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        skip,
        take,
        orderBy: { entryDate: "desc" },
        include: {
          period: { select: { id: true, year: true, month: true, status: true } },
          _count: { select: { lines: true } },
        },
      }),
      prisma.journalEntry.count({ where }),
    ])
    res.json({ entries, total, page: Number(page), limit: take })
  } catch (err) { next(err) }
})

// GET /journal-entries/:id — Single entry with lines + accounts
router.get("/journal-entries/:id", requirePermission("accounting.journal.list"), async (req, res, next) => {
  try {
    const entry = await prisma.journalEntry.findFirst({
      where: { id: req.params.id, archivedAt: null },
      include: {
        lines: {
          include: { account: { select: { id: true, code: true, name: true, type: true } } },
          orderBy: { createdAt: "asc" },
        },
        period: true,
      },
    })
    if (!entry) return res.status(404).json({ error: "Journal entry not found" })
    res.json({ entry })
  } catch (err) { next(err) }
})

// POST /journal-entries — Create journal entry with lines
router.post("/journal-entries", requirePermission("accounting.journal.create"), async (req, res, next) => {
  try {
    const data = createJournalSchema.parse(req.body)

    const totalDebit = data.lines.reduce((s, l) => s + l.debitAmount, 0)
    const totalCredit = data.lines.reduce((s, l) => s + l.creditAmount, 0)

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      return res.status(400).json({ error: "Total debits must equal total credits", totalDebit, totalCredit })
    }

    const period = await prisma.financialPeriod.findUnique({ where: { id: data.periodId } })
    if (!period) return res.status(400).json({ error: "Financial period not found" })
    if (period.archivedAt) return res.status(400).json({ error: "Financial period is archived" })

    const now = new Date()
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`
    const prefix = `JE-${yearMonth}-`
    const count = await prisma.journalEntry.count({ where: { entryNumber: { startsWith: prefix } } })
    const entryNumber = `${prefix}${String(count + 1).padStart(4, "0")}`

    const entry = await prisma.journalEntry.create({
      data: {
        entryNumber,
        description: data.description,
        entryDate: new Date(data.entryDate),
        periodId: data.periodId,
        source: data.source,
        totalDebit,
        totalCredit,
        createdBy: req.user?.email,
        lines: {
          create: data.lines.map(l => ({
            accountId: l.accountId,
            description: l.description || undefined,
            debitAmount: l.debitAmount,
            creditAmount: l.creditAmount,
          })),
        },
      },
      include: { lines: { include: { account: { select: { id: true, code: true, name: true } } } } },
    })

    auditLog(req, "accounting.journal.created", { entryId: entry.id, entryNumber })
    res.status(201).json({ entry })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// PUT /journal-entries/:id — Update only when DRAFT
router.put("/journal-entries/:id", requirePermission("accounting.journal.update"), async (req, res, next) => {
  try {
    const entry = await prisma.journalEntry.findFirst({ where: { id: req.params.id, archivedAt: null } })
    if (!entry) return res.status(404).json({ error: "Journal entry not found" })
    if (entry.status !== "DRAFT") return res.status(400).json({ error: "Only DRAFT entries can be updated" })

    const data = updateJournalSchema.parse(req.body)

    const updateData = {}
    if (data.description) updateData.description = data.description
    if (data.entryDate) updateData.entryDate = new Date(data.entryDate)

    if (data.lines) {
      const totalDebit = data.lines.reduce((s, l) => s + l.debitAmount, 0)
      const totalCredit = data.lines.reduce((s, l) => s + l.creditAmount, 0)
      if (Math.abs(totalDebit - totalCredit) > 0.001) {
        return res.status(400).json({ error: "Total debits must equal total credits", totalDebit, totalCredit })
      }
      updateData.totalDebit = totalDebit
      updateData.totalCredit = totalCredit

      await prisma.journalLineItem.deleteMany({ where: { journalId: req.params.id } })
      updateData.lines = {
        create: data.lines.map(l => ({
          accountId: l.accountId,
          description: l.description || undefined,
          debitAmount: l.debitAmount,
          creditAmount: l.creditAmount,
        })),
      }
    }

    const updated = await prisma.journalEntry.update({
      where: { id: req.params.id },
      data: updateData,
      include: { lines: { include: { account: { select: { id: true, code: true, name: true } } } } },
    })

    auditLog(req, "accounting.journal.updated", { entryId: updated.id, changes: Object.keys(data) })
    res.json({ entry: updated })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// POST /journal-entries/:id/post — Post a journal entry
router.post("/journal-entries/:id/post", requirePermission("accounting.journal.post"), async (req, res, next) => {
  try {
    const entry = await prisma.journalEntry.findFirst({
      where: { id: req.params.id, archivedAt: null },
      include: { lines: true, period: true },
    })
    if (!entry) return res.status(404).json({ error: "Journal entry not found" })
    if (entry.status !== "DRAFT") return res.status(400).json({ error: "Only DRAFT entries can be posted" })
    if (entry.period.status !== "OPEN") return res.status(400).json({ error: "Financial period is not OPEN" })

    // Upsert GeneralLedgerEntry for each account in the period
    const accountTotals = {}
    for (const line of entry.lines) {
      if (!accountTotals[line.accountId]) {
        accountTotals[line.accountId] = { debit: 0, credit: 0 }
      }
      accountTotals[line.accountId].debit += line.debitAmount
      accountTotals[line.accountId].credit += line.creditAmount
    }

    for (const [accountId, totals] of Object.entries(accountTotals)) {
      const existing = await prisma.generalLedgerEntry.findUnique({
        where: { accountId_periodId: { accountId, periodId: entry.periodId } },
      })

      if (existing) {
        await prisma.generalLedgerEntry.update({
          where: { id: existing.id },
          data: {
            totalDebit: { increment: totals.debit },
            totalCredit: { increment: totals.credit },
            closingBalance: { increment: totals.debit - totals.credit },
          },
        })
      } else {
        const opening = await prisma.generalLedgerEntry.findFirst({
          where: { accountId, period: { status: "CLOSED" } },
          orderBy: { period: { year: "desc", month: "desc" } },
        })
        const openingBalance = opening ? opening.closingBalance : 0
        await prisma.generalLedgerEntry.create({
          data: {
            accountId,
            periodId: entry.periodId,
            openingBalance,
            totalDebit: totals.debit,
            totalCredit: totals.credit,
            closingBalance: openingBalance + totals.debit - totals.credit,
          },
        })
      }
    }

    const posted = await prisma.journalEntry.update({
      where: { id: req.params.id },
      data: { status: "POSTED", postedAt: new Date() },
    })

    auditLog(req, "accounting.journal.posted", { entryId: posted.id, entryNumber: posted.entryNumber })
    res.json({ entry: posted })
  } catch (err) { next(err) }
})

// POST /journal-entries/:id/reverse — Reverse a posted entry
router.post("/journal-entries/:id/reverse", requirePermission("accounting.journal.create"), async (req, res, next) => {
  try {
    const original = await prisma.journalEntry.findFirst({
      where: { id: req.params.id, archivedAt: null },
      include: { lines: true, period: true },
    })
    if (!original) return res.status(404).json({ error: "Journal entry not found" })
    if (original.status !== "POSTED") return res.status(400).json({ error: "Only POSTED entries can be reversed" })
    if (original.reversedAt) return res.status(400).json({ error: "Entry has already been reversed" })

    // Generate new entry with negated line amounts
    const now = new Date()
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`
    const prefix = `JE-${yearMonth}-`
    const count = await prisma.journalEntry.count({ where: { entryNumber: { startsWith: prefix } } })
    const entryNumber = `${prefix}${String(count + 1).padStart(4, "0")}`

    const reversingEntry = await prisma.journalEntry.create({
      data: {
        entryNumber,
        description: `Reversal of ${original.entryNumber}: ${original.description}`,
        entryDate: new Date(),
        periodId: original.periodId,
        source: "REVERSAL",
        referenceId: original.id,
        referenceType: "REVERSAL",
        totalDebit: original.totalCredit,
        totalCredit: original.totalDebit,
        createdBy: req.user?.email,
        lines: {
          create: original.lines.map(l => ({
            accountId: l.accountId,
            description: `Reversal: ${l.description || original.description}`,
            debitAmount: l.creditAmount,
            creditAmount: l.debitAmount,
          })),
        },
      },
      include: { lines: true },
    })

    // Auto-post the reversing entry
    const accountTotals = {}
    for (const line of reversingEntry.lines) {
      if (!accountTotals[line.accountId]) {
        accountTotals[line.accountId] = { debit: 0, credit: 0 }
      }
      accountTotals[line.accountId].debit += line.debitAmount
      accountTotals[line.accountId].credit += line.creditAmount
    }

    for (const [accountId, totals] of Object.entries(accountTotals)) {
      const existing = await prisma.generalLedgerEntry.findUnique({
        where: { accountId_periodId: { accountId, periodId: reversingEntry.periodId } },
      })
      if (existing) {
        await prisma.generalLedgerEntry.update({
          where: { id: existing.id },
          data: {
            totalDebit: { increment: totals.debit },
            totalCredit: { increment: totals.credit },
            closingBalance: { increment: totals.debit - totals.credit },
          },
        })
      } else {
        const opening = await prisma.generalLedgerEntry.findFirst({
          where: { accountId, period: { status: "CLOSED" } },
          orderBy: { period: { year: "desc", month: "desc" } },
        })
        const openingBalance = opening ? opening.closingBalance : 0
        await prisma.generalLedgerEntry.create({
          data: {
            accountId,
            periodId: reversingEntry.periodId,
            openingBalance,
            totalDebit: totals.debit,
            totalCredit: totals.credit,
            closingBalance: openingBalance + totals.debit - totals.credit,
          },
        })
      }
    }

    await prisma.journalEntry.update({
      where: { id: reversingEntry.id },
      data: { status: "POSTED", postedAt: new Date() },
    })

    await prisma.journalEntry.update({
      where: { id: original.id },
      data: { reversedAt: new Date() },
    })

    auditLog(req, "accounting.journal.reversed", { originalId: original.id, reversingId: reversingEntry.id })
    res.status(201).json({ entry: reversingEntry })
  } catch (err) { next(err) }
})

// ═══════════════════════════════════════════════════════════════════════════════
//  GENERAL LEDGER
// ═══════════════════════════════════════════════════════════════════════════════

// GET /general-ledger — List GL entries
router.get("/general-ledger", requirePermission("accounting.general-ledger.list"), async (req, res, next) => {
  try {
    const { accountId, periodId } = req.query
    const where = {}
    if (accountId) where.accountId = accountId
    if (periodId) where.periodId = periodId

    const entries = await prisma.generalLedgerEntry.findMany({
      where,
      orderBy: [{ period: { year: "asc" } }, { period: { month: "asc" } }, { account: { code: "asc" } }],
      include: {
        account: { select: { id: true, code: true, name: true, type: true } },
        period: { select: { id: true, year: true, month: true, status: true } },
      },
    })
    res.json({ entries })
  } catch (err) { next(err) }
})

// GET /general-ledger/summary — Aggregated account balances
router.get("/general-ledger/summary", requirePermission("accounting.general-ledger.list"), async (req, res, next) => {
  try {
    const { periodId } = req.query
    const where = {}
    if (periodId) where.periodId = periodId

    const entries = await prisma.generalLedgerEntry.findMany({
      where,
      include: { account: { select: { id: true, code: true, name: true, type: true, category: true } } },
    })

    const summary = {}
    for (const e of entries) {
      const key = e.accountId
      if (!summary[key]) {
        summary[key] = {
          account: e.account,
          totalOpening: 0,
          totalDebit: 0,
          totalCredit: 0,
          totalClosing: 0,
        }
      }
      summary[key].totalOpening += e.openingBalance
      summary[key].totalDebit += e.totalDebit
      summary[key].totalCredit += e.totalCredit
      summary[key].totalClosing += e.closingBalance
    }

    res.json({ summary: Object.values(summary) })
  } catch (err) { next(err) }
})

// ═══════════════════════════════════════════════════════════════════════════════
//  TRIAL BALANCE
// ═══════════════════════════════════════════════════════════════════════════════

// GET /trial-balance — Trial balance report for a period
router.get("/trial-balance", requirePermission("accounting.reports.trial-balance"), async (req, res, next) => {
  try {
    const { periodId } = req.query
    if (!periodId) return res.status(400).json({ error: "periodId query parameter is required" })

    const period = await prisma.financialPeriod.findUnique({ where: { id: periodId } })
    if (!period) return res.status(404).json({ error: "Financial period not found" })

    const accounts = await prisma.account.findMany({
      where: { archivedAt: null },
      include: {
        ledgers: { where: { periodId } },
      },
      orderBy: { code: "asc" },
    })

    const rows = accounts.map(a => {
      const gl = a.ledgers[0]
      return {
        accountId: a.id,
        code: a.code,
        name: a.name,
        type: a.type,
        openingBalance: gl ? gl.openingBalance : 0,
        totalDebit: gl ? gl.totalDebit : 0,
        totalCredit: gl ? gl.totalCredit : 0,
        closingBalance: gl ? gl.closingBalance : 0,
      }
    })

    const totals = rows.reduce(
      (acc, r) => ({
        openingDebit: acc.openingDebit + (r.openingBalance > 0 ? r.openingBalance : 0),
        openingCredit: acc.openingCredit + (r.openingBalance < 0 ? Math.abs(r.openingBalance) : 0),
        totalDebit: acc.totalDebit + r.totalDebit,
        totalCredit: acc.totalCredit + r.totalCredit,
        closingDebit: acc.closingDebit + (r.closingBalance > 0 ? r.closingBalance : 0),
        closingCredit: acc.closingCredit + (r.closingBalance < 0 ? Math.abs(r.closingBalance) : 0),
      }),
      { openingDebit: 0, openingCredit: 0, totalDebit: 0, totalCredit: 0, closingDebit: 0, closingCredit: 0 }
    )

    res.json({ period, rows, totals, balanced: Math.abs(totals.totalDebit - totals.totalCredit) < 0.001 })
  } catch (err) { next(err) }
})

// ═══════════════════════════════════════════════════════════════════════════════
//  FINANCIAL PERIODS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /financial-periods — List periods
router.get("/financial-periods", requirePermission("accounting.periods.list"), async (req, res, next) => {
  try {
    const { status, year } = req.query
    const where = { archivedAt: null }
    if (status) where.status = status
    if (year) where.year = Number(year)

    const periods = await prisma.financialPeriod.findMany({
      where,
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: { _count: { select: { journalEntries: true } } },
    })
    res.json({ periods })
  } catch (err) { next(err) }
})

// POST /financial-periods — Create period
router.post("/financial-periods", requirePermission("accounting.periods.create"), async (req, res, next) => {
  try {
    const data = createPeriodSchema.parse(req.body)

    const dup = await prisma.financialPeriod.findUnique({ where: { year_month: { year: data.year, month: data.month } } })
    if (dup) return res.status(409).json({ error: "Financial period already exists for this year/month" })

    const quarter = Math.ceil(data.month / 3)
    const period = await prisma.financialPeriod.create({
      data: {
        year: data.year,
        month: data.month,
        quarter,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    })
    auditLog(req, "accounting.period.created", { periodId: period.id, year: period.year, month: period.month })
    res.status(201).json({ period })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// POST /financial-periods/:id/close — Close period
router.post("/financial-periods/:id/close", requirePermission("accounting.periods.close"), async (req, res, next) => {
  try {
    const period = await prisma.financialPeriod.findFirst({
      where: { id: req.params.id, archivedAt: null },
      include: { _count: { select: { journalEntries: true } } },
    })
    if (!period) return res.status(404).json({ error: "Financial period not found" })
    if (period.status === "CLOSED") return res.status(400).json({ error: "Period is already closed" })

    const draftCount = await prisma.journalEntry.count({
      where: { periodId: req.params.id, status: "DRAFT", archivedAt: null },
    })
    if (draftCount > 0) {
      return res.status(400).json({ error: `Cannot close period with ${draftCount} DRAFT journal entr${draftCount === 1 ? "y" : "ies"}` })
    }

    // Generate closing entries for revenue and expense accounts
    const incomeAccounts = await prisma.account.findMany({
      where: { type: { in: ["REVENUE", "EXPENSE"] }, archivedAt: null },
      include: { ledgers: { where: { periodId: req.params.id } } },
    })

    const retainedEarnings = await prisma.account.findFirst({
      where: { code: "3001", archivedAt: null },
    })

    const closingLines = []
    let netIncome = 0

    for (const acc of incomeAccounts) {
      const gl = acc.ledgers[0]
      if (!gl || (gl.totalDebit === 0 && gl.totalCredit === 0)) continue

      const balance = gl.closingBalance
      if (Math.abs(balance) < 0.001) continue

      if (acc.type === "REVENUE") {
        // Revenue has credit balance — debit to zero, credit to retained earnings
        closingLines.push({ accountId: acc.id, debitAmount: balance, creditAmount: 0, description: `Close ${acc.name}` })
        netIncome += balance
      } else {
        // Expense has debit balance — credit to zero, debit to retained earnings
        closingLines.push({ accountId: acc.id, debitAmount: 0, creditAmount: -balance, description: `Close ${acc.name}` })
        netIncome -= balance
      }
    }

    if (closingLines.length > 0 && retainedEarnings) {
      if (netIncome > 0) {
        closingLines.push({ accountId: retainedEarnings.id, debitAmount: 0, creditAmount: netIncome, description: "Net income transfer" })
      } else if (netIncome < 0) {
        closingLines.push({ accountId: retainedEarnings.id, debitAmount: -netIncome, creditAmount: 0, description: "Net loss transfer" })
      }

      const totalDebit = closingLines.reduce((s, l) => s + l.debitAmount, 0)
      const totalCredit = closingLines.reduce((s, l) => s + l.creditAmount, 0)

      const now = new Date()
      const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`
      const prefix = `JE-${yearMonth}-`
      const count = await prisma.journalEntry.count({ where: { entryNumber: { startsWith: prefix } } })
      const entryNumber = `${prefix}${String(count + 1).padStart(4, "0")}`

      // Create and post the closing entry
      const closingEntry = await prisma.journalEntry.create({
        data: {
          entryNumber,
          description: `Closing entry for ${period.year}-${String(period.month).padStart(2, "0")}`,
          entryDate: period.endDate,
          periodId: req.params.id,
          source: "CLOSING",
          status: "POSTED",
          postedAt: now,
          totalDebit,
          totalCredit,
          createdBy: req.user?.email,
          lines: { create: closingLines },
        },
      })

      // Update GL entries for closing lines
      const glTotals = {}
      for (const line of closingLines) {
        if (!glTotals[line.accountId]) glTotals[line.accountId] = { debit: 0, credit: 0 }
        glTotals[line.accountId].debit += line.debitAmount
        glTotals[line.accountId].credit += line.creditAmount
      }
      for (const [accountId, totals] of Object.entries(glTotals)) {
        const existing = await prisma.generalLedgerEntry.findUnique({
          where: { accountId_periodId: { accountId, periodId: req.params.id } },
        })
        if (existing) {
          await prisma.generalLedgerEntry.update({
            where: { id: existing.id },
            data: {
              totalDebit: { increment: totals.debit },
              totalCredit: { increment: totals.credit },
              closingBalance: { increment: totals.debit - totals.credit },
            },
          })
        } else {
          const prev = await prisma.generalLedgerEntry.findFirst({
            where: { accountId, period: { status: "CLOSED" } },
            orderBy: { period: { year: "desc", month: "desc" } },
          })
          const ob = prev ? prev.closingBalance : 0
          await prisma.generalLedgerEntry.create({
            data: {
              accountId,
              periodId: req.params.id,
              openingBalance: ob,
              totalDebit: totals.debit,
              totalCredit: totals.credit,
              closingBalance: ob + totals.debit - totals.credit,
            },
          })
        }
      }
    }

    const closed = await prisma.financialPeriod.update({
      where: { id: req.params.id },
      data: { status: "CLOSED", closedAt: new Date(), closedBy: req.user?.email },
    })

    auditLog(req, "accounting.period.closed", { periodId: closed.id, year: closed.year, month: closed.month })
    res.json({ period: closed })
  } catch (err) { next(err) }
})

export { router as accountingRouter }
