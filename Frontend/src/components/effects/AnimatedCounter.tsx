"use client"

import { useEffect, useRef, useState } from "react"

export function AnimatedCounter({ value, duration = 1.5, format = true }: { value: number; duration?: number; format?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)
  const startTime = useRef<number | null>(null)
  const startValue = useRef(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    startValue.current = displayValue
    startTime.current = null

    const animate = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp
      const elapsed = (timestamp - startTime.current) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue.current + (value - startValue.current) * eased)
      setDisplayValue(current)
      if (progress < 1) raf.current = requestAnimationFrame(animate)
    }

    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration])

  const formatted = format
    ? displayValue.toLocaleString()
    : String(displayValue)

  return <span>{formatted}</span>
}
