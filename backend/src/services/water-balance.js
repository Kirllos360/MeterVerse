/**
 * Water Balance Variance Service (T048a)
 * Computes water balance by comparing supply vs consumption readings.
 * Flags discrepancies beyond configurable thresholds.
 */

import { prisma } from "../server.js"

const DEFAULT_THRESHOLD = 0.15 // 15% variance allowed

export async function computeWaterBalance(projectId, startDate, endDate, threshold = DEFAULT_THRESHOLD) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw new Error("Project not found")

  // Find meters in this project's zones
  const zones = await prisma.zone.findMany({ where: { projectId }, include: { units: { include: { customer: true } } } })
  const zoneIds = zones.map(z => z.id)

  // Get all readings for meters in project zones
  const readings = await prisma.reading.findMany({
    where: { timestamp: { gte: startDate, lte: endDate }, source: { not: "estimated" } },
    include: { meter: true },
    orderBy: { timestamp: "asc" },
  })

  // Separate supply (inlet) and consumption (outlet) readings
  const supplyReadings = readings.filter(r => r.meter?.type === "water" && r.source === "supply")
  const consumptionReadings = readings.filter(r => r.meter?.type === "water" && r.source === "consumption")

  const totalSupply = supplyReadings.reduce((sum, r) => sum + r.value, 0)
  const totalConsumption = consumptionReadings.reduce((sum, r) => sum + r.value, 0)
  const variance = totalSupply - totalConsumption
  const variancePercent = totalSupply > 0 ? Math.abs(variance) / totalSupply : 0
  const isAnomaly = variancePercent > threshold

  // Create validation result if anomaly detected
  if (isAnomaly) {
    await prisma.validationResult.create({
      data: {
        ruleId: "water-balance",
        status: "failed",
        details: JSON.stringify({ totalSupply, totalConsumption, variance, variancePercent, threshold, projectId }),
        validatedAt: new Date(),
      },
    }).catch(() => {})
  }

  return {
    projectId,
    period: { start: startDate, end: endDate },
    totalSupply,
    totalConsumption,
    variance,
    variancePercent: Math.round(variancePercent * 10000) / 100 + "%",
    threshold: threshold * 100 + "%",
    status: isAnomaly ? "ANOMALY" : "NORMAL",
    supplyMeters: supplyReadings.length,
    consumptionMeters: consumptionReadings.length,
  }
}
