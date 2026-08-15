import { prisma } from "../db.js"
import { auditLog } from "../middleware/security.js"
import { createRequire } from "module"

const require = createRequire(import.meta.url)

// ─── IMPORT ENGINE (P59-C/LR-3) ─────────────────────────────────────────────
// MeterVerse-native bulk import processor. Reuses legacy Solar XLSX column
// knowledge (recovered in P59-C/LR-1/2) but implemented with the current
// Express + Prisma + PostgreSQL stack. Lifecycle:
//   UPLOAD → FILE VALIDATION → SCHEMA VALIDATION → ROW VALIDATION → PREVIEW
//   → EXECUTION → RESULT → AUDIT
// Does NOT mutate production until an explicit execute step; never touches the
// P59-B frozen population (639 records) or OBIS-dependent solar behavior.

export const MAX_IMPORT_ROWS = 50000

export const IMPORT_SCHEMAS = {
  solar_customers: {
    sheet: "Customers",
    duplicateKey: "Meter Serial Electricity",
    required: ["Meter Serial Electricity", "Arabic Name"],
    columns: {
      "Meter Serial Electricity": { type: "string", required: true },
      "Arabic Name": { type: "string", required: true },
      "Meter Serial Water": { type: "string" },
      "Meter Serial Garden": { type: "string" },
      "Initial Balance Electricity": { type: "number" },
      "Initial Balance Water": { type: "number" },
      "Initial Balance Garden": { type: "number" },
      "Unit No.": { type: "string" },
      "Email": { type: "string" },
      "Phone 1": { type: "string" },
    },
  },
  solar_invoices: {
    sheet: "Invoices",
    duplicateKey: "Meter Serial",
    required: ["Meter Serial", "Month", "Invoice Amount"],
    columns: {
      "Meter Serial": { type: "string", required: true },
      "Month": { type: "string", required: true },
      "Invoice Amount": { type: "number", required: true },
      "Invoice Number": { type: "string" },
      "Solar Tag": { type: "string" },
      "Notes": { type: "string" },
    },
  },
  solar_payments: {
    sheet: "Payments",
    duplicateKey: "Meter Serial",
    required: ["Meter Serial", "Month", "Payment Amount"],
    columns: {
      "Meter Serial": { type: "string", required: true },
      "Month": { type: "string", required: true },
      "Payment Amount": { type: "number", required: true },
      "Payment Method": { type: "string" },
      "Solar Tag": { type: "string" },
      "Notes": { type: "string" },
    },
  },
}

function num(v) {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/,/g, "").trim())
  return Number.isFinite(n) ? n : null
}

// ─── TEMPLATE GENERATION (P60.1) ────────────────────────────────────────────
// Reused from Collection System routes_import.py template downloads: produce a
// fillable XLSX template for an import type so users can download, fill, and
// re-upload. Pure generation (no DB, no mutation). Sheet name + header rows
// are derived from IMPORT_SCHEMAS so templates always match the parser.
export function generateTemplate(type) {
  const schema = IMPORT_SCHEMAS[type]
  if (!schema) throw new Error(`Unknown import type ${type}`)
  const { utils } = require("xlsx")
  const header = Object.keys(schema.columns)
  const aoa = [header]
  for (const col of header) {
    const spec = schema.columns[col]
    if (spec.required) aoa.push([col]) // hint row: mark required columns
    break
  }
  const ws = utils.aoa_to_sheet(aoa)
  ws["!cols"] = header.map((h) => ({ wch: Math.max(12, h.length + 2) }))
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, schema.sheet)
  return wb
}

function str(v) {
  if (v === null || v === undefined) return ""
  return String(v).trim()
}

// Row-level validation against the schema. Returns { ok, errors }.
export function validateRow(type, row, rowIndex) {
  const schema = IMPORT_SCHEMAS[type]
  if (!schema) return { ok: false, errors: [`Unknown import type ${type}`] }
  const errors = []
  for (const [col, spec] of Object.entries(schema.columns)) {
    const raw = row[col]
    if (spec.required && (raw === undefined || raw === null || str(raw) === "")) {
      errors.push(`row ${rowIndex}: missing required '${col}'`)
      continue
    }
    if (spec.type === "number" && raw !== undefined && raw !== null && str(raw) !== "") {
      if (num(raw) === null) errors.push(`row ${rowIndex}: '${col}' not a number`)
    }
  }
  return { ok: errors.length === 0, errors }
}

