// ═══════════════════════════════════════════════════════════════════════════════
//  MeterVerse AI Engine — 9 Domain Agents
//  Ready for LLM integration (OpenAI/Anthropic)
// ═══════════════════════════════════════════════════════════════════════════════

import { prisma } from "../server.js"

// ─── AI Operator — Natural language system query ─────────────────────────────

export async function aiOperator(query) {
  const q = query.toLowerCase()
  const results = []

  // Intent detection + execution
  if (q.includes("overdue") || q.includes("unpaid")) {
    const overdue = await prisma.invoice.count({ where: { status: "overdue" } })
    const total = await prisma.invoice.aggregate({ where: { status: "overdue" }, _sum: { amount: true } })
    results.push({ intent: "overdue_invoices", data: { count: overdue, total: total._sum.amount || 0 }, summary: `Found ${overdue} overdue invoices totaling EGP ${(total._sum.amount || 0).toLocaleString()}` })
  }
  if (q.includes("active") && (q.includes("meter") || q.includes("customer"))) {
    const meters = await prisma.meter.count({ where: { status: "active" } })
    const customers = await prisma.customer.count({ where: { status: "active" } })
    results.push({ intent: "active_entities", data: { meters, customers }, summary: `${meters} active meters, ${customers} active customers` })
  }
  if (q.includes("revenue") || q.includes("total") && q.includes("invoice")) {
    const total = await prisma.invoice.aggregate({ _sum: { amount: true } })
    results.push({ intent: "total_revenue", data: { total: total._sum.amount || 0 }, summary: `Total invoiced: EGP ${(total._sum.amount || 0).toLocaleString()}` })
  }
  if (q.includes("reading") && (q.includes("today") || q.includes("recent"))) {
    const today = new Date(); today.setHours(0,0,0,0)
    const count = await prisma.reading.count({ where: { timestamp: { gte: today } } })
    results.push({ intent: "today_readings", data: { count }, summary: `${count} readings recorded today` })
  }
  if (q.includes("error") || q.includes("fail")) {
    const count = await prisma.auditEntry.count({ where: { status: "failure", timestamp: { gte: new Date(Date.now() - 86400000) } } })
    results.push({ intent: "error_count", data: { count }, summary: `${count} errors in the last 24 hours` })
  }
  if (q.includes("meter") && (q.includes("area") || q.includes("region"))) {
    const areas = await prisma.meter.groupBy({ by: ["area"], _count: true, orderBy: { _count: { area: "desc" } } })
    results.push({ intent: "meters_by_area", data: areas.filter(a => a.area), summary: areas.filter(a => a.area).map(a => `${a.area}: ${a._count} meters`).join(", ") })
  }

  if (results.length === 0) {
    results.push({ intent: "unrecognized", data: {}, summary: `I can help with: overdue invoices, active meters/customers, total revenue, today's readings, errors, and meters by area. Try: "Show me overdue invoices"` })
  }

  return { query, results, timestamp: new Date().toISOString() }
}

// ─── AI Billing Assistant ────────────────────────────────────────────────────

export async function aiBillingAssistant(invoiceId) {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { customer: { select: { name: true } }, payments: true } })
  if (!invoice) return { error: "Invoice not found" }

  const analysis = {
    invoiceNumber: invoice.number,
    customer: invoice.customer?.name || "Unknown",
    amount: invoice.amount,
    status: invoice.status,
    dueDate: invoice.dueDate,
    paidAmount: invoice.payments.reduce((s, p) => s + p.amount, 0),
    balance: invoice.amount - invoice.payments.reduce((s, p) => s + p.amount, 0),
    paymentCount: invoice.payments.length,
    daysOverdue: invoice.status === "overdue" && invoice.dueDate ? Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / 86400000) : 0,
  }

  let insight = `Invoice ${analysis.invoiceNumber} for ${analysis.customer}: EGP ${analysis.amount.toFixed(2)}`
  if (analysis.status === "paid") insight += ` — PAID in full`
  else if (analysis.status === "overdue") insight += ` — OVERDUE by ${analysis.daysOverdue} days, balance EGP ${analysis.balance.toFixed(2)}`
  else if (analysis.status === "pending") insight += ` — PENDING, due ${new Date(analysis.dueDate).toLocaleDateString()}`
  else insight += ` — Status: ${analysis.status}`

  return { analysis, insight }
}

// ─── AI Reading Validator ────────────────────────────────────────────────────

