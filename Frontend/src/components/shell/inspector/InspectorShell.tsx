"use client"

import { type ReactNode } from "react"
import { motion } from "framer-motion"
import { useLayoutStore } from "@/stores"
import { variants, transitions } from "@/design-system/motion"

interface InspectorShellProps {
  header?: ReactNode
  children: ReactNode
  tabBar?: ReactNode
}

export function InspectorShell({ header, children, tabBar }: InspectorShellProps) {
  const { inspectorOpen, inspectorWidth, setInspectorWidth } = useLayoutStore()

  if (!inspectorOpen) return null

  return (
    <motion.aside
      variants={variants.slideInRight}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative flex flex-col h-full overflow-hidden border-s transition-all"
      style={{
        width: inspectorWidth,
        backgroundColor: "var(--surface-raised, #FFFFFF)",
        borderColor: "var(--border-default, #E5E5E5)",
      }}
      aria-label="Inspector panel"
    >
      {header && <div className="shrink-0">{header}</div>}
      {tabBar && <div className="shrink-0">{tabBar}</div>}
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
      <div
        onMouseDown={(e) => {
          e.preventDefault()
          const startX = e.clientX
          const startW = inspectorWidth
          const handleMouseMove = (ev: MouseEvent) => {
            const delta = startX - ev.clientX
            setInspectorWidth(Math.max(280, Math.min(512, startW + delta)))
          }
          const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
          }
          document.addEventListener("mousemove", handleMouseMove)
          document.addEventListener("mouseup", handleMouseUp)
        }}
        className="absolute top-0 inset-inline-start-0 w-1.5 h-full cursor-col-resize group z-10"
      >
        <div className="absolute inset-y-0 inset-inline-start-0 w-1 rounded-full bg-transparent group-hover:bg-[rgba(0,191,165,0.4)] transition-colors" />
      </div>
    </motion.aside>
  )
}
