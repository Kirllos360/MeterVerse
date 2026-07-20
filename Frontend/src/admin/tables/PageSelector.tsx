"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useMemo } from "react"

interface PageSelectorProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PageSelector({ currentPage, totalPages, onPageChange }: PageSelectorProps) {
  const pages = useMemo(() => {
    if (totalPages <= 11) return Array.from({ length: totalPages }, (_, i) => i)
    const range: number[] = []
    range.push(0)
    const startBefore = Math.max(1, currentPage - 5)
    if (startBefore > 1) range.push(-1)
    for (let i = startBefore; i < currentPage; i++) range.push(i)
    range.push(currentPage)
    const endAfter = Math.min(totalPages - 2, currentPage + 5)
    for (let i = currentPage + 1; i <= endAfter; i++) range.push(i)
    if (endAfter < totalPages - 2) range.push(-1)
    if (totalPages > 1) range.push(totalPages - 1)
    return range
  }, [currentPage, totalPages])

  return (
    <div className="flex items-center justify-center gap-1">
      {/* Previous */}
      <motion.button
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.85 }}
        className="flex items-center justify-center outline-none"
        style={{
          width: 28, height: 28, borderRadius: 8,
          color: currentPage === 0 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.35)",
          cursor: currentPage === 0 ? "default" : "pointer",
          border: "none", background: "transparent",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
      </motion.button>

      {/* Page numbers — each floating independently */}
      <AnimatePresence mode="popLayout">
        {pages.map((page, i) => {
          if (page === -1) {
            return (
              <motion.span
                key={`e-${i}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="flex items-center justify-center"
                style={{ width: 18, height: 28, fontSize: 9, color: "rgba(255,255,255,0.15)", letterSpacing: "1px" }}
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
              whileHover={isActive ? {} : { scale: 1.15, y: -1 }}
              whileTap={{ scale: 0.88 }}
              className="flex items-center justify-center outline-none relative"
              style={{
                width: isActive ? 28 : 24,
                height: 28,
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                background: "transparent",
                position: "relative",
              }}
            >
              {/* Subtle blur backdrop under each number */}
              <motion.div
                className="absolute inset-0"
                style={{
                  borderRadius: 7,
                  backgroundColor: isActive ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.03)",
                  backdropFilter: isActive ? "blur(4px)" : "none",
                  WebkitBackdropFilter: isActive ? "blur(4px)" : "none",
                }}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              />

              {/* Active glow ring */}
              {isActive && (
                <motion.div
                  layoutId="pageGlow"
                  className="absolute inset-0"
                  style={{
                    borderRadius: 7,
                    border: "1px solid rgba(239,68,68,0.3)",
                    boxShadow: "0 0 10px rgba(239,68,68,0.15), inset 0 0 6px rgba(239,68,68,0.06)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <motion.span
                style={{
                  fontSize: isActive ? 11 : 10,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#EF4444" : "rgba(255,255,255,0.4)",
                  position: "relative",
                  zIndex: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
                animate={{ scale: isActive ? 1 : 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {page + 1}
              </motion.span>
            </motion.button>
          )
        })}
      </AnimatePresence>

      {/* Next */}
      <motion.button
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
        disabled={currentPage >= totalPages - 1}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.85 }}
        className="flex items-center justify-center outline-none"
        style={{
          width: 28, height: 28, borderRadius: 8,
          color: currentPage >= totalPages - 1 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.35)",
          cursor: currentPage >= totalPages - 1 ? "default" : "pointer",
          border: "none", background: "transparent",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
      </motion.button>
    </div>
  )
}