export async function aiReadingValidator(meterId) {
  const readings = await prisma.reading.findMany({ where: { meterId }, orderBy: { timestamp: "desc" }, take: 20 })
  if (readings.length < 3) return { valid: true, message: "Need at least 3 readings for validation", readings: readings.length }

  const anomalies = []
  for (let i = 1; i < readings.length; i++) {
    const diff = Math.abs(readings[i - 1].value - readings[i].value)
    const avgDiff = readings.slice(1).reduce((s, r, idx) => s + Math.abs(readings[idx].value - r.value), 0) / (readings.length - 1)
    if (diff > avgDiff * 3) {
      anomalies.push({ readingId: readings[i - 1].id, value: readings[i - 1].value, expected: readings[i].value + avgDiff, deviation: Math.round(diff / avgDiff * 100) - 100 })
    }
  }

  return {
    meterId,
    readingsAnalyzed: readings.length,
    anomaliesFound: anomalies.length,
    anomalies: anomalies.slice(0, 5),
    status: anomalies.length === 0 ? "normal" : "anomaly_detected",
    recommendation: anomalies.length > 0 ? `${anomalies.length} anomalous readings detected. Recommend review.` : "All readings within normal range.",
  }
}

// ─── AI Leak Detection ───────────────────────────────────────────────────────

export async function aiLeakDetection(meterId) {
  const readings = await prisma.reading.findMany({ where: { meterId }, orderBy: { timestamp: "asc" }, take: 60 })
  if (readings.length < 10) return { status: "insufficient_data", message: "Need at least 10 readings for leak analysis" }

  // Check for constant non-zero consumption (potential leak)
  const nonZero = readings.filter(r => r.value > 0)
  const minReading = Math.min(...readings.filter(r => r.value > 0).map(r => r.value))
  const hasContinuousConsumption = nonZero.length > readings.length * 0.8
  const minConsumption = Math.min(...readings.map(r => r.value))

  const leakScore = hasContinuousConsumption && minConsumption > 0 ? Math.min(100, Math.round((nonZero.length / readings.length) * 100)) : 0

  return {
    meterId,
    readingsAnalyzed: readings.length,
    leakScore,
    status: leakScore > 70 ? "leak_suspected" : leakScore > 40 ? "possible_leak" : "normal",
    details: {
      continuousConsumption: hasContinuousConsumption,
      minReadingValue: minConsumption,
      nonZeroPercentage: Math.round((nonZero.length / readings.length) * 100),
    },
    recommendation: leakScore > 70 ? "Immediate inspection recommended — possible continuous leak detected." : leakScore > 40 ? "Monitor consumption pattern — slight continuous usage detected." : "Consumption pattern normal.",
  }
}

// ─── AI Forecasting ──────────────────────────────────────────────────────────

export async function aiForecasting(entityType = "consumption", period = 30) {
  const now = new Date()
  const historicalData = await prisma.reading.findMany({ orderBy: { timestamp: "desc" }, take: 100 })

  if (historicalData.length < 5) return { status: "insufficient_data", message: "Need more historical data for forecasting" }

  const totalHistorical = historicalData.reduce((s, r) => s + r.value, 0)
  const avgPerDay = totalHistorical / Math.max(1, historicalData.length)
  const projectedTotal = avgPerDay * period

  // Simple linear trend
  const sorted = [...historicalData].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  const first = sorted[0].value
  const last = sorted[sorted.length - 1].value
  const trend = last > first ? "increasing" : last < first ? "decreasing" : "stable"
  const changeRate = first > 0 ? Math.round((last - first) / first * 100) : 0

  return {
    entityType,
    forecastPeriod: `${period} days`,
    historicalDataPoints: historicalData.length,
    avgDailyConsumption: Math.round(avgPerDay * 100) / 100,
    projectedConsumption: Math.round(projectedTotal * 100) / 100,
    trend,
    changeRate: `${changeRate > 0 ? "+" : ""}${changeRate}%`,
    confidence: historicalData.length > 50 ? "high" : historicalData.length > 20 ? "medium" : "low",
  }
}

// ─── AI Root Cause Analysis ─────────────────────────────────────────────────

export async function aiRootCauseAnalysis(invoiceId) {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { customer: true, payments: true } })
  if (!invoice) return { error: "Invoice not found" }

  const issues = []
  if (invoice.status === "overdue" && invoice.dueDate && new Date(invoice.dueDate) < new Date()) {
    issues.push({ type: "overdue", severity: "high", detail: `Invoice overdue by ${Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / 86400000)} days` })
  }
  if (invoice.payments.length === 0 && invoice.status === "pending") {
    issues.push({ type: "no_payment", severity: "medium", detail: "No payments recorded against this invoice" })
  }
  if (invoice.amount > 10000) {
    issues.push({ type: "high_value", severity: "info", detail: "High-value invoice — may require additional verification" })
  }

  return {
    invoiceId: invoice.id,
    invoiceNumber: invoice.number,
    customer: invoice.customer?.name || "Unknown",
    totalAmount: invoice.amount,
    status: invoice.status,
    issuesFound: issues.length,
    issues,
    recommendation: issues.length === 0 ? "No issues detected." : `${issues.length} issues found. ${issues.filter(i => i.severity === "high").length} high severity.`,
  }
}

// ─── AI Report Builder ──────────────────────────────────────────────────────

