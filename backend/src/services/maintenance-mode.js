import { getAvailabilityPlan, setAvailabilityPlan } from "./availability-manager.js"

// ─── MAINTENANCE MODE (P59-C/LR-7 · §12) ─────────────────────────────────────
// Minimum reusable control layer for maintenance operations. In-memory state
// (no schema change). When maintenance is ACTIVE, the system is read-only:
// write-sensitive operations must consult isMaintenanceActive() and reject.
//
// NOTE: this is the control flag; actual write-blocking per route is applied
// where each route/guard opts in. It does NOT silently block all writes — each
// critical write path must add the guard (safe, incremental).

let maintenance = {
  active: false,
  reason: null,
  scheduledEnd: null,
  enteredAt: null,
}

export function enterMaintenance({ reason = "Scheduled maintenance", scheduledEnd = null } = {}) {
  maintenance = {
    active: true,
    reason,
    scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
    enteredAt: new Date(),
  }
  // Failover plan during maintenance is not forced; keep current plan but log.
  console.log(`[maintenance] ENTERED: ${reason}`)
  return { ...maintenance }
}

export function exitMaintenance() {
  maintenance = { active: false, reason: null, scheduledEnd: null, enteredAt: null }
  console.log("[maintenance] EXITED")
  return { ...maintenance }
}

export function isMaintenanceActive() {
  if (!maintenance.active) return false
  // Auto-exit if scheduledEnd passed.
  if (maintenance.scheduledEnd && maintenance.scheduledEnd <= new Date()) {
    exitMaintenance()
    return false
  }
  return true
}

export function getMaintenanceStatus() {
  return {
    active: isMaintenanceActive(),
    reason: maintenance.reason,
    scheduledEnd: maintenance.scheduledEnd,
    enteredAt: maintenance.enteredAt,
    availabilityPlan: getAvailabilityPlan().plan,
  }
}

// Guard helper for write routes: throws 503 when maintenance is active.
export function assertWritesAllowed() {
  if (isMaintenanceActive()) {
    const err = new Error(`System is under maintenance: ${maintenance.reason || "maintenance"}`)
    err.status = 503
    err.code = "MAINTENANCE_MODE"
    throw err
  }
}
