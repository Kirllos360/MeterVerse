"use client"

import { type ReactNode } from "react"
import { useLayoutStore } from "@/stores"
import { Sidebar, SidebarDock } from "@/components/shell/sidebar"
import { TopHeader } from "@/components/shell/header"
import { WorkspaceShell } from "@/components/shell/workspace/WorkspaceShell"
import { InspectorShell } from "@/components/shell/inspector/InspectorShell"
import { StatusBar } from "@/components/shell/statusbar/StatusBar"
import { transitions } from "@/design-system/motion"
import { motion, AnimatePresence } from "framer-motion"

interface ShellOrchestratorProps {
  sidebarContent?: ReactNode
  sidebarHeader?: ReactNode
  sidebarFooter?: ReactNode
  headerLeft?: ReactNode
  headerCenter?: ReactNode
  headerRight?: ReactNode
  children?: ReactNode
  workspacePlaceholder?: ReactNode
  inspectorContent?: ReactNode
  inspectorHeader?: ReactNode
  inspectorTabBar?: ReactNode
  showStatusBar?: boolean
}

export function ShellOrchestrator({
  sidebarContent,
  sidebarHeader,
  sidebarFooter,
  headerLeft,
  headerCenter,
  headerRight,
  children,
  workspacePlaceholder,
  inspectorContent,
  inspectorHeader,
  inspectorTabBar,
  showStatusBar = true,
}: ShellOrchestratorProps) {
  const { sidebarMode } = useLayoutStore()
  const isDock = sidebarMode === "dock"

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "var(--surface-base, #FAFAFA)" }}
    >
      {isDock ? (
        <div className="flex items-start h-full pt-3 ps-3 z-30">
          <SidebarDock />
        </div>
      ) : (
        <Sidebar header={sidebarHeader} footer={sidebarFooter}>
          {sidebarContent}
        </Sidebar>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          leftSlot={headerLeft}
          centerSlot={headerCenter}
          rightSlot={headerRight}
        />
        <WorkspaceShell placeholder={workspacePlaceholder}>
          {children}
        </WorkspaceShell>
        {showStatusBar && <StatusBar />}
      </div>

      <InspectorShell
        header={inspectorHeader}
        tabBar={inspectorTabBar}
      >
        {inspectorContent}
      </InspectorShell>
    </div>
  )
}
