"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { WorkspaceManagerImpl } from "../managers/workspace-manager"
import { DockManagerImpl } from "../dock/dock-manager"
import { TabsManagerImpl } from "../tabs/tabs-manager"
import { LayoutManager } from "../layout/layout-templates"
import { WorkspacePersistenceImpl } from "../persistence/workspace-persistence"
import { WorkspaceRecoveryImpl } from "../recovery/workspace-recovery"
import { getRuntime } from "@/runtime/providers/runtime-provider"
import type { WorkspaceState, WorkspaceMode } from "../contracts/workspace"

export interface WorkspaceEngine {
  workspace: WorkspaceManagerImpl
  dock: DockManagerImpl
  tabs: TabsManagerImpl
  layout: LayoutManager
  persistence: WorkspacePersistenceImpl
  recovery: WorkspaceRecoveryImpl
  state: WorkspaceState

  openProgram(programId: string): Promise<void>
  closeProgram(slotId: string): Promise<void>
  setMode(mode: WorkspaceMode): Promise<void>
  restore(): Promise<void>
  save(): void
}

const WorkspaceCtx = createContext<WorkspaceEngine | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [engine] = useState<WorkspaceEngine>(() => {
    const workspace = new WorkspaceManagerImpl()
    const dock = new DockManagerImpl()
    const tabs = new TabsManagerImpl()
    const layout = new LayoutManager()
    const persistence = new WorkspacePersistenceImpl()
    const recovery = new WorkspaceRecoveryImpl()

    layout.loadSavedLayouts()

    const eng: WorkspaceEngine = {
      workspace, dock, tabs, layout, persistence, recovery,
      get state() { return workspace.state },

      async openProgram(programId: string) {
        const slot = await workspace.openProgram(programId)
        tabs.createTab(programId, programId)
        dock.recordAccess(programId)
      },

      async closeProgram(slotId: string) {
        await workspace.closeProgram(slotId)
      },

      async setMode(mode: WorkspaceMode) {
        await workspace.setMode(mode)
      },

      async restore() {
        const runtime = getRuntime()
        await workspace.initialize(runtime)
        await recovery.recover(workspace, dock, runtime)
        // Auto-save every 30s
        persistence.autoSave(workspace, dock, 30000)
      },

      save() {
        persistence.save(workspace, dock)
      },
    }

    return eng
  })

  // Initialize on mount
  useEffect(() => {
    engine.restore()

    // Save on beforeunload
    const handleUnload = () => engine.save()
    window.addEventListener("beforeunload", handleUnload)
    return () => window.removeEventListener("beforeunload", handleUnload)
  }, [engine])

  const value = useMemo(() => engine, [engine])

  return <WorkspaceCtx.Provider value={value}>{children}</WorkspaceCtx.Provider>
}

export function useWorkspaceEngine(): WorkspaceEngine {
  const ctx = useContext(WorkspaceCtx)
  if (!ctx) throw new Error("useWorkspaceEngine must be used within WorkspaceProvider")
  return ctx
}
