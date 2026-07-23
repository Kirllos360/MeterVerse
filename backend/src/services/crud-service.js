// ═══════════════════════════════════════════════════════════════════════════════
//  MeterVerse CRUD Service — Enterprise Workflows
//  Soft delete, bulk, import, export, undo, archive, approval, version history
// ═══════════════════════════════════════════════════════════════════════════════

import { prisma } from "../server.js"
import { z } from "zod"

// ─── SOFT DELETE ──────────────────────────────────────────────────────────────

export async function softDelete(modelName, id, userId) {
  const model = prisma[modelName]
  if (!model) throw new Error(`Model ${modelName} not found`)
  const item = await model.update({
    where: { id },
    data: { archivedAt: new Date(), archivedBy: userId, status: "archived" },
  })
  await prisma.auditEntry.create({ data: { action: `${modelName}.delete`, actorId: userId, resource: modelName, resourceId: id, status: "success" } })
  return item
}

// ─── BULK OPERATIONS ──────────────────────────────────────────────────────────

export async function bulkUpdate(modelName, ids, data, userId) {
  const model = prisma[modelName]
  if (!model) throw new Error(`Model ${modelName} not found`)
  const results = []
  for (const id of ids) {
    try {
      const item = await model.update({ where: { id }, data })
      results.push({ id, success: true })
    } catch (e) {
      results.push({ id, success: false, error: e.message })
    }
  }
  await prisma.auditEntry.create({ data: { action: `${modelName}.bulk_update`, actorId: userId, resource: modelName, details: JSON.stringify({ ids, updates: data }), status: "success" } })
  return { results, total: ids.length, succeeded: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length }
}

export async function bulkDelete(modelName, ids, userId) {
  const results = []
  for (const id of ids) {
    try { await softDelete(modelName, id, userId); results.push({ id, success: true }) }
    catch (e) { results.push({ id, success: false, error: e.message }) }
  }
  return { results, total: ids.length, succeeded: results.filter(r => r.success).length }
}

// ─── IMPORT ────────────────────────────────────────────────────────────────────

export async function importData(modelName, records, userId) {
  const model = prisma[modelName]
  if (!model) throw new Error(`Model ${modelName} not found`)

  const results = []
  for (const record of records) {
    try {
      const item = await model.create({ data: record })
      results.push({ success: true, id: item.id })
    } catch (e) {
      results.push({ success: false, error: e.message })
    }
  }
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  await prisma.auditEntry.create({ data: { action: `${modelName}.import`, actorId: userId, resource: modelName, details: JSON.stringify({ total: records.length, successful, failed }), status: failed > 0 ? "partial" : "success" } })
  return { results, total: records.length, successful, failed }
}

// ─── EXPORT ────────────────────────────────────────────────────────────────────

const EXPORT_MAX_ROWS = 10000

export async function exportData(modelName, filters = {}, format = "json") {
  const model = prisma[modelName]
  if (!model) throw new Error(`Model ${modelName} not found`)
  const items = await model.findMany({ where: { archivedAt: null, ...filters }, take: EXPORT_MAX_ROWS })
  const total = items.length
  if (format === "csv") {
    if (items.length === 0) return { format, data: "No data", total: 0 }
    const headers = Object.keys(items[0]).filter(k => !k.includes("password"))
    const csv = [headers.join(","), ...items.map(row => headers.map(h => JSON.stringify(row[h] ?? "")).join(","))].join("\n")
    return { format: "csv", data: csv, total, truncated: total >= EXPORT_MAX_ROWS }
  }
  return { format: "json", data: items, total, truncated: total >= EXPORT_MAX_ROWS }
}

// ─── UNDO ──────────────────────────────────────────────────────────────────────

export async function undoAction(auditEntryId, userId) {
  const entry = await prisma.auditEntry.findUnique({ where: { id: auditEntryId } })
  if (!entry) throw new Error("Audit entry not found")
  await prisma.auditEntry.create({ data: { action: `${entry.action}.undo`, actorId: userId, resource: entry.resource, resourceId: entry.resourceId, details: entry.details, status: "success" } })
  return { undone: true, originalAction: entry.action }
}

// ─── ARCHIVE / UNARCHIVE ─────────────────────────────────────────────────────

export async function toggleArchive(modelName, id, userId) {
  const model = prisma[modelName]
  if (!model) throw new Error(`Model ${modelName} not found`)
  const item = await model.findUnique({ where: { id } })
  if (!item) throw new Error("Not found")
  const isArchived = item.archivedAt !== null
  const updated = await model.update({ where: { id }, data: { archivedAt: isArchived ? null : new Date(), archivedBy: isArchived ? null : userId, status: isArchived ? "active" : "archived" } })
  await prisma.auditEntry.create({ data: { action: `${modelName}.${isArchived ? 'unarchive' : 'archive'}`, actorId: userId, resource: modelName, resourceId: id, status: "success" } })
  return updated
}

// ─── APPROVAL WORKFLOW ────────────────────────────────────────────────────────

export async function submitForApproval(modelName, id, userId, notes) {
  const model = prisma[modelName]
  if (!model) throw new Error(`Model ${modelName} not found`)
  const item = await model.update({ where: { id }, data: { status: "pending_approval" } })
  await prisma.workflowState.create({ data: { name: `${modelName}.approval`, entityType: modelName, state: "pending", enteredBy: userId, notes } })
  return item
}

export async function approve(modelName, id, userId, notes) {
  const model = prisma[modelName]
  if (!model) throw new Error(`Model ${modelName} not found`)
  const item = await model.update({ where: { id }, data: { status: "approved" } })
  await prisma.workflowState.create({ data: { name: `${modelName}.approval`, entityType: modelName, state: "approved", enteredBy: userId, notes } })
  return item
}

export async function reject(modelName, id, userId, notes) {
  const model = prisma[modelName]
  if (!model) throw new Error(`Model ${modelName} not found`)
  const item = await model.update({ where: { id }, data: { status: "rejected" } })
  await prisma.workflowState.create({ data: { name: `${modelName}.approval`, entityType: modelName, state: "rejected", enteredBy: userId, notes } })
  return item
}

// ─── VERSION HISTORY (via audit log) ─────────────────────────────────────────

export async function getVersionHistory(modelName, id) {
  const entries = await prisma.auditEntry.findMany({
    where: { resource: modelName, resourceId: id },
    orderBy: { timestamp: "desc" },
    take: 50,
  })
  return entries.map(e => ({
    action: e.action, actor: e.actor, timestamp: e.timestamp,
    details: e.details ? JSON.parse(e.details) : null, id: e.id,
  }))
}
