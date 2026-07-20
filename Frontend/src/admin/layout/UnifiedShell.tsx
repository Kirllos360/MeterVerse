"use client"

import { useState, type ReactNode } from "react"

interface UnifiedShellProps {
  sidebar: ReactNode
  toolbar?: ReactNode
  tabs?: ReactNode
  children: ReactNode
  statusBar?: ReactNode
  inspector?: ReactNode
}

export function UnifiedShell({ sidebar, toolbar, tabs, children, statusBar, inspector }: UnifiedShellProps) {
  const [inspectorOpen, setInspectorOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ backgroundColor: "var(--surface-base)" }}>
      {/* Toolbar */}
      {toolbar && (
        <div className="shrink-0 z-40 relative" style={{ borderBottom: "1px solid var(--border-default)", backgroundColor: "var(--surface-topbar)" }}>
          {toolbar}
        </div>
      )}

      {/* Tab bar — Dynamic Island style */}
      {tabs && (
        <div className="shrink-0 z-30 relative" style={{ backgroundColor: "var(--surface-topbar)", borderBottom: "1px solid var(--border-default)" }}>
          {tabs}
        </div>
      )}

      {/* Main area: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <div className="shrink-0 z-20 relative" style={{ width: 48, backgroundColor: "var(--surface-sidebar)", borderRight: "1px solid var(--border-default)" }}>
            {sidebar}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto">{children}</div>

          {/* Inspector Panel */}
          {inspector && inspectorOpen && (
            <div className="shrink-0 border-t" style={{ height: 200, borderColor: "var(--border-default)", backgroundColor: "var(--surface-raised)" }}>
              {inspector}
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      {statusBar && (
        <div className="shrink-0 z-10" style={{ height: 24, backgroundColor: "var(--surface-statusbar)", borderTop: "1px solid var(--border-default)", display: "flex", alignItems: "center", padding: "0 12px", fontSize: 11, color: "var(--text-tertiary)" }}>
          {statusBar}
          <div className="flex-1" />
          <button onClick={() => setInspectorOpen(!inspectorOpen)} style={{ color: inspectorOpen ? "var(--brand)" : "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer", fontSize: 11 }}>
            {inspectorOpen ? "🔽 Inspector" : "🔼 Inspector"}
          </button>
        </div>
      )}
    </div>
  )
}
