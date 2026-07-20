import type { Registrable, RegistrationOptions, RegistrationResult, RegistryFilter, RegistryEvent, RegistrySnapshot } from "../contracts/base"
import { TypedEvent } from "@/runtime/kernel/events"

export class BaseRegistry<T extends Registrable> {
  readonly id: string
  readonly name: string
  readonly version = "1.0.0"
  protected items = new Map<string, T>()
  protected overrides = new Map<string, T>()

  onRegister = new TypedEvent<RegistryEvent<T>>()
  onUnregister = new TypedEvent<RegistryEvent<T>>()

  constructor(id: string, name: string) {
    this.id = id
    this.name = name
  }

  register(item: T, options: RegistrationOptions = {}): RegistrationResult {
    if (this.items.has(item.id)) {
      if (options.allowDuplicate) {
        this.items.set(item.id, item)
        this.onRegister.dispatch({ registryId: this.id, item, timestamp: Date.now(), source: options.source || "system" })
        return { success: true, id: item.id, action: "registered" }
      }
      if (options.allowOverride) {
        this.overrides.set(item.id, this.items.get(item.id)!)
        this.items.set(item.id, item)
        this.onRegister.dispatch({ registryId: this.id, item, timestamp: Date.now(), source: options.source || "system" })
        return { success: true, id: item.id, action: "overridden" }
      }
      return { success: false, id: item.id, action: "skipped", error: `Item "${item.id}" already registered` }
    }
    this.items.set(item.id, item)
    this.onRegister.dispatch({ registryId: this.id, item, timestamp: Date.now(), source: options.source || "system" })
    return { success: true, id: item.id, action: "registered" }
  }

  unregister(id: string): void {
    const item = this.items.get(id)
    this.items.delete(id)
    this.overrides.delete(id)
    if (item) this.onUnregister.dispatch({ registryId: this.id, item, timestamp: Date.now(), source: "system" })
  }

  get(id: string): T | undefined { return this.items.get(id) }
  getAll(filter?: RegistryFilter): T[] {
    let result = Array.from(this.items.values())
    if (filter) {
      if (filter.categories) result = result.filter((i) => filter.categories!.includes(i.category || ""))
      if (filter.tags) result = result.filter((i) => i.tags?.some((t) => filter.tags!.includes(t)))
      if (filter.enabled !== undefined) result = result.filter((i) => (i.enabled ?? true) === filter.enabled)
      if (filter.search) {
        const q = filter.search.toLowerCase()
        result = result.filter((i) => (i.name || i.id).toLowerCase().includes(q) || i.id.toLowerCase().includes(q))
      }
    }
    return result
  }

  has(id: string): boolean { return this.items.has(id) }
  count(): number { return this.items.size }

  findByCategory(category: string): T[] {
    return this.getAll().filter((i) => i.category === category)
  }

  search(query: string): T[] {
    const q = query.toLowerCase()
    return this.getAll().filter((i) => (i.name || i.id).toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || i.tags?.some((t) => t.includes(q)))
  }

  findByPermission(permission: string): T[] {
    return this.getAll().filter((i) => i.permissions?.includes(permission))
  }

  snapshot(): RegistrySnapshot {
    return { id: this.id, timestamp: Date.now(), items: this.getAll(), version: this.version }
  }

  clear(): void { this.items.clear(); this.overrides.clear() }
}
