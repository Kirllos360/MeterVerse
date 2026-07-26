// Automated Evidence Collector — Gathers all data for RCA analysis
import { PrismaClient } from "@prisma/client"
import logger from "../../../../backend/src/services/logger.js"

const prisma = new PrismaClient()

export class EvidenceCollector {
  async collect(serial) {
    logger.info({ serial }, `Collecting evidence for meter: ${serial}`)
    const package_ = { serial, items: [], confidence: 0, missing: [] }

    // 1. Meter identity
    const meter = await prisma.meter.findUnique({ where: { serial }, include: { customer: true } })
    if (meter) {
      package_.items.push({ type: "meter", data: { serial: meter.serial, type: meter.type, status: meter.status, area: meter.area, customer: meter.customer?.name } })
    } else {
      package_.missing.push("Meter record")
    }

    // 2. Recent readings
    const readings = await prisma.reading.findMany({ where: { meterId: meter?.id }, orderBy: { timestamp: "desc" }, take: 10 })
    if (readings.length > 0) {
      package_.items.push({ type: "readings", data: readings.map(r => ({ value: r.value, unit: r.unit, status: r.status, timestamp: r.timestamp })) })
    }

    // 3. Events
    const events = await prisma.meterEvent.findMany({ where: { meterId: meter?.id }, orderBy: { timestamp: "desc" }, take: 20 })
    if (events.length > 0) {
      package_.items.push({ type: "events", data: events.map(e => ({ type: e.type, description: e.description, timestamp: e.timestamp })) })
    } else {
      package_.missing.push("Meter events")
    }

    // 4. SIM cards
    const sims = await prisma.sIMCard.findMany({ where: { meterId: meter?.id }, include: { assignments: { orderBy: { startAt: "desc" }, take: 5 } } })
    if (sims.length > 0) {
      package_.items.push({ type: "sims", data: sims.map(s => ({ iccid: s.iccid, simNumber: s.simNumber, status: s.status, assignments: s.assignments.length })) })
    }

    // 5. Assignments
    const assignments = await prisma.meterAssignment.findMany({ where: { meterId: meter?.id }, include: { customer: { select: { name: true } } }, orderBy: { startDate: "desc" }, take: 5 })
    if (assignments.length > 0) {
      package_.items.push({ type: "assignments", data: assignments.map(a => ({ customer: a.customer?.name, status: a.status, startDate: a.startDate })) })
    }

    // 6. Confidence score based on evidence completeness
    const expectedTypes = ["meter", "readings", "events", "sims", "assignments"]
    const foundTypes = new Set(package_.items.map(i => i.type))
    package_.confidence = Math.round((foundTypes.size / expectedTypes.length) * 100)

    logger.info({ serial, items: package_.items.length, confidence: package_.confidence, missing: package_.missing }, `Evidence collected for ${serial}`)
    return package_
  }
}

export const evidenceCollector = new EvidenceCollector()
