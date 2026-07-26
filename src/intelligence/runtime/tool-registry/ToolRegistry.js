// Tool Registry — MCP-compatible tool registry for AI agents
import logger from "../../../../backend/src/services/logger.js"

class ToolRegistry {
  constructor() {
    this.tools = new Map()
  }

  register(tool) {
    if (!tool.name || !tool.execute) throw new Error("Tool must have name and execute()")
    this.tools.set(tool.name, tool)
    logger.info({ tool: tool.name }, `Tool registered: ${tool.name}`)
  }

  async execute(name, args = {}) {
    const tool = this.tools.get(name)
    if (!tool) throw new Error(`Tool '${name}' not found`)
    logger.info({ tool: name }, `Executing tool: ${name}`)
    return tool.execute(args)
  }

  list() {
    return Array.from(this.tools.values()).map(t => ({ name: t.name, description: t.description }))
  }
}

export const toolRegistry = new ToolRegistry()

// Built-in tools
toolRegistry.register({
  name: "lookup_meter",
  description: "Look up meter details by serial number",
  async execute({ serial }) {
    const { prisma } = await import("../../../../backend/src/server.js")
    return prisma.meter.findUnique({ where: { serial }, include: { customer: true, readings: { take: 5, orderBy: { timestamp: "desc" } } } })
  },
})

toolRegistry.register({
  name: "lookup_customer",
  description: "Look up customer by ID or name",
  async execute({ id, name }) {
    const { prisma } = await import("../../../../backend/src/server.js")
    if (id) return prisma.customer.findUnique({ where: { id }, include: { meters: true, invoices: { take: 10 } } })
    return prisma.customer.findFirst({ where: { name: { contains: name } }, include: { meters: true } })
  },
})

toolRegistry.register({
  name: "lookup_invoice",
  description: "Look up invoice by ID or customer ID",
  async execute({ id, customerId }) {
    const { prisma } = await import("../../../../backend/src/server.js")
    if (id) return prisma.invoice.findUnique({ where: { id }, include: { customer: true, items: true } })
    return prisma.invoice.findMany({ where: { customerId }, orderBy: { createdAt: "desc" }, take: 10 })
  },
})

toolRegistry.register({
  name: "lookup_similar_issues",
  description: "Find similar meter issues based on error pattern",
  async execute({ errorPattern, limit = 5 }) {
    const { prisma } = await import("../../../../backend/src/server.js")
    return prisma.meterEvent.findMany({ where: { description: { contains: errorPattern } }, take: limit, orderBy: { timestamp: "desc" }, include: { meter: { select: { serial: true, type: true } } } })
  },
})

