// MeterVerse Unified Intelligence Engine
// Consolidates ALL tools into one system. No duplicates. Maximum capability.
// Leverages: filesystem, git, postgres, vitest, prisma, grep, glob

import { PrismaClient } from "@prisma/client"
import { execSync } from "child_process"
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs"
import { join, resolve } from "path"

const prisma = new PrismaClient()
const BASE = resolve(".")

class UnifiedIntelligence {
  constructor() {
    this.capabilities = new Map()
    this.auditLog = []
    this._registerAllCapabilities()
  }

  _log(action, input, output, status = "ok") {
    this.auditLog.push({ timestamp: new Date().toISOString(), action, input, output, status })
  }

  _registerAllCapabilities() {
    // ===== DATABASE CAPABILITIES (via Prisma + PostgreSQL) =====
    this.capabilities.set("db_query_meters", async (args) => {
      const { serial, status, limit = 20, offset = 0 } = args
      const where = {}
      if (serial) where.serial = { contains: serial }
      if (status) where.status = status
      const [data, total] = await Promise.all([
        prisma.meter.findMany({ where, take: limit, skip: offset, orderBy: { createdAt: "desc" }, include: { customer: { select: { name: true } }, _count: { select: { readings: true } } } }),
        prisma.meter.count({ where }),
      ])
      return { data, total }
    })

    this.capabilities.set("db_query_customers", async (args) => {
      const { name, email, limit = 20 } = args
      const where = { archivedAt: null }
      if (name) where.name = { contains: name }
      if (email) where.email = { contains: email }
      const data = await prisma.customer.findMany({ where, take: limit, orderBy: { createdAt: "desc" }, include: { _count: { select: { meters: true, invoices: true } } } })
      return { data, total: data.length }
    })

    this.capabilities.set("db_query_readings", async (args) => {
      const { meterId, status, limit = 20 } = args
      const where = {}
      if (meterId) where.meterId = meterId
      if (status) where.status = status
      const data = await prisma.reading.findMany({ where, take: limit, orderBy: { timestamp: "desc" }, include: { meter: { select: { serial: true } } } })
      return { data, total: data.length }
    })

    this.capabilities.set("db_query_invoices", async (args) => {
      const { customerId, status, limit = 20 } = args
      const where = {}
      if (customerId) where.customerId = customerId
      if (status) where.status = status
      const data = await prisma.invoice.findMany({ where, take: limit, orderBy: { createdAt: "desc" }, include: { customer: { select: { name: true } }, items: true } })
      return { data, total: data.length }
    })

    this.capabilities.set("db_execute_sql", async (args) => {
      const { query } = args
      if (!query.toLowerCase().includes("select")) return { error: "Only SELECT queries allowed for safety" }
      const result = await prisma.$queryRawUnsafe(query)
      return { result }
    })

    // ===== FILE SYSTEM CAPABILITIES =====
    this.capabilities.set("fs_read_file", async (args) => {
      const { path } = args
      const fullPath = join(BASE, path)
      if (!existsSync(fullPath)) return { error: "File not found" }
      const content = readFileSync(fullPath, "utf-8")
      return { content, size: content.length }
    })

    this.capabilities.set("fs_list_directory", async (args) => {
      const { path = "." } = args
      const fullPath = join(BASE, path)
      if (!existsSync(fullPath)) return { error: "Directory not found" }
      const entries = readdirSync(fullPath, { withFileTypes: true })
      return { files: entries.filter(e => e.isFile()).map(e => e.name), dirs: entries.filter(e => e.isDirectory()).map(e => e.name) }
    })

    this.capabilities.set("fs_search_files", async (args) => {
      const { pattern, path = "." } = args
      const { globSync } = await import("glob")
      const results = globSync(pattern, { cwd: join(BASE, path), nodir: true })
      return { files: results.slice(0, 100) }
    })

    this.capabilities.set("fs_grep", async (args) => {
      const { pattern, path, include } = args
      const { execSync } = await import("child_process")
      const cmd = `grep -r "${pattern}" ${path || "."} ${include ? `--include="${include}"` : ""} -l 2>/dev/null | head -20`
      try {
        const result = execSync(cmd, { cwd: BASE, encoding: "utf-8", timeout: 10000 })
        return { files: result.trim().split("\n").filter(Boolean) }
      } catch { return { files: [] } }
    })

    // ===== GIT CAPABILITIES =====
    this.capabilities.set("git_status", async () => {
      const result = execSync("git status --short", { cwd: BASE, encoding: "utf-8" })
      return { status: result.trim() || "Clean working tree" }
    })

    this.capabilities.set("git_log", async (args) => {
      const { count = 5 } = args
      const result = execSync(`git log --oneline -${count}`, { cwd: BASE, encoding: "utf-8" })
      return { commits: result.trim().split("\n").filter(Boolean) }
    })

    this.capabilities.set("git_diff", async () => {
      const result = execSync("git diff --stat", { cwd: BASE, encoding: "utf-8" })
      return { diff: result.trim() || "No changes" }
    })

    // ===== TEST CAPABILITIES =====
    this.capabilities.set("run_tests", async (args) => {
      const { filter } = args
      const cmd = `npx vitest run ${filter || ""} 2>&1`
      try {
        const result = execSync(cmd, { cwd: join(BASE, "backend"), encoding: "utf-8", timeout: 60000 })
        const summary = result.split("\n").filter(l => l.includes("Test Files") || l.includes("Tests") || l.includes("passed") || l.includes("failed"))
        return { summary: summary.join("\n"), full: result.slice(-500) }
      } catch (e) { return { error: e.message, output: e.stdout?.slice(-500) } }
    })

    // ===== SYSTEM CAPABILITIES =====
    this.capabilities.set("system_health", async () => {
      const health = { timestamp: new Date().toISOString(), postgres: false, backend: false, docker: false }
      try {
        await prisma.$queryRaw`SELECT 1`
        health.postgres = true
      } catch {}
      try {
        const res = await fetch("http://localhost:3002/api/health")
        health.backend = res.status === 200
      } catch {}
      try {
        execSync("docker ps --format '{{.Names}}'", { encoding: "utf-8", timeout: 5000 })
        health.docker = true
      } catch {}
      return health
    })

    // ===== RCA (Root Cause Analysis) =====
    this.capabilities.set("rca_meter", async (args) => {
      const { serial } = args
      const meter = await prisma.meter.findUnique({ where: { serial }, include: { customer: true, readings: { orderBy: { timestamp: "desc" }, take: 20 }, meterEvents: { orderBy: { timestamp: "desc" }, take: 20 }, meterAssignments: { include: { customer: true } } } })
      if (!meter) return { error: "Meter not found" }
      const similarEvents = await prisma.meterEvent.findMany({ where: { meterId: meter.id }, take: 10, orderBy: { timestamp: "desc" } })
      return { meter, events: similarEvents, analysis: { totalReadings: meter.readings.length, totalEvents: similarEvents.length, status: meter.status } }
    })
  }

  async execute(capability, args = {}) {
    const fn = this.capabilities.get(capability)
    if (!fn) return { error: `Unknown capability: ${capability}. Available: ${Array.from(this.capabilities.keys()).join(", ")}` }
    try {
      const result = await fn(args)
      this._log(capability, args, "success")
      return { capability, result }
    } catch (e) {
      this._log(capability, args, e.message, "error")
      return { capability, error: e.message }
    }
  }

  listCapabilities() {
    return Array.from(this.capabilities.keys())
  }

  getAuditLog() {
    return this.auditLog.slice(-100)
  }
}

export const intelligence = new UnifiedIntelligence()
