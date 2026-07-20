"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useMemo } from "react"

interface PageSelectorProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PageSelector({ currentPage, totalPages, onPageChange }: PageSelectorProps) {
  // ─── Calculate page range ───────────────────────────────────────────────
  const pages = useMemo(() => {
    if (totalPages <= 11) return Array.from({ length: totalPages }, (_, i) => i)

    const range: number[] = []
    // Always show first page
    range.push(0)

    // 5 pages before current
    const startBefore = Math.max(1, currentPage - 5)
    if (startBefore > 1) range.push(-1) // ellipsis

    for (let i = startBefore; i < currentPage; i++) range.push(i)

    // Current page
    range.push(currentPage)

    // 5 pages after current
    const endAfter = Math.min(totalPages - 2, currentPage + 5)
    for (let i = currentPage + 1; i <= endAfter; i++) range.push(i)

    if (endAfter < totalPages - 2) range.push(-1) // ellipsis

    // Always show last page
    if (totalPages > 1) range.push(totalPages - 1)

    return range
  }, [currentPage, totalPages])

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="flex items-center gap-1 px-3 py-1.5"
        layout
        style={{
          borderRadius: 20,
          backgroundColor: "rgba(15,15,25,0.6)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Previous button */}
        <motion.button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.06)" }}
          whileTap={{ scale: 0.9 }}
          className="flex items-center justify-center outline-none"
          style={{
            width: 26, height: 26, borderRadius: 8,
            color: currentPage === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)",
            cursor: currentPage === 0 ? "default" : "pointer",
            border: "none", background: "transparent",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </motion.button>

        {/* Page numbers */}
        <AnimatePresence mode="popLayout">
          {pages.map((page, i) => {
            if (page === -1) {
              return (
                <motion.span
                  key={`ellipsis-${i}`}
                  className="flex items-center justify-center"
                  style={{ width: 20, height: 26, fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "1px" }}
                >
                  •••
                </motion.span>
              )
            }

            const isActive = page === currentPage
            return (
              <motion.button
                key={page}
                layout
                onClick={() => onPageChange(page)}
                whileHover={isActive ? {} : { scale: 1.12, backgroundColor: "rgba(255,255,255,0.06)" }}
                whileTap={{ scale: 0.92 }}
                className="flex items-center justify-center outline-none relative"
                style={{
                  width: isActive ? 28 : 26,
                  height: isActive ? 28 : 26,
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: "transparent",
                  position: "relative",
                }}
              >
                {/* Active page glow */}
                {isActive && (
                  <motion.div
                    layoutId="pageGlow"
                    className="absolute inset-0"
                    style={{
                      borderRadius: 8,
                      background: "linear-gradient(135deg, rgba(239,68,68,0.25), rgba(220,38,38,0.15))",
                      border: "1px solid rgba(239,68,68,0.25)",
                      boxShadow: "0 0 12px rgba(239,68,68,0.25), inset 0 0 8px rgba(239,68,68,0.1)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.span
                  style={{
                    fontSize: isActive ? 11 : 10,
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? "#EF4444" : "rgba(255,255,255,0.5)",
                    position: "relative",
                    zIndex: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                  animate={{ scale: isActive ? 1 : 0.92 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {page + 1}
                </motion.span>
              </motion.button>
            )
          })}
        </AnimatePresence>

        {/* Next button */}
        <motion.button
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.06)" }}
          whileTap={{ scale: 0.9 }}
          className="flex items-center justify-center outline-none"
          style={{
            width: 26, height: 26, borderRadius: 8,
            color: currentPage >= totalPages - 1 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)",
            cursor: currentPage >= totalPages - 1 ? "default" : "pointer",
            border: "none", background: "transparent",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
        </motion.button>
      </motion.div>
    </div>
  )
}
