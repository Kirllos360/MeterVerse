import type { Mutation } from "../contracts/types"

export interface OptimisticConfig<T> {
  createOptimistic: (mutation: Mutation<T>) => T
  createRollback?: (mutation: Mutation<T>, original: T) => T
  timeout?: number
}

export interface OptimisticUpdate {
  id: string
  mutation: Mutation
  appliedAt: number
  status: "pending" | "committed" | "rolledBack" | "timedOut"
  timeoutAt: number
}

export class OptimisticEngine {
  private updates: OptimisticUpdate[] = []
  private timers = new Map<string, ReturnType<typeof setTimeout>>()

  apply<T>(mutation: Mutation<T>, _config: OptimisticConfig<T>): string {
    const id = `opt_${Date.now()}`
    const timeout = _config.timeout || 10000

    const update: OptimisticUpdate = {
      id, mutation, appliedAt: Date.now(),
      status: "pending", timeoutAt: Date.now() + timeout,
    }
    this.updates.push(update)

    const timer = setTimeout(() => {
      update.status = "timedOut"
      this.cleanup(id)
    }, timeout)
    this.timers.set(id, timer)

    return id
  }

  commit(id: string): void {
    const update = this.updates.find((u) => u.id === id)
    if (update) {
      update.status = "committed"
      this.cleanup(id)
    }
  }

  rollback(id: string): void {
    const update = this.updates.find((u) => u.id === id)
    if (update) {
      update.status = "rolledBack"
      this.cleanup(id)
    }
  }

  getPending(): OptimisticUpdate[] {
    return this.updates.filter((u) => u.status === "pending")
  }

  clear(): void {
    for (const [, timer] of this.timers) clearTimeout(timer)
    this.updates = []
    this.timers.clear()
  }

  private cleanup(id: string): void {
    const timer = this.timers.get(id)
    if (timer) { clearTimeout(timer); this.timers.delete(id) }
  }
}
