"use client"

import { useState, useEffect } from "react"
import { useWorkspaceEngine } from "../providers/workspace-provider"
import type { ProgramSlot, WorkspaceState } from "../contracts/workspace"
import type { WorkspaceTab } from "../tabs/tabs-manager"

export function useWorkspaceState() {
  const engine = useWorkspaceEngine()
  const [state, setState] = useState<WorkspaceState>(engine.state)

  useEffect(() => {
    const unsub = engine.workspace.onWorkspaceChange.subscribe((change) => {
      setState((prev) => ({ ...prev, ...change }))
    })
    return unsub
  }, [engine])

  return state
}

export function useActiveSlot(): ProgramSlot | undefined {
  const state = useWorkspaceState()
  return state.slots.find((s) => s.isFocused)
}

export function useActiveTab(): WorkspaceTab | undefined {
  const engine = useWorkspaceEngine()
  const [tab, setTab] = useState<WorkspaceTab | undefined>(
    engine.tabs.activeTabId ? engine.tabs.getTab(engine.tabs.activeTabId) : undefined
  )

  useEffect(() => {
    const unsub = engine.tabs.onTabChange.subscribe(() => {
      const activeId = engine.tabs.activeTabId
      setTab(activeId ? engine.tabs.getTab(activeId) : undefined)
    })
    return unsub
  }, [engine])

  return tab
}

export function useTabs(): WorkspaceTab[] {
  const engine = useWorkspaceEngine()
  const [tabs, setTabs] = useState<WorkspaceTab[]>(engine.tabs.tabs)

  useEffect(() => {
    const unsub = engine.tabs.onTabChange.subscribe(() => {
      setTabs([...engine.tabs.tabs])
    })
    return unsub
  }, [engine])

  return tabs
}
