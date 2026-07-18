// Workspace Engine — Phase 17B Implementation
// Turn MeterVerse into an operating environment

export { WorkspaceManagerImpl } from "./managers/workspace-manager"
export { DockManagerImpl } from "./dock/dock-manager"
export { TabsManagerImpl } from "./tabs/tabs-manager"
export { LayoutManager, BUILTIN_TEMPLATES } from "./layout/layout-templates"
export { WorkspacePersistenceImpl } from "./persistence/workspace-persistence"
export { WorkspaceRecoveryImpl } from "./recovery/workspace-recovery"

export { WorkspaceProvider, useWorkspaceEngine } from "./providers/workspace-provider"
export { useWorkspaceState, useActiveSlot, useActiveTab, useTabs } from "./hooks/useWorkspace"

export type { WorkspaceEngine } from "./providers/workspace-provider"
export type { WorkspaceManager } from "./managers/workspace-manager"
export type { DockManager, DockItem, DockCategory } from "./dock/dock-manager"
export type { TabsManager, WorkspaceTab } from "./tabs/tabs-manager"
export type { LayoutTemplate, WorkspaceSnapshot, WorkspaceLayout, WorkspaceState, ProgramSlot, WorkspaceMode } from "./contracts/workspace"
