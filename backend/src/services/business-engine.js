// ═══════════════════════════════════════════════════════════════════════════════
//  MeterVerse Business Engine — Reading-to-Revenue Pipeline
// ═══════════════════════════════════════════════════════════════════════════════

import { prisma } from "../server.js"

// ─── PIPELINE STEP 1: VALIDATE READING ────────────────────────────────────────

export async function validateReading(readingId) {
  const reading = await prisma.reading.findUnique({ where: { id: readingId }, include: { meter: true } })
  if (!reading) throw new Error(`Reading ${readingId} not found`)

  const rules = await prisma.validationRule.findMany({ where: { entityType: "reading", active: true } })
  const results = []
  for (const rule of rules) {
    try {
      const condition = JSON.parse(rule.condition)
      let passed = true
      if (condition.maxValue && reading.value > condition.maxValue) passed = false
      if (condition.minValue && reading.value < condition.minValue) passed = false
      if (condition.maxChange && reading.meter) {
        const prevReading = await prisma.reading.findFirst({
          where: { meterId: reading.meterId, timestamp: { lt: reading.timestamp } },
          orderBy: { timestamp: "desc" },
        })
        if (prevReading && Math.abs(reading.value - prevReading.value) > condition.maxChange) passed = false
      }
      const status = passed ? "passed" : (rule.action === "reject" ? "failed" : "flagged")
      const result = await prisma.validationResult.create({
        data: { validationRuleId: rule.id, entityType: "reading", entityId: readingId, status, message: passed ? null : `Failed: ${rule.name}` },
      })
      results.push(result)
    } catch (e) { /* rule parse error — skip */ }
  }
  const finalStatus = results.some(r => r.status === "failed") ? "rejected" : results.some(r => r.status === "flagged") ? "flagged" : "valid"
  await prisma.reading.update({ where: { id: readingId }, data: { status: finalStatus } })
  return { readingId, status: finalStatus, validationResults: results }
}

// ─── PIPELINE STEP 2: CALCULATE CONSUMPTION ───────────────────────────────────

export async function calculateConsumption(meterId, startDate, endDate) {
  const readings = await prisma.reading.findMany({
    where: { meterId, timestamp: { gte: new Date(startDate), lte: new Date(endDate) }, status: "valid" },
    orderBy: { timestamp: "asc" },
  })
  if (readings.length < 2) return { meterId, consumption: 0, readingCount: readings.length, error: "Need at least 2 valid readings" }
  const first = readings[0].value
  const last = readings[readings.length - 1].value
  const consumption = Math.max(0, last - first)
  return { meterId, consumption, readingCount: readings.length, firstReading: readings[0], lastReading: readings[readings.length - 1] }
}

// ─── PIPELINE STEP 3: APPLY TARIFF ────────────────────────────────────────────

export async function applyTariff(tariffId, consumption, periodStart, periodEnd) {
  const tariff = await prisma.tariff.findUnique({ where: { id: tariffId }, include: { rates: true, tiers: true } })
  if (!tariff) throw new Error(`Tariff ${tariffId} not found`)

  let totalCharge = 0
  const appliedCharges = []

  // Apply tiered rates first
  const sortedTiers = tariff.tiers.sort((a, b) => a.priority - b.priority)
  let remainingConsumption = consumption
  for (const tier of sortedTiers) {
    const tierMax = tier.maxValue ?? remainingConsumption
    const tierMin = tier.minValue ?? 0
    const tierConsumption = Math.min(remainingConsumption, tierMax - tierMin)
    if (tierConsumption <= 0) continue
    const charge = tierConsumption * tier.rate
    totalCharge += charge
    appliedCharges.push({ type: "tier", name: tier.name, consumption: tierConsumption, rate: tier.rate, charge })
    remainingConsumption -= tierConsumption
    if (remainingConsumption <= 0) break
  }

  // Apply flat rates on top
  for (const rate of tariff.rates) {
    const charge = consumption * rate.rate
    totalCharge += charge
    appliedCharges.push({ type: "rate", name: rate.name, consumption, rate: rate.rate, charge })
  }

  return { tariffId: tariff.id, tariffName: tariff.name, totalConsumption: consumption, totalCharge, appliedCharges }
}

// ─── PIPELINE STEP 4: GENERATE CHARGES ────────────────────────────────────────

