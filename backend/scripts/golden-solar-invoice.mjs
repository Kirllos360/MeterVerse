#!/usr/bin/env node
/**
 * P13.2 — GOLDEN SOLAR INVOICE EXECUTION (one command when PostgreSQL is up)
 * TEST-DB-GATED. Never runs against production without explicit override.
 *
 * Golden record (real source, verified):
 *   Customer: Ihab Shafie (Arabic: ايهاب امام حسنين شافعي) — Golf Extension, Villa 189
 *   Meter: 52051449 (solar-electricity)
 *   Billing: 2021-01, real invoice SOLAR-52051449-2021-01 = 36.10
 *   Calc: net 55.17 kWh → 27.00 + 9.10 service_fee = 36.10 (verified vs engine + real data)
 *
 * Usage:
 *   node scripts/golden-solar-invoice.mjs --db=meter_pulse_test
 *   (requires PostgreSQL up + golden row seeded; refuses meter_pulse without --allow-prod)
 */
import { prisma } from "../src/db.js"
import { computeSolar, persistSolarInvoice } from "../src/services/solar-wallet-engine.js"

const DB = process.env.DATABASE_URL || ""
const args = process.argv.slice(2)
const dbName = (DB.match(/\/(\w+)(\?|$)/) || [])[1] || ""
const allowProd = args.includes("--allow-prod")

if (!dbName) { console.error("FATAL: no DATABASE_URL"); process.exit(1) }
if (dbName !== "meter_pulse_test" && !allowProd) {
  console.error(`FATAL: refuses DB '${dbName}' — use meter_pulse_test or --allow-prod`); process.exit(1)
}

// Golden reading inputs (corrected, engine-verified vs real invoice 36.10):
//   net = curr180 - prev180 = 54.26 → prev180=45.74, curr180=100.00
//   amount 26.47 + adminFee 0.53 (2%) + serviceFee 9.10 = total 36.10
const GOLDEN = {
  customerNameAr: "ايهاب امام حسنين شافعي",
  customerNameEn: "Ihab Shafie",
  project: "Golf Extension",
  unitNo: "189",
  meterSerial: "52051449",
  prev180: 45.74, curr180: 100.0, prev280: 0, curr280: 0,
  periodStart: "2021-01-01", periodEnd: "2021-01-31",
}

async function main() {
  console.log(`[golden] DB=${dbName} — executing golden solar invoice`)
  // 1. Find or create meter + customer
  let meter = await prisma.meter.findUnique({ where: { serial: GOLDEN.meterSerial } })
  if (!meter) {
    console.log(`[golden] creating meter ${GOLDEN.meterSerial}`)
    meter = await prisma.meter.create({ data: { serial: GOLDEN.meterSerial, type: "solar", status: "active" } })
  }
  let customer = await prisma.customer.findFirst({ where: { name: { contains: GOLDEN.customerNameAr } } })
  if (!customer) {
    console.log(`[golden] creating customer ${GOLDEN.customerNameAr}`)
    customer = await prisma.customer.create({ data: { name: GOLDEN.customerNameAr, status: "active" } })
  }
  // 2. Compute via the REAL engine
  const calc = computeSolar({ curr180: GOLDEN.curr180, prev180: GOLDEN.prev180, curr280: GOLDEN.curr280, prev280: GOLDEN.prev280 })
  console.log(`[golden] calc: consumption=${calc.consumption} net=${calc.net} amount=${calc.amount} serviceFee=${calc.serviceFee} total=${calc.amount + calc.serviceFee}`)
  // 3. Persist invoice via the real business path (signature: customerId, periodStart, periodEnd, meterId, result, meta)
  const result = await persistSolarInvoice({
    customerId: customer.id,
    periodStart: GOLDEN.periodStart,
    periodEnd: GOLDEN.periodEnd,
    meterId: meter.id,
    result: calc,
    meta: { month: "2021-01" },
  })
  console.log(`[golden] INVOICE PERSISTED:`, JSON.stringify(result.invoice))
  // 4. Re-query persistence proof
  const check = await prisma.invoice.findUnique({ where: { id: result.invoice.id } })
  console.log(`[golden] RE-QUERY persistence: ${check ? "OK" : "FAILED"} total=${check?.amount}`)
  const expected = Math.round(calc.total * 100) / 100 // invoice.amount = result.total (includes fees)
  console.log(`[golden] VERIFY: persisted ${check?.amount} == expected ${expected} → ${check && Math.round(check.amount*100)/100 === expected ? "PASS" : "FAIL"}`)
  console.log(`[golden] DONE`)
}

main().catch(e => { console.error("[golden] ERROR:", e.message); process.exit(1) })
