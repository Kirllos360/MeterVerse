"use client"

import { useState, useRef, useEffect } from "react"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: string
}

export function OptimizedImage({ src, alt, width, height, className = "", priority = false, placeholder }: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(priority)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (priority || loaded) return
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoaded(true)
          observerRef.current?.disconnect()
        }
      },
      { rootMargin: "200px" }
    )
    if (imgRef.current) observerRef.current.observe(imgRef.current)
    return () => observerRef.current?.disconnect()
  }, [priority, loaded])

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height, backgroundColor: "var(--surface-sunken, #F0F0F0)" }}>
      {placeholder && !loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-xs" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>{placeholder}</div>
      )}
      {(loaded || priority) && !error && (
        <img ref={imgRef} src={src} alt={alt} width={width} height={height} onError={() => setError(true)}
          className="w-full h-full object-cover transition-opacity duration-300" style={{ opacity: loaded ? 1 : 0 }}
          loading={priority ? "eager" : "lazy"} decoding="async"
        />
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-xs" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M2 15l5-5 4 4 4-4 5 5"/></svg>
        </div>
      )}
    </div>
  )
}

export function preloadImage(src: string): void {
  const link = document.createElement("link")
  link.rel = "preload"
  link.as = "image"
  link.href = src
  document.head.appendChild(link)
}
