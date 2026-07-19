"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"

export function GradientText({ children, className = "" }: { children: string; className?: string }) {
  const colors = useMemo(() => [
    "var(--brand)", "var(--brand)", "var(--surface-base)", "var(--brand)",
  ], [])

  return (
    <motion.span
      className={`inline-block font-bold bg-clip-text text-transparent ${className}`}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
        backgroundSize: "300% 100%",
        WebkitBackgroundClip: "text",
      }}
    >
      {children}
    </motion.span>
  )
}

export function TypewriterText({ text, speed = 50, className = "" }: { text: string; speed?: number; className?: string }) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed("")
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[2px] h-[1em] ml-0.5 align-middle"
          style={{ backgroundColor: "var(--brand)" }}
        />
      )}
    </span>
  )
}

