import type { WorkspaceSnapshot } from "../contracts/workspace"
import type { WorkspaceManagerImpl } from "../managers/workspace-manager"
import type { DockManagerImpl } from "../dock/dock-manager"
import type { RuntimeContext } from "@/runtime/contracts/runtime"

export interface RecoveryResult {
  recovered: boolean
  reason?: string
  programs?: number
  fallback?: string
}

export interface WorkspaceRecovery {
  recover(workspace: WorkspaceManagerImpl, dock: DockManagerImpl, runtime: RuntimeContext): Promise<RecoveryResult>
  recoverMinimal(workspace: WorkspaceManagerImpl, runtime: RuntimeContext): Promise<void>
  verifySnapshot(snapshot: WorkspaceSnapshot): IntegrityResult
}

export interface IntegrityResult {
  isValid: boolean
  corruptedSections: string[]
}

export class WorkspaceRecoveryImpl implements WorkspaceRecovery {
  async recover(workspace: WorkspaceManagerImpl, dock: DockManagerImpl, runtime: RuntimeContext): Promise<RecoveryResult> {
    const storageKey = "mv:workspace"
    const raw = localStorage.getItem(storageKey)
    if (!raw) return { recovered: false, reason: "no_snapshot", fallback: "default_layout" }

    try {
      const snapshot: WorkspaceSnapshot = JSON.parse(raw)
      const integrity = this.verifySnapshot(snapshot)
      if (!integrity.isValid) {
        const minimal = await this.tryPartialRecovery(workspace, dock, runtime, snapshot)
        return minimal
      }

      await workspace.restore(snapshot)
      dock.restoreState(snapshot.dock)

      for (const tab of snapshot.tabs) {
        if (tab.isPinned || !tab.isTemporary) {
          try {
            await workspace.openProgram(tab.programId, { focus: false })
          } catch {
            console.warn(`[Recovery] Failed to restore program: ${tab.programId}`)
          }
        }
      }

      if (snapshot.workspace.activeSlotId) {
        const slot = workspace.state.slots.find((s) => s.id === snapshot.workspace.activeSlotId)
        if (slot) await workspace.focusProgram(slot.id)
      }

      return { recovered: true, programs: workspace.state.slots.length }
    } catch (e) {
      await this.recoverMinimal(workspace, runtime)
      return { recovered: false, reason: "parse_error", fallback: "minimal" }
    }
  }

  async recoverMinimal(workspace: WorkspaceManagerImpl, runtime: RuntimeContext): Promise<void> {
    await workspace.openProgram("welcome")
  }

  verifySnapshot(snapshot: WorkspaceSnapshot): IntegrityResult {
    const corrupted: string[] = []
    if (!snapshot.version) corrupted.push("version")
    if (!snapshot.workspace) corrupted.push("workspace")
    if (!snapshot.dock) corrupted.push("dock")
    if (!snapshot.tabs) corrupted.push("tabs")
    return { isValid: corrupted.length === 0, corruptedSections: corrupted }
  }

  private async tryPartialRecovery(
    workspace: WorkspaceManagerImpl, dock: DockManagerImpl, runtime: RuntimeContext, snapshot: WorkspaceSnapshot
  ): Promise<RecoveryResult> {
    try {
      if (snapshot.dock) dock.restoreState(snapshot.dock)
      if (snapshot.tabs) {
        for (const tab of snapshot.tabs.slice(0, 5)) {
          try { await workspace.openProgram(tab.programId, { focus: false }) } catch {}
        }
      }
      return { recovered: true, programs: workspace.state.slots.length, fallback: "partial" }
    } catch {
      await this.recoverMinimal(workspace, runtime)
      return { recovered: false, reason: "partial_failed", fallback: "minimal" }
    }
  }
}
