import { prisma } from "../db.js"
import logger from "./logger.js"

// Financial AI Engine — rule-based forecasting, scenario analysis,
// Monte Carlo simulation, business health scoring, and executive insights.
// (Rule-based + linear/statistical methods per P43; C18 model agents later.)

function round2(n) { return Math.round(n * 100) / 100 }
function now() { return new Date() }
function periodKey(d = now()) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` }
function addMonths(periodKeyStr, n) {
  const [y, m] = periodKeyStr.split("-").map(Number)
  const total = (y * 12 + (m - 1)) + n
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`
}

/**
 * Collect historical revenue/collections series from invoices + payments.
 */
async function collectSeries(metric = "REVENUE", months = 6, tx = prisma) {
  const series = []
  const nowD = now()
  const cutoff = new Date(nowD.getFullYear(), nowD.getMonth() - months, 1)
  if (metric === "REVENUE") {
    const invoices = await tx.invoice.findMany({ where: { archivedAt: null, issuedAt: { gte: cutoff } }, select: { amount: true, issuedAt: true } })
    const byPeriod = new Map()
    for (const inv of invoices) {
      const k = periodKey(inv.issuedAt)
      byPeriod.set(k, (byPeriod.get(k) || 0) + inv.amount)
    }
    return [...byPeriod.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => ({ periodKey: k, value: round2(v) }))
  }
  if (metric === "COLLECTIONS") {
    const payments = await tx.payment.findMany({ where: { status: "completed", createdAt: { gte: cutoff } }, select: { amount: true, createdAt: true } })
    const byPeriod = new Map()
    for (const p of payments) {
      const k = periodKey(p.createdAt)
      byPeriod.set(k, (byPeriod.get(k) || 0) + p.amount)
    }
    return [...byPeriod.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => ({ periodKey: k, value: round2(v) }))
  }
  return []
}

function linearTrend(values) {
  const n = values.length
  if (n === 0) return { slope: 0, intercept: 0 }
  const xs = values.map((_, i) => i)
  const sumX = xs.reduce((s, x) => s + x, 0)
  const sumY = values.reduce((s, y) => s + y, 0)
  const sumXY = xs.reduce((s, x, i) => s + x * values[i], 0)
  const sumXX = xs.reduce((s, x) => s + x * x, 0)
  const denom = n * sumXX - sumX * sumX
  const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0
  const intercept = denom !== 0 ? (sumY - slope * sumX) / n : (sumY / n || 0)
  return { slope, intercept }
}

/**
 * Forecast a financial metric for N months using linear trend + seasonality.
 */
export async function forecast(metric = "REVENUE", horizon = 3, tx = prisma) {
  const basePeriod = periodKey()
  const history = await collectSeries(metric, 6, tx)
  const values = history.map(h => h.value)
  if (values.length < 2) {
    const fc = await tx.financialForecast.create({ data: { forecastType: metric, horizon, periodKey: basePeriod, values: "[]", confidence: "low", methodology: "insufficient-data" } })
    return { ok: false, message: "Insufficient historical data for forecasting", forecast: fc }
  }
  const { slope, intercept } = linearTrend(values)
  const lastIndex = values.length - 1
  const projected = []
  let lastValue = values[lastIndex]
  for (let i = 1; i <= horizon; i++) {
    const t = lastIndex + i
    const raw = intercept + slope * t
    const seasonality = 1 + (Math.sin(t / 3) * 0.05)  // mild seasonal factor
    const val = Math.max(0, round2(raw * seasonality))
    projected.push({ periodKey: addMonths(basePeriod, i), value: val })
    lastValue = val
  }
  const avgGrowth = values.length > 1 ? (values[lastIndex] - values[0]) / values[0] * 100 : 0
  const confidence = Math.abs(avgGrowth) > 50 ? "low" : values.length >= 4 ? "high" : "medium"
  const fc = await tx.financialForecast.create({
    data: { forecastType: metric, horizon, periodKey: basePeriod, values: JSON.stringify(projected), confidence, methodology: "linear-trend-seasonal", params: JSON.stringify({ historyLength: history.length, growth: round2(avgGrowth) }) },
  })
  return { ok: true, metric, horizon, basePeriod, history, projected, confidence, forecast: fc }
}

/**
 * Monte Carlo simulation — draw from normal distribution around trend, N iterations.
 */
export async function monteCarlo(metric = "REVENUE", iterations = 1000, horizon = 1, tx = prisma) {
  const history = await collectSeries(metric, 6, tx)
  const values = history.map(h => h.value)
  const basePeriod = periodKey()
  if (values.length < 2) return { ok: false, message: "Insufficient data for Monte Carlo" }

  const { slope, intercept } = linearTrend(values)
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const variance = values.reduce((s, v) => s + (v - mean) * (v - mean), 0) / values.length
  const stdDev = Math.sqrt(variance) || mean * 0.1
  const lastIndex = values.length - 1
  const forecastMean = Math.max(0, intercept + slope * (lastIndex + horizon))

  const draws = []
  for (let i = 0; i < iterations; i++) {
    // Box-Muller normal
    const u1 = Math.random() || 1e-9
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    draws.push(Math.max(0, forecastMean + z * stdDev))
  }
  draws.sort((a, b) => a - b)
  const p5 = draws[Math.floor(iterations * 0.05)]
  const p95 = draws[Math.floor(iterations * 0.95)]
  const median = draws[Math.floor(iterations * 0.5)]
  const meanOut = draws.reduce((s, v) => s + v, 0) / iterations

  // Histogram (10 buckets)
  const min = draws[0], max = draws[draws.length - 1]
  const bucketSize = (max - min) / 10 || 1
  const histogram = {}
  for (let i = 0; i < 10; i++) {
    const lo = min + i * bucketSize
    const hi = lo + bucketSize
    const count = draws.filter(v => v >= lo && v < hi).length
    histogram[`${round2(lo)}-${round2(hi)}`] = count
  }

  const result = await tx.monteCarloResult.create({
    data: { forecastType: metric, periodKey: basePeriod, iterations, mean: round2(meanOut), median: round2(median), p5: round2(p5), p95: round2(p95), stdDev: round2(stdDev), distribution: JSON.stringify(histogram) },
  })
  return { ok: true, metric, iterations, mean: round2(meanOut), median: round2(median), p5: round2(p5), p95: round2(p95), stdDev: round2(stdDev), histogram, result }
}

