"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  description?: string
  timestamp: number
  read: boolean
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onDismiss: (id: string) => void
}

const typeIcons: Record<string, string> = {
  success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
}

const typeColors: Record<string, string> = {
  success: "var(--status-success)", error: "var(--status-error)", warning: "var(--status-warning)", info: "#3B82F6",
}

export function NotificationCenter({ notifications, onMarkRead, onMarkAllRead, onDismiss }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} aria-label={`Notifications (${unreadCount} unread)`} className="relative w-8 h-8 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors" style={{ color: "var(--text-secondary)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        {unreadCount > 0 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: "var(--status-error)" }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-xl z-50 overflow-hidden"
            style={{ backgroundColor: "var(--surface-raised)", boxShadow: "var(--shadow-md)" }}
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "var(--border-default)" }}>
              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Notifications</span>
              {unreadCount > 0 && <button onClick={onMarkAllRead} className="text-[10px] font-medium hover:underline" style={{ color: "var(--brand)" }}>Mark all read</button>}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>No notifications</div>
              ) : (
                notifications.map((n) => (
                  <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`flex items-start gap-3 px-4 py-2.5 border-b transition-colors cursor-pointer ${n.read ? "" : "hover:bg-black/[0.02]"}`}
                    style={{ borderColor: "var(--border-default)", backgroundColor: n.read ? "transparent" : "rgba(var(--brand-rgb), 0.03)" }}
                    onClick={() => onMarkRead(n.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={typeColors[n.type]} strokeWidth="2" className="mt-0.5 shrink-0"><path d={typeIcons[n.type]} /></svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate" style={{ color: n.read ? "var(--text-secondary)" : "var(--text-primary)" }}>{n.title}</div>
                      {n.description && <div className="text-[11px] mt-0.5 line-clamp-2" style={{ color: "var(--text-tertiary)" }}>{n.description}</div>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onDismiss(n.id) }} aria-label="Dismiss" className="shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity" style={{ color: "var(--text-tertiary)" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