// Parse an uploaded workbook into typed rows for a given import type.
export function parseWorkbook(buffer, type) {
  const schema = IMPORT_SCHEMAS[type]
  if (!schema) throw new Error(`Unknown import type ${type}`)
  const { read, utils } = require("xlsx")
  const wb = read(buffer, { type: "buffer" })
  const sheetName = schema.sheet
  if (!wb.SheetNames.includes(sheetName)) {
    return { ok: false, rows: [], errors: [`Workbook missing sheet '${sheetName}' (has: ${wb.SheetNames.join(", ")})`] }
  }
  const sheet = wb.Sheets[sheetName]
  const json = utils.sheet_to_json(sheet, { defval: "" })
  if (json.length > MAX_IMPORT_ROWS) {
    return { ok: false, rows: [], errors: [`Workbook exceeds MAX_IMPORT_ROWS (${json.length} > ${MAX_IMPORT_ROWS})`] }
  }
  const header = json.length > 0 ? Object.keys(json[0]) : []
  const missingRequired = schema.required.filter((c) => !header.includes(c))
  if (missingRequired.length > 0) {
    return { ok: false, rows: [], errors: [`Missing required columns: ${missingRequired.join(", ")}`] }
  }
  const rows = json.map((r, i) => ({ index: i + 2, data: r }))
  return { ok: true, rows, errors: [] }
}

// Create an ImportJob record and return its id (status preview). Validated row
// payload is persisted on the job so execution is idempotent (no re-upload).
export async function createImportJob({ type, fileName, rows, errors, req }) {
  const job = await prisma.importJob.create({
    data: {
      type,
      fileName,
      status: "preview",
      totalRows: rows.length,
      errors: JSON.stringify({ schemaErrors: errors.slice(0, 50), rows }),
      processed: 0,
      failed: errors.length,
    },
  })
  return job
}

// Detect duplicate rows within a batch by a key column. Returns a map
// rowIndex -> duplicateOfIndex for rows sharing the same key (first occurrence wins).
export function detectDuplicateRows(type, rows) {
  const schema = IMPORT_SCHEMAS[type]
  if (!schema) return new Map()
  const keyCol = schema.duplicateKey
  if (!keyCol) return new Map()
  const seen = new Map()
  const duplicates = new Map()
  for (const { index, data } of rows) {
    const key = str(data[keyCol])
    if (!key) continue
    if (seen.has(key)) duplicates.set(index, seen.get(key))
    else seen.set(key, index)
  }
  return duplicates
}

// Execute a previewed import. Only rows that passed validation are processed.
// Each row applies atomically in its own transaction (partial failure does not
// roll back other rows). Duplicate rows are skipped (first occurrence wins).
// Non-mutating for preview; mutation happens here under explicit approval.
export async function executeImport(type, rows, { req } = {}) {
  let processed = 0
  let failed = 0
  const results = []
  const duplicates = detectDuplicateRows(type, rows)

  for (const { index, data } of rows) {
    const v = validateRow(type, data, index)
    if (!v.ok) {
      failed++
      results.push({ row: index, status: "failed", errors: v.errors })
      continue
    }
    if (duplicates.has(index)) {
      failed++
      results.push({ row: index, status: "duplicate", errors: [`duplicate of row ${duplicates.get(index)}`] })
      continue
    }
    try {
      const outcome = await prisma.$transaction(async (tx) => {
        return applyRow(type, data, tx)
      })
      processed++
      results.push({ row: index, status: "ok", id: outcome.id })
    } catch (e) {
      failed++
      results.push({ row: index, status: "error", errors: [e.message] })
    }
  }
  return { processed, failed, results }
}

// Apply a single validated row to the database via existing MeterVerse models.
// Accepts an optional transaction client so callers can wrap per-row atomicity.
async function applyRow(type, data, tx) {
  const db = tx || prisma
  if (type === "solar_customers") {
    const customer = await db.customer.create({
      data: {
        name: str(data["Arabic Name"]),
        email: str(data["Email"]) || null,
        openingBalance: num(data["Initial Balance Electricity"]) || 0,
      },
    })
    const meterSerial = str(data["Meter Serial Electricity"])
    if (meterSerial) {
      const meter = await db.meter.create({ data: { serial: meterSerial, type: "solar", status: "active" } })
      await db.meter.update({ where: { id: meter.id }, data: { customerId: customer.id } })
    }
    return { id: customer.id }
  }
  if (type === "solar_invoices") {
    const meter = await db.meter.findFirst({ where: { serial: str(data["Meter Serial"]) } })
    if (!meter) throw new Error(`meter not found: ${data["Meter Serial"]}`)
    const invoice = await db.invoice.create({
      data: {
        number: str(data["Invoice Number"]) || `SOLAR-${Date.now()}`,
        customerId: meter.customerId,
        amount: num(data["Invoice Amount"]),
        status: "pending",
      },
    })
    return { id: invoice.id }
  }
  if (type === "solar_payments") {
    const meter = await db.meter.findFirst({ where: { serial: str(data["Meter Serial"]) } })
    if (!meter) throw new Error(`meter not found: ${data["Meter Serial"]}`)
    const payment = await db.payment.create({
      data: {
        customerId: meter.customerId,
        amount: num(data["Payment Amount"]),
        method: str(data["Payment Method"]) || "cash",
        status: "completed",
      },
    })
    return { id: payment.id }
  }
  throw new Error(`Unsupported import type ${type}`)
}