/**
 * Scenario analysis — apply adjustments to baseline (P&L) and compute outcomes.
 */
export async function scenario({ name, description = null, scenarioType = "CUSTOM", adjustments = {}, tx = prisma } = {}) {
  const pnl = await (await import("./financial-reporting-engine.js")).buildPnl(periodKey(), tx)
  const applied = {}
  for (const [k, v] of Object.entries(adjustments)) {
    if (typeof v === "number" && (k === "revenue" || k === "expenses" || k === "netIncome")) {
      applied[k] = round2(pnl[k] * v)
    } else {
      applied[k] = v
    }
  }
  const revenue = round2(pnl.totalRevenue * (adjustments.revenue || 1))
  const expenses = round2(pnl.totalExpenses * (adjustments.expenses || 1))
  const netIncome = round2(revenue - expenses)
  const results = { baseline: { revenue: pnl.totalRevenue, expenses: pnl.totalExpenses, netIncome: pnl.netIncome }, adjusted: { revenue, expenses, netIncome }, applied }
  const s = await tx.financialScenario.create({ data: { name, description, scenarioType, adjustments: JSON.stringify(adjustments), inputs: JSON.stringify(pnl), results: JSON.stringify(results) } })
  return { scenario: s, results }
}

/**
 * Business health score 0-100 across liquidity / profitability / collections / growth.
 */
export async function healthScore(tx = prisma) {
  const pnl = await (await import("./financial-reporting-engine.js")).buildPnl(periodKey(), tx)
  const bs = await (await import("./financial-reporting-engine.js")).buildBalanceSheet(periodKey(), tx)
  const aging = await (await import("./financial-reporting-engine.js")).buildArAging(now(), tx)

  const profitability = pnl.totalRevenue > 0 ? Math.max(0, Math.min(100, 50 + (pnl.netIncome / pnl.totalRevenue) * 200)) : 50
  const liquidity = bs.totalLiabilities > 0 ? Math.max(0, Math.min(100, (bs.totalAssets / bs.totalLiabilities) * 40)) : 70
  const agingRatio = aging.totalOutstanding > 0 ? 1 - (aging.totals["90+"] / aging.totalOutstanding) : 1
  const collections = Math.max(0, Math.min(100, agingRatio * 100))
  const growth = 50 // placeholder; refined by forecast history

  const dimensions = { profitability: round2(profitability), liquidity: round2(liquidity), collections: round2(collections), growth }
  const overall = round2(Object.values(dimensions).reduce((s, v) => s + v, 0) / Object.values(dimensions).length)

  const drivers = []
  if (aging.totals["90+"] > aging.totalOutstanding * 0.5) drivers.push({ dimension: "collections", action: "Escalate 90+ bucket collection via dunning stage 4" })
  if (bs.totalLiabilities > bs.totalAssets) drivers.push({ dimension: "liquidity", action: "Reduce short-term liabilities / improve working capital" })
  if (pnl.netIncome < 0) drivers.push({ dimension: "profitability", action: "Review tariff pricing and cost base" })

  const hs = await tx.businessHealthScore.upsert({
    where: { periodKey: periodKey() },
    update: { overall, dimensions: JSON.stringify(dimensions), drivers: JSON.stringify(drivers) },
    create: { periodKey: periodKey(), overall, dimensions: JSON.stringify(dimensions), drivers: JSON.stringify(drivers) },
  })
  return { periodKey: periodKey(), overall, dimensions, drivers, healthScore: hs }
}

/**
 * Generate executive insights from current state.
 */
export async function generateInsights(tx = prisma) {
  const pnl = await (await import("./financial-reporting-engine.js")).buildPnl(periodKey(), tx)
  const aging = await (await import("./financial-reporting-engine.js")).buildArAging(now(), tx)
  const insights = []

  if (pnl.netIncome < 0) {
    insights.push({ category: "FINANCIAL", title: "Net loss detected", summary: `Net income is ${pnl.netIncome} — revenue ${pnl.totalRevenue} vs expenses ${pnl.totalExpenses}.`, severity: "critical", metric: "netIncome", value: pnl.netIncome })
  }
  const overdue = aging.totals["90+"]
  if (overdue > 0) {
    insights.push({ category: "COLLECTIONS", title: "High 90+ AR exposure", summary: `${overdue} in the 90+ aging bucket requires escalation.`, severity: "warning", metric: "ar90plus", value: overdue, recommendation: "Run dunning stage 4 + supervisor review." })
  }
  if (aging.totalOutstanding > 0 && aging.totals["0-30"] / aging.totalOutstanding > 0.7) {
    insights.push({ category: "COLLECTIONS", title: "Healthy current AR mix", summary: "Over 70% of AR is within 30 days.", severity: "info", metric: "arCurrentRatio", value: round2(aging.totals["0-30"] / aging.totalOutstanding) })
  }

  for (const ins of insights) {
    await tx.executiveInsight.create({ data: { ...ins, periodKey: periodKey() } })
  }
  return insights
}

export { logger as financialAiLogger }
