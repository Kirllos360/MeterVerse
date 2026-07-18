import type { RuntimeSnapshot } from "../contracts/runtime"
import type { RuntimeKernel } from "../kernel/runtime"

export interface SnapshotEngine {
  save(kernel: RuntimeKernel): void
  load(): RuntimeSnapshot | null
  clear(): void
  hasSnapshot(): boolean
  autoSave(kernel: RuntimeKernel, intervalMs: number): () => void
}

export class SnapshotEngineImpl implements SnapshotEngine {
  constructor(private storageKey = "mv:runtime") {}

  save(kernel: RuntimeKernel): void {
    try {
      const snapshot = kernel.snapshot()
      localStorage.setItem(this.storageKey, JSON.stringify(snapshot))
    } catch (e) {
      console.error("[Snapshot] Failed to save:", e)
    }
  }

  load(): RuntimeSnapshot | null {
    try {
      const raw = localStorage.getItem(this.storageKey)
      if (!raw) return null
      return JSON.parse(raw) as RuntimeSnapshot
    } catch {
      return null
    }
  }

  clear(): void {
    localStorage.removeItem(this.storageKey)
  }

  hasSnapshot(): boolean {
    return localStorage.getItem(this.storageKey) !== null
  }

  autoSave(kernel: RuntimeKernel, intervalMs: number): () => void {
    const id = setInterval(() => this.save(kernel), intervalMs)
    return () => clearInterval(id)
  }
}
