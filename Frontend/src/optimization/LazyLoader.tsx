"use client"

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react"

interface LazyLoaderProps {
  load: () => Promise<{ default: ComponentType<unknown> }>
  fallback?: ReactNode
  onLoad?: () => void
  onError?: (error: Error) => void
}

export function LazyLoader({ load, fallback, onLoad, onError }: LazyLoaderProps) {
  const [Component, setComponent] = useState<ComponentType<unknown> | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadedRef.current) {
          loadedRef.current = true
          load().then((mod) => { setComponent(() => mod.default); onLoad?.() }).catch((e) => { setError(e); onError?.(e) })
          observer.disconnect()
        }
      },
      { rootMargin: "200px" }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [load, onLoad, onError])

  if (error) return <div className="p-4 text-xs text-red-500">Failed to load: {error.message}</div>
  if (!Component) return <div ref={ref}>{fallback || <div className="p-4 text-xs" style={{ color: "var(--text-tertiary)" }}>Loading...</div>}</div>
  return <Component />
}

// Usage: <LazyLoader load={() => import("@/enterprise-apps/customers/customers-app")} fallback={<Skeleton />} />
