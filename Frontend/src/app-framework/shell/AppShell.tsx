"use client"

import type { ReactNode } from "react"
import { useWorkspaceStore } from "@/workspace/stores"

interface AppShellProps {
  title: string
  description?: string
  icon?: string
  actions?: ReactNode
  children: ReactNode
}

export function AppShell({ title, description, icon, actions, children }: AppShellProps) {
  const { openTab } = useWorkspaceStore()

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "var(--border-default, #E5E5E5)" }}>
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(0,191,165,0.1)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={icon === "LayoutDashboard" ? "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" :
                  icon === "Users" ? "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" :
                  icon === "FileText" ? "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6" :
                  "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"} />
              </svg>
            </div>
          )}
          <div>
            <h1 className="text-base font-semibold" style={{ color: "var(--text-primary, #0A0A0A)" }}>{title}</h1>
            {description && <p className="text-xs" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  )
}
