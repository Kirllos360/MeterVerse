import { apiBackend } from "@/lib/api-client"
import type { HealthSummary, HealthCounters, AuditEntry, MeterType, CustomerGroup, Tariff, PaymentGateway, UserEntry, Role, BillCycle, ActivityEvent } from "./types"

// ─── Health ─────────────────────────────────────────────────────────
export async function getHealthSummary(): Promise<HealthSummary> {
  return apiBackend("/admin-settings/health/summary")
}

export async function getHealthCounters(): Promise<HealthCounters> {
  return apiBackend("/admin-settings/health/counters")
}

// ─── Audit ──────────────────────────────────────────────────────────
export async function getAuditLog(limit = 50, offset = 0): Promise<{ entries: AuditEntry[]; total: number }> {
  return apiBackend(`/admin-settings/audit?limit=${limit}&offset=${offset}`)
}

// ─── Meter Types ────────────────────────────────────────────────────
export async function getMeterTypes(): Promise<{ types: MeterType[] }> {
  return apiBackend("/admin-settings/meters/types")
}

export async function createMeterType(data: { name: string; category?: string; unit?: string; manufacturer?: string }): Promise<{ type: MeterType }> {
  return apiBackend("/admin-settings/meters/types", { method: "POST", body: JSON.stringify(data) })
}

export async function deleteMeterType(id: string): Promise<{ ok: boolean }> {
  return apiBackend(`/admin-settings/meters/types/${id}`, { method: "DELETE" })
}

// ─── Customer Groups ────────────────────────────────────────────────
export async function getCustomerGroups(): Promise<{ groups: CustomerGroup[] }> {
  return apiBackend("/admin-settings/customers/groups")
}

export async function createCustomerGroup(data: { name: string; description?: string }): Promise<{ group: CustomerGroup }> {
  return apiBackend("/admin-settings/customers/groups", { method: "POST", body: JSON.stringify(data) })
}

export async function deleteCustomerGroup(id: string): Promise<{ ok: boolean }> {
  return apiBackend(`/admin-settings/customers/groups/${id}`, { method: "DELETE" })
}

// ─── Tariffs ─────────────────────────────────────────────────────────
export async function getTariffs(): Promise<{ tariffs: Tariff[] }> {
  return apiBackend("/admin-settings/tariffs/all")
}

// ─── Payment Gateways ───────────────────────────────────────────────
export async function getPaymentGateways(): Promise<{ gateways: PaymentGateway[] }> {
  return apiBackend("/admin-settings/payments/gateways")
}

// ─── Users ──────────────────────────────────────────────────────────
export async function getUsers(): Promise<{ users: UserEntry[] }> {
  return apiBackend("/admin-settings/users/all")
}

export async function getRoles(): Promise<{ roles: Role[] }> {
  return apiBackend("/admin-settings/users/roles")
}

// ─── Bill Cycles ────────────────────────────────────────────────────
export async function getBillCycles(): Promise<{ cycles: BillCycle[] }> {
  return apiBackend("/admin-settings/billing/cycles")
}

// ─── Events ─────────────────────────────────────────────────────────
export async function getEvents(resource?: string, limit = 30): Promise<{ events: ActivityEvent[] }> {
  const qs = resource ? `?resource=${resource}&limit=${limit}` : `?limit=${limit}`
  return apiBackend(`/admin-settings/events/list${qs}`)
}

export async function getErrors(resource?: string, limit = 30): Promise<{ errors: ActivityEvent[] }> {
  const qs = resource ? `?resource=${resource}&limit=${limit}` : `?limit=${limit}`
  return apiBackend(`/admin-settings/errors/list${qs}`)
}

// ─── Settings ───────────────────────────────────────────────────────
export async function getSystemSettings(): Promise<{ settings: any[] }> {
  return apiBackend("/admin-settings/settings")
}

export async function saveSetting(key: string, value: string, category = "general", type = "string"): Promise<{ setting: any }> {
  return apiBackend("/admin-settings/settings", { method: "POST", body: JSON.stringify({ key, value, category, type }) })
}
