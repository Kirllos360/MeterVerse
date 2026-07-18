"use client"

import type { ReactNode } from "react"
import { useLayoutStore } from "@/stores"

interface AppShellProps {
  header?: ReactNode
  sidebar?: ReactNode
  inspector?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

export function AppShell({ header, sidebar, inspector, footer, children }: AppShellProps) {
  const { sidebarMode, inspectorOpen } = useLayoutStore()
  const isCollapsed = sidebarMode === "collapsed" || sidebarMode === "dock"

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface-base,#FAFAFA)] dark:bg-[#0A0A0A]">
      {sidebar && (
        <div
          className="shrink-0 h-full"
          style={{ width: isCollapsed ? (sidebarMode === "dock" ? 52 : 64) : 256 }}
        >
          {sidebar}
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {header && <div className="shrink-0">{header}</div>}
        <main className="flex-1 overflow-y-auto">{children}</main>
        {footer && <div className="shrink-0">{footer}</div>}
      </div>

      {inspector && inspectorOpen && (
        <div className="shrink-0 h-full border-l border-[var(--color-border-default,#E5E5E5)] dark:border-[#262626] overflow-y-auto"
          style={{ width: 360 }}
        >
          {inspector}
        </div>
      )}
    </div>
  )
}
