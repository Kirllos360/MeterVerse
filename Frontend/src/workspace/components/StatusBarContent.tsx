"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useWorkspaceStore } from "../stores"

const MOTIVATIONAL_QUOTES = [
  "⚡ Powering progress, one meter at a time",
  "🌱 Building a sustainable energy future",
  "🎯 Precision in every reading",
  "💡 Innovation drives efficiency",
  "📊 Data-driven decisions for tomorrow",
  "🔋 Empowering communities with smart energy",
  "🌍 Global standards, local impact",
  "🚀 Accelerating the energy transition",
]

const REMINDERS = [
  "📋 12 invoices pending review",
  "🔔 3 meters require maintenance",
  "📈 Monthly report ready for October",
  "✅ All systems operational",
]

export function StatusBarContent() {
  const { area, language, connectionStatus, backendLatency } = useWorkspaceStore()
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [reminderIndex, setReminderIndex] = useState(0)
  const [showQuote, setShowQuote] = useState(true)

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setShowQuote(false)
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % MOTIVATIONAL_QUOTES.length)
        setShowQuote(true)
      }, 300)
    }, 5000)
    return () => clearInterval(quoteInterval)
  }, [])

  useEffect(() => {
    const reminderInterval = setInterval(() => {
      setReminderIndex((i) => (i + 1) % REMINDERS.length)
    }, 8000)
    return () => clearInterval(reminderInterval)
  }, [])

  return (
    <footer className="flex items-center h-10 px-4 text-sm font-semibold select-none" style={{ color: "var(--text-tertiary)" }}>
      {/* Left — Running motivation + reminder */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="flex items-center gap-1.5 shrink-0">
          <motion.span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: connectionStatus === "connected" ? "var(--status-success)" : connectionStatus === "degraded" ? "var(--status-warning)" : "var(--status-error)" }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="hidden sm:inline">API</span>
          <span className="hidden md:inline tabular-nums">{backendLatency}ms</span>
        </span>

        <div className="h-3 w-px" style={{ backgroundColor: "var(--border-default)" }} />

        <AnimatePresence mode="wait">
          {showQuote ? (
            <motion.span key={`quote-${quoteIndex}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }} className="truncate text-[10px]" style={{ color: "rgba(var(--brand-primary-rgb), 0.6)" }}>
              {MOTIVATIONAL_QUOTES[quoteIndex]}
            </motion.span>
          ) : (
            <motion.span key={`reminder-${reminderIndex}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }} className="truncate text-[10px]" style={{ color: "rgba(var(--status-error-rgb), 0.5)" }}>
              {REMINDERS[reminderIndex]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Right — System info */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden sm:inline text-[10px]" style={{ color: "var(--text-tertiary)" }}>{area}</span>
        <span className="hidden lg:inline text-[10px]">{language.toUpperCase()}</span>
        <motion.span className="text-[10px] tabular-nums" style={{ color: "rgba(var(--brand-primary-rgb), 0.5)" }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          v8.0.0
        </motion.span>
      </div>
    </footer>
  )
}
