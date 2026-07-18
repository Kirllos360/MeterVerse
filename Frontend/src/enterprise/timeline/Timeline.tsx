"use client"

import { motion } from "framer-motion"

interface TimelineEvent {
  id: string
  timestamp: string
  title: string
  description?: string
  type: "created" | "updated" | "approved" | "rejected" | "completed" | "error"
}

interface TimelineProps {
  events: TimelineEvent[]
}

const typeColors: Record<string, string> = {
  created: "#3B82F6", updated: "#F59E0B", approved: "#059669",
  rejected: "#DC2626", completed: "#00BFA5", error: "#DC2626",
}

const typeIcons: Record<string, string> = {
  created: "M12 6v6m0 0v6m0-6h6m-6 0H6",
  updated: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  approved: "M5 13l4 4L19 7",
  rejected: "M6 18L18 6M6 6l12 12",
  completed: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) return <div className="p-4 text-center text-xs" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>No activity recorded</div>
  return (
    <div className="relative pl-5">
      <div className="absolute left-2 top-1 bottom-1 w-px" style={{ backgroundColor: "var(--border-default, #E5E5E5)" }} />
      {events.map((event, i) => (
        <motion.div key={event.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="relative pb-4 last:pb-0">
          <div className="absolute left-[-14px] top-0.5 w-2.5 h-2.5 rounded-full border-2" style={{ backgroundColor: "var(--surface-base, #FAFAFA)", borderColor: typeColors[event.type] || typeColors.updated }}>
            <motion.div className="absolute inset-0 rounded-full" animate={{ boxShadow: ["0 0 0 0 rgba(0,0,0,0)", "0 0 0 4px rgba(0,0,0,0)"] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={typeColors[event.type]} strokeWidth="2"><path d={typeIcons[event.type]} /></svg>
            <span className="text-xs font-medium truncate" style={{ color: "var(--text-primary, #0A0A0A)" }}>{event.title}</span>
          </div>
          {event.description && <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: "var(--text-secondary, #737373)" }}>{event.description}</p>}
          <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>{event.timestamp}</p>
        </motion.div>
      ))}
    </div>
  )
}
