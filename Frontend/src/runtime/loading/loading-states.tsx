"use client"

import { motion } from "framer-motion"
import { variants } from "@/design-system/motion"

interface LoadingStateProps {
  message?: string
}

export function SkeletonRuntime({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col gap-4 p-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-8 rounded-lg animate-pulse" style={{ backgroundColor: "var(--surface-sunken, #F0F0F0)", width: `${100 - i * 20}%` }} />
      ))}
      <p className="text-sm mt-2" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>{message}</p>
    </div>
  )
}

export function EmptyRuntime({ message = "No data yet", description }: { message?: string; description?: string }) {
  return (
    <motion.div variants={variants.fadeIn} initial="initial" animate="animate" className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <path d="M8 2v20M16 2v20M2 8h20M2 16h20" />
      </svg>
      <p className="text-base font-medium" style={{ color: "var(--text-secondary, #737373)" }}>{message}</p>
      {description && <p className="text-sm mt-1" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>{description}</p>}
    </motion.div>
  )
}

export function LoadingRuntime({ message = "Loading workspace..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" style={{ color: "var(--brand-primary, #00BFA5)" }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
          <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="text-sm" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>{message}</p>
      </div>
    </div>
  )
}

export function OfflineRuntime({ message = "You are offline", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <motion.div variants={variants.fadeIn} initial="initial" animate="animate" className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4" style={{ color: "var(--status-error, #DC2626)" }}>
        <path d="M1 9l4 4-4 4M23 9l-4 4 4 4M13 15l-2 6M9 3l2 6" />
      </svg>
      <p className="text-base font-medium" style={{ color: "var(--text-primary, #0A0A0A)" }}>{message}</p>
      <p className="text-sm mt-1 mb-4" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>Check your internet connection and try again.</p>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "var(--brand-primary, #00BFA5)" }}>
          Retry
        </button>
      )}
    </motion.div>
  )
}

export function ErrorRuntime({ message = "Something went wrong", error, onRetry }: { message?: string; error?: string; onRetry?: () => void }) {
  return (
    <motion.div variants={variants.fadeIn} initial="initial" animate="animate" className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4" style={{ color: "var(--status-error, #DC2626)" }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="text-base font-medium" style={{ color: "var(--text-primary, #0A0A0A)" }}>{message}</p>
      {error && <p className="text-sm mt-1 mb-4" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>{error}</p>}
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "var(--brand-primary, #00BFA5)" }}>
          Try again
        </button>
      )}
    </motion.div>
  )
}

export function PermissionRuntime({ message = "Access denied" }: { message?: string }) {
  return (
    <motion.div variants={variants.fadeIn} initial="initial" animate="animate" className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4" style={{ color: "var(--status-pending, #D97706)" }}>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
      <p className="text-base font-medium" style={{ color: "var(--text-primary, #0A0A0A)" }}>{message}</p>
      <p className="text-sm mt-1" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>You don't have permission to access this area.</p>
    </motion.div>
  )
}
