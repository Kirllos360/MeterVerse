"use client"

import { type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useWorkspaceStore } from "../stores"

interface WorkspaceLayoutProps {
  sidebarContent: ReactNode
  toolbarContent?: ReactNode
  tabBar?: ReactNode
  children: ReactNode
  inspectorContent?: ReactNode
  statusBar?: ReactNode
}

function GradientDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`w-px shrink-0 relative ${className}`}
      style={{ background: "linear-gradient(180deg, transparent 0%, rgba(var(--brand-primary-rgb), 0.12) 50%, transparent 100%)" }}
    />
  )
}

export function WorkspaceLayout({
  sidebarContent,
  toolbarContent,
  tabBar,
  children,
  inspectorContent,
  statusBar,
}: WorkspaceLayoutProps) {
  const { sidebarMode, inspectorOpen, inspectorWidth, setInspectorWidth, setInspectorOpen } = useWorkspaceStore()

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ backgroundColor: "var(--surface-base, #FAFAFA)" }}>
      {/* HEADER — Full width, bottom edge is the start line for panels */}
      {toolbarContent && (
        <motion.div className="shrink-0 border-b z-40 relative" style={{ borderColor: "var(--border-default, #E5E5E5)", backgroundColor: "var(--surface-topbar, #FFFFFF)" }}
          animate={{ boxShadow: ["0 1px 0 rgba(var(--brand-primary-rgb), 0)", "0 1px 0 rgba(var(--brand-primary-rgb), 0.08)", "0 1px 0 rgba(var(--brand-primary-rgb), 0)"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          {toolbarContent}
        </motion.div>
      )}

      {/* MIDDLE SECTION: Sidebar + Content + Inspector */}
      {/* Panels start at header's bottom edge, end at footer's top edge */}
      <div className="flex flex-1 min-h-0 overflow-hidden" style={{ gap: 0 }}>

        {/* SIDEBAR — starts at header bottom, ends at footer top, smooth all edges */}
        <motion.div
          className="relative z-30 shrink-0 pointer-events-none"
          style={{ padding: "0 0 0 8px", alignSelf: "stretch" }}
          animate={{ width: sidebarMode === "expanded" ? 269 : sidebarMode === "collapsed" ? 73 : 57 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          <motion.div
            className="pointer-events-auto h-full overflow-hidden"
            style={{ borderRadius: 16, backgroundColor: "var(--surface-base)", border: "1px solid rgba(var(--brand-primary-rgb), 0.12)" }}
            animate={{
              width: sidebarMode === "expanded" ? 260 : sidebarMode === "collapsed" ? 64 : 48,
              borderRadius: sidebarMode === "expanded" ? 16 : sidebarMode === "collapsed" ? 14 : 24,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            {sidebarContent}
          </motion.div>
        </motion.div>

        <GradientDivider />

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {tabBar}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
        </div>

        {/* Inspector collapsed menu — icon bar like sidebar */}
        {!inspectorOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 48, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="shrink-0 flex flex-col items-center gap-3 py-3 border-l cursor-pointer z-30 group transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
            style={{ backgroundColor: "var(--surface-topbar, #FFFFFF)", borderColor: "var(--border-default, #E5E5E5)", width: 48 }}
            onClick={() => setInspectorOpen(!inspectorOpen)}
            title="Open inspector"
          >
            {[{ icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", label: "Details" },
              { icon: "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2", label: "Activity" },
              { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: "Notes" },
            ].map((item, i) => (
              <motion.button
                key={item.label}
                className="w-8 h-8 flex items-center justify-center rounded-xl relative"
                style={{ color: "rgba(var(--brand-primary-rgb), 0.4)" }}
                whileHover={{ scale: 1.15, color: "var(--brand-primary)" }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); setInspectorOpen(true) }}
                title={item.label}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={item.icon} /></svg>
                {i === 0 && (
                  <motion.span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ backgroundColor: "var(--brand-primary)" }}
                    animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                )}
              </motion.button>
            ))}
            {/* Bottom collapse arrow */}
            <motion.button
              className="w-8 h-8 flex items-center justify-center rounded-xl mt-auto"
              style={{ color: "rgba(var(--white-rgb), 0.2)" }}
              whileHover={{ scale: 1.1, color: "var(--brand-primary)" }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setInspectorOpen(true) }}
              title="Expand inspector"
            >
              <motion.svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                animate={{ x: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <path d="M9 18l6-6-6-6" />
              </motion.svg>
            </motion.button>
          </motion.div>
        )}

        <AnimatePresence>
          {inspectorOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="shrink-0"><GradientDivider /></motion.div>}
        </AnimatePresence>

        {/* INSPECTOR */}
        <AnimatePresence>
          {inspectorOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: inspectorWidth + 12, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="relative z-30 shrink-0 overflow-visible"
              style={{ padding: "0 8px 0 4px" }}
            >
              <div className="absolute pointer-events-none" style={{ left: -4, top: 0, bottom: 0 }}>
                <div onMouseDown={(e) => { e.preventDefault(); const startX = e.clientX; const startW = inspectorWidth + 12; const hm = (ev: MouseEvent) => setInspectorWidth(Math.max(200, Math.min(400, startW - 12 + startX - ev.clientX))); const hu = () => { document.removeEventListener("mousemove", hm); document.removeEventListener("mouseup", hu) }; document.addEventListener("mousemove", hm); document.addEventListener("mouseup", hu) }}
                  className="w-3 cursor-col-resize group z-20 absolute inset-y-0 -left-1 flex items-center"><div className="w-0.5 h-8 rounded-full bg-transparent group-hover:bg-[rgba(var(--brand-primary-rgb), 0.3)] transition-colors mx-auto" /></div>
              </div>
              <motion.div
                className="h-full pointer-events-auto overflow-hidden"
                style={{ backgroundColor: "var(--surface-raised, #FFFFFF)", border: "1px solid var(--border-default, #E5E5E5)" }}
                animate={{ borderRadius: 16 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              >
                {inspectorContent}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER — Full width, top edge is the end line for panels */}
      {statusBar && (
        <motion.div className="shrink-0 border-t z-40 relative overflow-hidden" style={{ borderColor: "var(--border-default, #E5E5E5)", backgroundColor: "var(--surface-topbar, #FFFFFF)" }}
          animate={{ boxShadow: ["0 -1px 0 rgba(var(--brand-primary-rgb), 0)", "0 -1px 0 rgba(var(--brand-primary-rgb), 0.06)", "0 -1px 0 rgba(var(--brand-primary-rgb), 0)"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          {statusBar}
        </motion.div>
      )}
    </div>
  )
}