export async function aiReportBuilder(params) {
  const { reportType = "summary", period = "monthly", metric = "revenue" } = params

  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
  const revenue = await prisma.invoice.aggregate({ where: { issuedAt: { gte: startDate } }, _sum: { amount: true } })
  const readings = await prisma.reading.count({ where: { timestamp: { gte: startDate } } })
  const invoices = await prisma.invoice.count({ where: { issuedAt: { gte: startDate } } })
  const newCustomers = await prisma.customer.count({ where: { createdAt: { gte: startDate } } })

  const report = {
    title: `${metric.charAt(0).toUpperCase() + metric.slice(1)} Report — ${period}`,
    generatedAt: new Date().toISOString(),
    period: { start: startDate.toISOString().split("T")[0], end: now.toISOString().split("T")[0] },
    metrics: { revenue: revenue._sum.amount || 0, readings, invoices, newCustomers },
    summary: `EGP ${(revenue._sum.amount || 0).toLocaleString()} revenue from ${invoices} invoices with ${readings} readings and ${newCustomers} new customers.`,
  }

  // Additional metric-specific calculations
  if (metric === "consumption" || reportType === "detailed") {
    const consumption = await prisma.reading.aggregate({ where: { timestamp: { gte: startDate } }, _sum: { value: true } })
    report.metrics.consumption = consumption._sum.value || 0
    report.metrics.avgPerInvoice = invoices > 0 ? Math.round((revenue._sum.amount || 0) / invoices) : 0
    report.summary += ` Total consumption: ${(consumption._sum.value || 0).toLocaleString()} kWh.`
  }

  return report
}

// ─── AI SQL Assistant ───────────────────────────────────────────────────────

export async function aiSqlAssistant(naturalLanguage) {
  const q = naturalLanguage.toLowerCase()

  const patterns = [
    { pattern: /overdue.*invoice|invoice.*overdue|unpaid.*invoice/, sql: "SELECT * FROM Invoice WHERE status = 'overdue'", description: "All overdue invoices" },
    { pattern: /active.*customer|customer.*active/, sql: "SELECT * FROM Customer WHERE status = 'active'", description: "All active customers" },
    { pattern: /total.*revenue|revenue.*total/, sql: "SELECT SUM(amount) FROM Invoice", description: "Total revenue" },
    { pattern: /reading.*today|today.*reading/, sql: "SELECT COUNT(*) FROM Reading WHERE timestamp >= CURRENT_DATE", description: "Today's readings" },
    { pattern: /meter.*area|area.*meter/, sql: "SELECT area, COUNT(*) FROM Meter GROUP BY area ORDER BY COUNT(*) DESC", description: "Meters grouped by area" },
    { pattern: /customer.*invoice.*amount|invoice.*customer.*amount/, sql: "SELECT c.name, COUNT(i.id), SUM(i.amount) FROM Customer c JOIN Invoice i ON i.customerId = c.id GROUP BY c.name", description: "Customer invoice summary" },
    { pattern: /error.*24h|fail.*today/, sql: "SELECT COUNT(*) FROM AuditEntry WHERE status = 'failure' AND timestamp >= NOW() - INTERVAL '24 hours'", description: "Errors in last 24 hours" },
  ]

  const matches = patterns.filter(p => p.pattern.test(q))
  if (matches.length > 0) {
    return { naturalLanguage, sql: matches.map(m => m.sql), description: matches.map(m => m.description).join("; "), generated: true }
  }

  return { naturalLanguage, sql: [], description: "I can generate SQL for: overdue invoices, active customers, total revenue, today's readings, meters by area, customer invoices, and errors. Try: 'Show me all overdue invoices'", generated: false }
}

// ─── AI Workflow Generator ──────────────────────────────────────────────────

export async function aiWorkflowGenerator(description) {
  const d = description.toLowerCase()

  const workflows = [
    { trigger: "overdue_invoice", condition: "status = 'overdue'", actions: ["send_reminder_email", "escalate_to_collections", "apply_late_fee"], entities: ["invoice", "customer"] },
    { trigger: "high_consumption", condition: "consumption > avg * 1.5", actions: ["flag_for_review", "notify_customer", "schedule_inspection"], entities: ["meter", "reading"] },
    { trigger: "new_customer_onboarding", condition: "status = 'active'", actions: ["assign_meter", "create_welcome_packet", "schedule_installation"], entities: ["customer"] },
    { trigger: "payment_received", condition: "status = 'completed'", actions: ["update_invoice", "send_receipt", "update_balance"], entities: ["payment", "invoice"] },
    { trigger: "meter_reading_anomaly", condition: "reading > threshold", actions: ["flag_reading", "notify_technician", "schedule_verification"], entities: ["meter", "reading"] },
  ]

  // Simple matching
  const matched = workflows.filter(w => d.includes(w.trigger.replace(/_/g, " ")))
  if (matched.length > 0) return { description, workflows: matched, generated: true }

  // Default: return all available workflow templates
  return { description, workflows, generated: false, message: "Available workflow templates: overdue invoice, high consumption, new customer onboarding, payment received, meter reading anomaly" }
}
