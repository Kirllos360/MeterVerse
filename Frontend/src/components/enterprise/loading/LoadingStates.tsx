"use client"

import { motion } from "framer-motion"
import { variants } from "@/design-system/motion"

export function SkeletonLines({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-4 rounded-lg animate-pulse" style={{ backgroundColor: "var(--surface-sunken, #F0F0F0)", width: `${100 - i * 15}%` }} />
      ))}
    </div>
  )
}

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
          <path d="M12 2a10 10 0 019.95 9" stroke="#00BFA5" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="text-sm" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>{message}</p>
      </div>
    </div>
  )
}

export function EmptyState({ message = "No data", description }: { message?: string; description?: string }) {
  return (
    <motion.div variants={variants.fadeIn} initial="initial" animate="animate" className="flex flex-col items-center justify-center py-16 text-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-3" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>
        <rect x="2" y="2" width="20" height="20" rx="2" /><path d="M8 2v20M16 2v20M2 8h20M2 16h20" />
      </svg>
      <p className="text-sm font-medium" style={{ color: "var(--text-secondary, #737373)" }}>{message}</p>
      {description && <p className="text-xs mt-1" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>{description}</p>}
    </motion.div>
  )
}

export function ErrorState({ message = "Error", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" className="mb-3">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="text-sm font-medium" style={{ color: "var(--text-primary, #0A0A0A)" }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 px-4 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: "#00BFA5" }}>Try again</button>
      )}
    </div>
  )
}

export function OfflineState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" className="mb-3">
        <path d="M1 9l4 4-4 4M23 9l-4 4 4 4M13 15l-2 6M9 3l2 6" />
      </svg>
      <p className="text-sm font-medium" style={{ color: "var(--text-primary, #0A0A0A)" }}>You are offline</p>
      <p className="text-xs mt-1" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>Check your connection</p>
    </div>
  )
}
