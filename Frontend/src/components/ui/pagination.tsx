"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"

interface PaginationProps {
  current: number
  total: number
  onChange: (page: number) => void
}

export function Pagination({ current, total, onChange }: PaginationProps) {
  const pages = useMemo(() => {
    const items: (number | string)[] = []
    const delta = 2
    const left = Math.max(2, current - delta)
    const right = Math.min(total - 1, current + delta)

    items.push(1)
    if (left > 2) items.push("...")
    for (let i = left; i <= right; i++) items.push(i)
    if (right < total - 1) items.push("...")
    if (total > 1) items.push(total)

    return items
  }, [current, total])

  if (total <= 1) return null

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      {/* First */}
      <PageButton disabled={current === 1} onClick={() => onChange(1)} label="First">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="11 17 6 12 11 7" />
          <polyline points="18 17 13 12 18 7" />
        </svg>
      </PageButton>
      {/* Previous */}
      <PageButton disabled={current === 1} onClick={() => onChange(current - 1)} label="Previous">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </PageButton>

      {/* Pages */}
      <div className="flex items-center gap-1">
        {pages.map((page, i) =>
          typeof page === "string" ? (
            <span key={`e${i}`} className="flex items-center justify-center w-8 h-8 text-xs" style={{ color: "var(--text-tertiary)" }}>...</span>
          ) : (
            <motion.button
              key={page}
              onClick={() => onChange(page)}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-8 h-8 rounded-md text-xs font-medium transition-all duration-150"
              style={{
                backgroundColor: page === current ? "var(--brand)" : "transparent",
                color: page === current ? "white" : "var(--text-secondary)",
                border: page === current ? "none" : "1px solid var(--border-default)",
              }}
              aria-current={page === current ? "page" : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </motion.button>
          )
        )}
      </div>

      {/* Next */}
      <PageButton disabled={current === total} onClick={() => onChange(current + 1)} label="Next">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </PageButton>
      {/* Last */}
      <PageButton disabled={current === total} onClick={() => onChange(total)} label="Last">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="13 17 18 12 13 7" />
          <polyline points="6 17 11 12 6 7" />
        </svg>
      </PageButton>
    </nav>
  )
}

function PageButton({ disabled, onClick, label, children }: { disabled: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex items-center justify-center w-8 h-8 rounded-md text-xs transition-all duration-150"
      style={{
        color: disabled ? "var(--text-disabled)" : "var(--text-secondary)",
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.backgroundColor = "var(--border-default)" } }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent" }}
    >
      {children}
    </button>
  )
}