export async function generateCharges(customerId, invoiceId, consumption, periodStart, periodEnd) {
  const chargeRules = await prisma.chargeRule.findMany({ where: { active: true }, orderBy: { priority: "asc" } })
  const charges = []
  for (const rule of chargeRules) {
    let amount = 0
    if (rule.type === "fixed") {
      amount = parseFloat(rule.formula || "0")
    } else if (rule.type === "rate_based") {
      amount = consumption * parseFloat(rule.formula || "0")
    }
    if (amount > 0) {
      const item = await prisma.invoiceItem.create({
        data: { invoiceId, type: "charge", description: rule.name, quantity: consumption, unitPrice: amount / consumption, amount, total: amount },
      })
      charges.push(item)
    }
  }
  return charges
}

// ─── PIPELINE STEP 5: ASSEMBLE INVOICE ────────────────────────────────────────

export async function assembleInvoice(customerId, periodStart, periodEnd, charges, consumptionData) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } })
  const invoiceCount = await prisma.invoice.count()
  const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, "0")}`

  const subtotal = charges.reduce((s, c) => s + c.total, 0)
  const taxRate = 0.14
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  const invoice = await prisma.invoice.create({
    data: {
      number: invoiceNumber, customerId, amount: total, status: "pending",
      dueDate: new Date(Date.now() + 30 * 86400000), issuedAt: new Date(),
    },
  })

  // Create billing history
  if (consumptionData?.billCycleId) {
    await prisma.billRunHistory.create({
      data: { billRunId: consumptionData.billCycleId, action: "invoice_generated", details: `Invoice ${invoiceNumber}: EGP ${total.toFixed(2)}` },
    })
  }

  return { invoice, invoiceNumber, subtotal, taxAmount, total }
}

// ─── PIPELINE STEP 6: POST TO LEDGER ─────────────────────────────────────────

export async function postToLedger(invoiceId, amount) {
  // Ledger posting — creates debit (customer receivable) entry
  const entry = await prisma.auditEntry.create({
    data: {
      action: "ledger.post", resource: "invoice", resourceId: invoiceId,
      details: JSON.stringify({ invoiceId, amount, type: "debit", account: "accounts_receivable" }),
      status: "success",
    },
  })
  return { ledgerEntry: entry, account: "accounts_receivable", amount, type: "debit" }
}

// ─── FULL PIPELINE EXECUTION ─────────────────────────────────────────────────

export async function executePipeline(meterId, customerId, tariffId, periodStart, periodEnd) {
  const steps = []
  const errors = []

  // Step 1: Calculate consumption
  try {
    const consumption = await calculateConsumption(meterId, periodStart, periodEnd)
    steps.push({ step: "consumption", data: consumption })
    if (consumption.error) { errors.push(consumption.error); return { steps, errors, success: false } }

    // Step 2: Apply tariff
    const tariffResult = await applyTariff(tariffId, consumption.consumption, periodStart, periodEnd)
    steps.push({ step: "tariff", data: tariffResult })

    // Step 3: Find/create bill cycle
    let billCycle = await prisma.billCycle.findFirst({ where: { status: "active" } })
    let billRun = null
    if (billCycle) {
      billRun = await prisma.billRun.create({
        data: { billCycleId: billCycle.id, periodStart: new Date(periodStart), periodEnd: new Date(periodEnd), status: "processing" },
      })
    }

    // Step 4: Generate invoice items
    const invoice = await prisma.invoice.create({
      data: {
        number: `INV-${Date.now()}`, customerId, amount: tariffResult.totalCharge,
        status: "pending", dueDate: new Date(Date.now() + 30 * 86400000),
      },
    })
    const charges = await generateCharges(customerId, invoice.id, consumption.consumption, periodStart, periodEnd)
    steps.push({ step: "invoice", data: { invoice, charges } })

    // Step 5: Post to ledger
    const ledger = await postToLedger(invoice.id, tariffResult.totalCharge)
    steps.push({ step: "ledger", data: ledger })

    // Update bill run
    if (billRun) {
      await prisma.billRun.update({
        where: { id: billRun.id },
        data: { status: "completed", totalCount: 1, totalAmount: tariffResult.totalCharge, completedAt: new Date() },
      })
    }

    return { steps, errors, success: true }
  } catch (e) {
    errors.push(e.message)
    return { steps, errors, success: false }
  }
}
