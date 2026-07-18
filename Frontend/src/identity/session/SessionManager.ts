import { create } from "zustand"

interface Session {
  id: string
  deviceId: string
  browserId: string
  ipAddress: string
  createdAt: number
  lastActivity: number
  expiresAt: number
  trusted: boolean
  current: boolean
}

interface SessionState {
  sessionId: string | null
  deviceId: string
  browserId: string
  lastActivity: number
  idleTimer: ReturnType<typeof setTimeout> | null
  idleTimeoutMs: number
  sessions: Session[]
  trustedDevices: string[]

  initialize: () => void
  updateActivity: () => void
  setIdleTimeout: (ms: number) => void
  startIdleTimer: () => void
  stopIdleTimer: () => void
  addSession: (session: Session) => void
  removeSession: (id: string) => void
  trustDevice: (deviceId: string) => void
  isTrusted: (deviceId: string) => boolean
  isExpired: () => boolean
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getBrowserId(): string {
  if (typeof window === "undefined") return "ssr"
  const stored = localStorage.getItem("mv-browser-id")
  if (stored) return stored
  const id = generateId()
  localStorage.setItem("mv-browser-id", id)
  return id
}

function getDeviceId(): string {
  if (typeof window === "undefined") return "ssr"
  const stored = localStorage.getItem("mv-device-id")
  if (stored) return stored
  const id = generateId()
  localStorage.setItem("mv-device-id", id)
  return id
}

export const useSessionManager = create<SessionState>((set, get) => ({
  sessionId: null,
  deviceId: "",
  browserId: "",
  lastActivity: Date.now(),
  idleTimer: null,
  idleTimeoutMs: 900000,
  sessions: [],
  trustedDevices: [],

  initialize: () => {
    const deviceId = getDeviceId()
    const browserId = getBrowserId()
    const sessionId = generateId()
    set({
      sessionId,
      deviceId,
      browserId,
      lastActivity: Date.now(),
    })
    get().startIdleTimer()
  },

  updateActivity: () => {
    set({ lastActivity: Date.now() })
  },

  setIdleTimeout: (ms) => set({ idleTimeoutMs: ms }),

  startIdleTimer: () => {
    get().stopIdleTimer()
    const timer = setTimeout(() => {
      // Auto-logout would be called here
      console.warn("[Session] Idle timeout reached")
    }, get().idleTimeoutMs)
    set({ idleTimer: timer })
    if (typeof window !== "undefined") {
      ["mousedown", "keydown", "touchstart", "scroll"].forEach((event) => {
        window.addEventListener(event, () => get().updateActivity(), { once: true })
      })
    }
  },

  stopIdleTimer: () => {
    const { idleTimer } = get()
    if (idleTimer) clearTimeout(idleTimer)
  },

  addSession: (session) => set((s) => ({ sessions: [...s.sessions, session] })),
  removeSession: (id) => set((s) => ({ sessions: s.sessions.filter((ss) => ss.id !== id) })),

  trustDevice: (deviceId) => set((s) => ({ trustedDevices: [...new Set([...s.trustedDevices, deviceId])] })),

  isTrusted: (deviceId) => get().trustedDevices.includes(deviceId),

  isExpired: () => {
    const { sessions } = get()
    if (sessions.length === 0) return false
    return sessions.some((s) => s.current && s.expiresAt < Date.now())
  },
}))
