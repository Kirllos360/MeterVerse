import type { WorkspaceSnapshot } from "../contracts/workspace"
import type { WorkspaceManagerImpl } from "../managers/workspace-manager"
import type { DockManagerImpl } from "../dock/dock-manager"

export interface WorkspacePersistence {
  save(workspace: WorkspaceManagerImpl, dock: DockManagerImpl): void
  load(): WorkspaceSnapshot | null
  hasSavedWorkspace(): boolean
  clear(): void
  autoSave(workspace: WorkspaceManagerImpl, dock: DockManagerImpl, intervalMs: number): () => void
  createBackup(): string
  listBackups(): string[]
  restoreBackup(backupId: string): WorkspaceSnapshot | null
}

export class WorkspacePersistenceImpl implements WorkspacePersistence {
  private readonly storageKey = "mv:workspace"
  private readonly backupPrefix = "mv:workspace:backup:"

  save(workspace: WorkspaceManagerImpl, dock: DockManagerImpl): void {
    try {
      const snapshot = workspace.save()
      snapshot.dock = dock.getState()
      localStorage.setItem(this.storageKey, JSON.stringify(snapshot))
    } catch (e) {
      console.error("[WorkspacePersistence] Failed to save:", e)
    }
  }

  load(): WorkspaceSnapshot | null {
    try {
      const raw = localStorage.getItem(this.storageKey)
      if (!raw) return null
      return JSON.parse(raw) as WorkspaceSnapshot
    } catch {
      return null
    }
  }

  hasSavedWorkspace(): boolean {
    return localStorage.getItem(this.storageKey) !== null
  }

  clear(): void {
    localStorage.removeItem(this.storageKey)
  }

  autoSave(workspace: WorkspaceManagerImpl, dock: DockManagerImpl, intervalMs: number): () => void {
    const id = setInterval(() => this.save(workspace, dock), intervalMs)
    return () => clearInterval(id)
  }

  createBackup(): string {
    const raw = localStorage.getItem(this.storageKey)
    if (!raw) return ""
    const backupId = `backup_${Date.now()}`
    localStorage.setItem(`${this.backupPrefix}${backupId}`, raw)
    return backupId
  }

  listBackups(): string[] {
    const backups: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.backupPrefix)) backups.push(key.replace(this.backupPrefix, ""))
    }
    return backups.sort()
  }

  restoreBackup(backupId: string): WorkspaceSnapshot | null {
    try {
      const raw = localStorage.getItem(`${this.backupPrefix}${backupId}`)
      if (!raw) return null
      return JSON.parse(raw) as WorkspaceSnapshot
    } catch {
      return null
    }
  }
}
