import { prisma } from "../db.js"
import logger from "./logger.js"

// Tariff Engine — versioned tariff calculation and simulation.
// Supports flat, tiered, ToU (time-of-use), demand, fixed charges, and tax.
// A TariffVersion holds all components; calculation picks the active version.

function round2(n) { return Math.round(n * 100) / 100 }

/**
 * Calculate charges for a given consumption using a tariff version's components.
 * @param {Object} version - TariffVersion with rates/tiers/touSchedules/demandRates/fixedCharges/taxes
 * @param {Object} input
 * @param {number} input.consumption - energy usage in version.unit
 * @param {number} [input.demand] - peak demand in kW
 * @param {number} [input.hour] - hour of day 0-23 for ToU resolution
 * @param {string} [input.dayOfWeek] - MON..SUN | WEEKEND | WEEKDAY
 * @param {number} [input.periods] - number of billing periods for fixed charges
 * @returns {Object} { totalCharge, lineItems: [], taxes: [] }
 */
export function calculateTariff(version, { consumption = 0, demand = 0, hour = null, dayOfWeek = "ALL", periods = 1 } = {}) {
  const lineItems = []
  let subtotal = 0

  // ToU schedule (hour-aware) takes precedence for energy rate when applicable
  const tou = version.touSchedules || []
  const applicableToU = tou.filter(s => (s.dayOfWeek === "ALL" || s.dayOfWeek === dayOfWeek || (dayOfWeek === "WEEKDAY" && ["SAT", "SUN"].includes(s.dayOfWeek)) || (dayOfWeek === "WEEKEND" && !["SAT", "SUN"].includes(s.dayOfWeek))) && (hour == null || (s.startHour <= hour && hour < s.endHour)))

  let energyCharged = false
  if (applicableToU.length > 0) {
    const rate = applicableToU[0].rate
    const charge = round2(consumption * rate)
    subtotal += charge
    lineItems.push({ type: "tou", name: applicableToU[0].name, consumption, rate, charge })
    energyCharged = true
  }

  // Tiered energy charges
  const tiers = (version.tiers || []).sort((a, b) => (a.priority ?? a.minValue ?? 0) - (b.priority ?? b.minValue ?? 0))
  if (tiers.length > 0 && !energyCharged) {
    let remaining = consumption
    for (const tier of tiers) {
      const min = tier.minValue ?? 0
      const max = tier.maxValue ?? Infinity
      const tierConsumption = Math.min(remaining, Math.max(0, max - min))
      if (tierConsumption <= 0) continue
      const charge = round2(tierConsumption * tier.rate)
      subtotal += charge
      lineItems.push({ type: "tier", name: tier.name, consumption: tierConsumption, rate: tier.rate, charge })
      remaining -= tierConsumption
      if (remaining <= 0) break
    }
  }

  // Flat energy rates
  if (!energyCharged && tiers.length === 0) {
    for (const rate of version.rates || []) {
      const charge = round2(consumption * rate.rate)
      subtotal += charge
      lineItems.push({ type: "rate", name: rate.name, consumption, rate: rate.rate, charge })
    }
  }

  // Demand charges
  for (const dr of version.demandRates || []) {
    const chargeableDemand = dr.threshold ? Math.max(0, demand - dr.threshold) : demand
    const charge = round2(chargeableDemand * dr.rate)
    if (charge <= 0) continue
    subtotal += charge
    lineItems.push({ type: "demand", name: dr.name, demand: chargeableDemand, rate: dr.rate, charge })
  }

  // Fixed charges
  for (const fc of version.fixedCharges || []) {
    const periodsForCharge = fc.frequency === "ONCE" ? 1 : periods
    const charge = round2(fc.amount * periodsForCharge)
    subtotal += charge
    lineItems.push({ type: "fixed", name: fc.name, amount: fc.amount, periods: periodsForCharge, charge })
  }

  // Taxes
  const taxes = []
  let taxTotal = 0
  for (const t of version.taxes || []) {
    const amount = t.type === "PERCENTAGE" ? round2(subtotal * t.rate / 100) : round2(t.amount ?? 0)
    taxes.push({ name: t.name, type: t.type, rate: t.rate, amount })
    taxTotal += amount
  }

  const totalCharge = round2(subtotal + taxTotal)
  return { totalCharge, subtotal, taxTotal, lineItems, taxes }
}

/**
 * Pick the active version for a tariff at a given date, optionally scoped to a customer.
 */
export async function resolveActiveVersion(tariffId, { customerId = null, date = new Date(), tx = prisma } = {}) {
  const where = { tariffId, status: "ACTIVE", effectiveFrom: { lte: date }, ...(customerId ? { customerAssignments: { some: { customerId, status: "ACTIVE" } } } : {}) }
  return tx.tariffVersion.findFirst({ where, orderBy: { versionNumber: "desc" }, include: { rates: true, tiers: true, touSchedules: true, demandRates: true, fixedCharges: true, taxes: true } })
}

/**
 * Calculate a bill for a customer (resolves their assigned version).
 */
export async function calculateForCustomer(customerId, input, tx = prisma) {
  const assignment = await tx.customerTariff.findFirst({
    where: { customerId, status: "ACTIVE", effectiveFrom: { lte: new Date() } },
    orderBy: { effectiveFrom: "desc" },
    include: { tariffVersion: { include: { rates: true, tiers: true, touSchedules: true, demandRates: true, fixedCharges: true, taxes: true } } },
  })
  if (!assignment) return { ok: false, error: "Customer has no active tariff assignment" }
  return { ok: true, tariffVersion: assignment.tariffVersion, ...calculateTariff(assignment.tariffVersion, input) }
}

/**
 * Simulate a bill under a proposed tariff version (no DB writes).
 */
export async function simulateTariff({ tariffId = null, versionComponents = null, input }) {
  let version
  if (versionComponents) {
    version = versionComponents
  } else if (tariffId) {
    version = await resolveActiveVersion(tariffId)
    if (!version) return { ok: false, error: "No active version found for tariff" }
  } else {
    return { ok: false, error: "Either tariffId or versionComponents required" }
  }
  return { ok: true, ...calculateTariff(version, input) }
}

export { logger as tariffLogger }
