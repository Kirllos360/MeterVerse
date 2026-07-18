"use client"

import { motion } from "framer-motion"
import { futuristic } from "@/design-system/motion"

function ShimmerBase({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={futuristic.shimmer.animate}
      className={`rounded ${className}`}
      style={{
        backgroundColor: "var(--border-default, #E5E5E5)",
        backgroundImage: "linear-gradient(90deg, transparent 0%, rgba(0,191,165,0.06) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
      }}
    />
  )
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={futuristic.shimmer.animate}
      className={`rounded-xl border p-4 ${className}`}
      style={{
        borderColor: "var(--border-default, #E5E5E5)",
        backgroundColor: "var(--surface-raised, #FFFFFF)",
        backgroundImage: "linear-gradient(90deg, transparent 0%, rgba(0,191,165,0.04) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
      }}
    >
      <ShimmerBase className="h-3 w-2/3 mb-3" />
      <ShimmerBase className="h-8 w-1/2 mb-2" />
      <ShimmerBase className="h-3 w-1/3" />
    </motion.div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-default, #E5E5E5)" }}>
      <div className="px-4 py-3 border-b" style={{ backgroundColor: "var(--surface-tableHeader, #F5F5F5)", borderColor: "var(--border-default, #E5E5E5)" }}>
        <div className="flex gap-8">
          <ShimmerBase className="h-3 w-24" />
          <ShimmerBase className="h-3 w-20" />
          <ShimmerBase className="h-3 w-16" />
          <ShimmerBase className="h-3 w-28" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-8 px-4 py-3 border-b" style={{ borderColor: "var(--border-default, #E5E5E5)" }}>
          <ShimmerBase className="h-3 w-24" />
          <ShimmerBase className="h-3 w-20" />
          <ShimmerBase className="h-3 w-16" />
          <ShimmerBase className="h-3 w-28" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={futuristic.shimmer.animate}
      className={`rounded-xl border p-6 ${className}`}
      style={{
        borderColor: "var(--border-default, #E5E5E5)",
        backgroundColor: "var(--surface-raised, #FFFFFF)",
        backgroundImage: "linear-gradient(90deg, transparent 0%, rgba(0,191,165,0.04) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
      }}
    >
      <ShimmerBase className="h-3 w-32 mb-6" />
      <div className="flex items-end gap-3 h-32">
        {Array.from({ length: 8 }).map((_, i) => (
          <ShimmerBase key={i} className="flex-1" style={{ height: `${30 + Math.random() * 70}%` }} />
        ))}
      </div>
    </motion.div>
  )
}
