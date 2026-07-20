import type { Mutation, MutationResult } from "../contracts/types"
import { TypedEvent } from "@/runtime/kernel/events"
import { RestDataProvider } from "../providers/data-provider"

export interface PendingMutation {
  id: string
  mutation: Mutation
  queuedAt: number
  retryCount: number
  maxRetries: number
  status: "queued" | "syncing" | "failed"
  lastError?: string
}

export interface SyncResult {
  success: boolean
  syncedCount: number
  failedCount: number
  duration: number
}

export class OfflineEngine {
  private _isOnline = true
  private _pendingMutations: PendingMutation[] = []
  private provider: RestDataProvider

  onOnlineChange = new TypedEvent<boolean>()
  onPendingChange = new TypedEvent<number>()

  constructor(provider: RestDataProvider) {
    this.provider = provider
    this.loadPending()
  }

  get isOnline() { return this._isOnline }
  get pendingMutations() { return [...this._pendingMutations] }
  get pendingCount() { return this._pendingMutations.length }

  goOffline(): void {
    this._isOnline = false
    this.onOnlineChange.dispatch(false)
  }

  goOnline(): void {
    this._isOnline = true
    this.onOnlineChange.dispatch(true)
    this.sync()
  }

  async queueMutation(mutation: Mutation): Promise<MutationResult<unknown>> {
    if (this._isOnline) {
      return this.provider.executeMutation(mutation)
    }
    const pending: PendingMutation = {
      id: `pm_${Date.now()}`,
      mutation,
      queuedAt: Date.now(),
      retryCount: 0,
      maxRetries: 5,
      status: "queued",
    }
    this._pendingMutations.push(pending)
    this.persistPending()
    this.onPendingChange.dispatch(this._pendingMutations.length)
    return { success: true }
  }

  async sync(): Promise<SyncResult> {
    const start = Date.now()
    let synced = 0
    let failed = 0

    for (const pending of this._pendingMutations) {
      if (pending.status === "syncing") continue
      pending.status = "syncing"
      try {
        await this.provider.executeMutation(pending.mutation)
        pending.status = "queued" // Mark for removal
        synced++
      } catch (err) {
        pending.retryCount++
        if (pending.retryCount >= pending.maxRetries) {
          pending.status = "failed"
          pending.lastError = String(err)
          failed++
        } else {
          pending.status = "queued"
        }
      }
    }

    this._pendingMutations = this._pendingMutations.filter((p) => p.status !== "queued" || p.retryCount === 0)
    this.persistPending()
    this.onPendingChange.dispatch(this._pendingMutations.length)

    return { success: failed === 0, syncedCount: synced, failedCount: failed, duration: Date.now() - start }
  }

  private persistPending(): void {
    try { localStorage.setItem("mv:offline:mutations", JSON.stringify(this._pendingMutations)) } catch {}
  }

  private loadPending(): void {
    try {
      const raw = localStorage.getItem("mv:offline:mutations")
      if (raw) this._pendingMutations = JSON.parse(raw)
    } catch {}
  }
}
