"use client"

import { type ReactNode, createContext, useContext, useCallback, useMemo } from "react"

export interface WorkspaceRuntimeContext {
  ready: boolean
  initialized: boolean
}

const WorkspaceCtx = createContext<WorkspaceRuntimeContext>({ ready: false, initialized: false })

export function useWorkspaceRuntime() {
  return useContext(WorkspaceCtx)
}

interface RuntimeProviderProps {
  children: ReactNode
}

export function RuntimeProvider({ children }: RuntimeProviderProps) {
  const value = useMemo(() => ({ ready: true, initialized: true }), [])
  return <WorkspaceCtx.Provider value={value}>{children}</WorkspaceCtx.Provider>
}

export function WorkspaceRuntime({ children }: { children: ReactNode }) {
  return <RuntimeProvider>{children}</RuntimeProvider>
}

export { useEventBus } from "../events/event-bus"
export { useWindowManager } from "../window/window-manager"
export { usePanelRuntime } from "../panel/panel-runtime"
export { useLayoutPresets } from "../layout/layout-presets"
export { useWorkspaceTabs } from "../tabs/workspace-tabs"
export { useAppRegistry } from "../application/application-registry"
export { useCommandRuntime } from "../command/command-runtime"
export { useNavigationRuntime } from "../navigation/navigation-runtime"
export { useWorkspacePersistence } from "../persistence/workspace-persistence"
export { useToolbarRuntime } from "../toolbar/toolbar-runtime"
export { useInspectorRuntime } from "../inspector/inspector-runtime"
export { useMetadataEngine } from "../metadata/metadata-engine"
export { usePluginRuntime } from "../plugin/plugin-runtime"
export { SkeletonRuntime, EmptyRuntime, LoadingRuntime, OfflineRuntime, ErrorRuntime, PermissionRuntime } from "../loading/loading-states"
