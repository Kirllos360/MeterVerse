export interface ServiceOptions {
  singleton?: boolean
  lazy?: boolean
}

export interface ServiceContainer {
  register<T>(id: string, service: T, options?: ServiceOptions): void
  resolve<T>(id: string): T
  has(id: string): boolean
  unregister(id: string): void
  getServiceIds(): string[]
  createScope(): ServiceContainer
  dispose(): void
}

export class RuntimeServiceContainer implements ServiceContainer {
  private services = new Map<string, { instance: unknown; options?: ServiceOptions }>()

  register<T>(id: string, service: T, options?: ServiceOptions): void {
    if (this.services.has(id) && options?.singleton !== false) {
      console.warn(`[Services] Overriding existing service: ${id}`)
    }
    this.services.set(id, { instance: service, options })
  }

  resolve<T>(id: string): T {
    const entry = this.services.get(id)
    if (!entry) throw new Error(`[Services] Service not found: ${id}`)
    return entry.instance as T
  }

  has(id: string): boolean {
    return this.services.has(id)
  }

  unregister(id: string): void {
    this.services.delete(id)
  }

  getServiceIds(): string[] {
    return Array.from(this.services.keys())
  }

  createScope(): ServiceContainer {
    const child = new RuntimeServiceContainer()
    for (const [id, entry] of this.services) {
      child.services.set(id, entry)
    }
    return child
  }

  dispose(): void {
    this.services.clear()
  }
}
