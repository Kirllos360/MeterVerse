"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"

export function AmbientBackground() {
  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <motion.div
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
          animate={{
            background: [
              "radial-gradient(ellipse at 20% 50%, #00BFA5 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #064E3B 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #00D68F 0%, transparent 50%)",
              "radial-gradient(ellipse at 80% 50%, #00BFA5 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, #064E3B 0%, transparent 50%), radial-gradient(ellipse at 50% 20%, #00D68F 0%, transparent 50%)",
              "radial-gradient(ellipse at 50% 30%, #00BFA5 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, #064E3B 0%, transparent 50%), radial-gradient(ellipse at 20% 50%, #00D68F 0%, transparent 50%)",
              "radial-gradient(ellipse at 20% 50%, #00BFA5 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #064E3B 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #00D68F 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <SpotlightCursor />
    </>
  )
}

function SpotlightCursor() {
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 })

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX - 200, y: e.clientY - 200 })
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [handleMouseMove])

  return (
    <motion.div
      className="fixed pointer-events-none"
      style={{
        zIndex: 1,
        width: 400,
        height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,191,165,0.08) 0%, rgba(0,191,165,0.03) 40%, transparent 70%)",
      }}
      animate={{ left: mousePos.x, top: mousePos.y }}
      transition={{ type: "spring", stiffness: 100, damping: 30, mass: 0.5 }}
    />
  )
}
