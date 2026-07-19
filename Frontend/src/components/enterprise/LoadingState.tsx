"use client"

interface LoadingStateProps {
  rows?: number
}

export function LoadingState({ rows = 3 }: LoadingStateProps) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="w-8 h-8 rounded" style={{ backgroundColor: "var(--border-subtle)" }} />
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded" style={{ backgroundColor: "var(--border-subtle)", width: `${60 + Math.random() * 30}%` }} />
            <div className="h-2 rounded" style={{ backgroundColor: "var(--border-subtle)", width: "40%" }} />
          </div>
        </div>
      ))}
    </div>
  )
}
