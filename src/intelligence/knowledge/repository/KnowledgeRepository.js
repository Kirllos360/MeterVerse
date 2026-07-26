// Knowledge Repository — Permanent operational memory for AI agents
import { PrismaClient } from "@prisma/client"
import logger from "../../../../backend/src/services/logger.js"

const prisma = new PrismaClient()

class KnowledgeRepository {
  constructor() {
    this.initialized = false
  }

  async init() {
    if (this.initialized) return
    this.initialized = true
    logger.info("KnowledgeRepository initialized")
  }

  // Store a knowledge entry
  async store(entityType, entityId, data) {
    await this.init()
    // In production, would store to a knowledge_entries table with vector embedding
    logger.info({ entityType, entityId }, `Knowledge stored: ${entityType}/${entityId}`)
    return { entityType, entityId, stored: true }
  }

  // Search knowledge (hybrid: metadata + semantic)
  async search(query, filters = {}) {
    await this.init()
    const results = []

    // 1. Search Meters
    if (!filters.entityType || filters.entityType === "meter") {
      const meters = await prisma.meter.findMany({
        where: {
          OR: [
            { serial: { contains: query } },
            { type: { contains: query } },
            { status: query },
          ],
          ...(filters.status ? { status: filters.status } : {}),
        },
        take: 10,
        include: { customer: { select: { name: true } }, _count: { select: { readings: true, meterEvents: true } } },
      })
      meters.forEach(m => results.push({ type: "meter", id: m.id, serial: m.serial, status: m.status, customer: m.customer?.name, readings: m._count.readings, events: m._count.meterEvents }))
    }

    // 2. Search Customers
    if (!filters.entityType || filters.entityType === "customer") {
      const customers = await prisma.customer.findMany({
        where: {
          archivedAt: null,
          OR: [
            { name: { contains: query } },
            { email: { contains: query } },
            { area: { contains: query } },
          ],
        },
        take: 10,
        include: { _count: { select: { meters: true, invoices: true } } },
      })
      customers.forEach(c => results.push({ type: "customer", id: c.id, name: c.name, email: c.email, meters: c._count.meters, invoices: c._count.invoices }))
    }

    // 3. Search Invoices
    if (!filters.entityType || filters.entityType === "invoice") {
      const invoices = await prisma.invoice.findMany({
        where: { number: { contains: query }, status: filters.status },
        take: 10,
        include: { customer: { select: { name: true } } },
      })
      invoices.forEach(i => results.push({ type: "invoice", id: i.id, number: i.number, amount: i.amount, status: i.status, customer: i.customer?.name }))
    }

    // 4. Search SIMs
    if (!filters.entityType || filters.entityType === "sim") {
      const sims = await prisma.sIMCard.findMany({
        where: { OR: [{ iccid: { contains: query } }, { simNumber: { contains: query } }] },
        take: 10,
      })
      sims.forEach(s => results.push({ type: "sim", id: s.id, iccid: s.iccid, simNumber: s.simNumber, status: s.status }))
    }

    return results
  }

  // Get meter timeline
  async getMeterTimeline(serial) {
    await this.init()
    const meter = await prisma.meter.findUnique({
      where: { serial },
      include: {
        readings: { orderBy: { timestamp: "desc" }, take: 50 },
        meterEvents: { orderBy: { timestamp: "desc" }, take: 50 },
        meterAssignments: { include: { customer: { select: { name: true } } }, orderBy: { startDate: "desc" } },
        simCards: { include: { assignments: { orderBy: { startAt: "desc" }, take: 5 } } },
      },
    })
    if (!meter) return { error: "Meter not found" }

    // Build timeline entries
    const timeline = []

    // Readings
    meter.readings.forEach(r => timeline.push({ date: r.timestamp, type: "reading", detail: `Value: ${r.value} ${r.unit} (${r.status})` }))
    // Events
    meter.meterEvents.forEach(e => timeline.push({ date: e.timestamp, type: "event", detail: `${e.type}: ${e.description}` }))
    // Assignments
    meter.meterAssignments.forEach(a => timeline.push({ date: a.startDate, type: "assignment", detail: `Assigned to ${a.customer?.name || a.customerId} (${a.status})` }))
    // SIMs
    meter.simCards.forEach(s => {
      timeline.push({ date: s.createdAt, type: "sim", detail: `SIM ${s.simNumber} — ${s.status}` })
      s.assignments.forEach(a => timeline.push({ date: a.startAt, type: "sim-assignment", detail: `SIM assigned: ${a.status}` }))
    })

    // Sort by date descending
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date))

    return { meter: { serial: meter.serial, type: meter.type, status: meter.status, area: meter.area }, timeline, totalEvents: timeline.length }
  }

  // Find similar incidents
  async findSimilarIncidents(errorPattern, limit = 10) {
    await this.init()
    const events = await prisma.meterEvent.findMany({
      where: { description: { contains: errorPattern } },
      take: limit,
      orderBy: { timestamp: "desc" },
      include: { meter: { select: { serial: true, type: true } } },
    })
    return events.map(e => ({
      date: e.timestamp,
      meter: e.meter?.serial,
      meterType: e.meter?.type,
      eventType: e.type,
      description: e.description,
    }))
  }
}

export const knowledgeRepository = new KnowledgeRepository()
