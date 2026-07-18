"use client"

import { motion } from "framer-motion"
import { transitions, variants } from "@/design-system/motion"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  onNavigate?: (item: BreadcrumbItem) => void
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  if (!items.length) return null

  return (
    <motion.nav
      variants={variants.fadeIn}
      initial="initial"
      animate="animate"
      className="flex items-center gap-1.5 text-sm"
      aria-label="Breadcrumb"
    >
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
          {item.href ? (
            <button
              onClick={() => onNavigate?.(item)}
              className="transition-colors outline-none focus-visible:ring-2 rounded"
              style={{ color: i === items.length - 1 ? "var(--text-primary, #0A0A0A)" : "var(--text-tertiary, #A3A3A3)" }}
            >
              {item.label}
            </button>
          ) : (
            <span style={{ color: "var(--text-primary, #0A0A0A)" }} className="font-medium">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </motion.nav>
  )
}
