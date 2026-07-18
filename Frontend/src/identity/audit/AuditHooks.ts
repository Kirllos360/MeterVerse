import { create } from "zustand"

export type AuditEvent =
  | "login" | "logout" | "login_failed" | "permission_denied"
  | "session_created" | "session_expired" | "password_changed"
  | "language_changed" | "theme_changed" | "mfa_required"

interface AuditLog {
  id: string
  event: AuditEvent
  userId?: string
  timestamp: number
  metadata?: Record<string, unknown>
}

interface AuditState {
  logs: AuditLog[]
  track: (event: AuditEvent, metadata?: Record<string, unknown>) => void
  getByEvent: (event: AuditEvent) => AuditLog[]
  getRecent: (count?: number) => AuditLog[]
  clear: () => void
}

export const useAuditHooks = create<AuditState>((set, get) => ({
  logs: [],

  track: (event, metadata) => {
    const entry: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      event,
      timestamp: Date.now(),
      metadata,
    }
    set((s) => ({ logs: [entry, ...s.logs].slice(0, 500) }))
  },

  getByEvent: (event) => get().logs.filter((l) => l.event === event),
  getRecent: (count = 10) => get().logs.slice(0, count),
  clear: () => set({ logs: [] }),
}))
