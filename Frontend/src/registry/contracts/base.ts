export interface Registrable {
  readonly id: string
  readonly name: string
  readonly nameAr?: string
  readonly description?: string
  readonly version?: string
  readonly category?: string
  readonly priority?: number
  readonly dependencies?: string[]
  readonly permissions?: string[]
  readonly enabled?: boolean
  readonly tags?: string[]
  readonly metadata?: Record<string, unknown>
}

export interface RegistrationOptions {
  allowOverride?: boolean
  allowDuplicate?: boolean
  lazy?: boolean
  priority?: number
  source?: "system" | "plugin" | "user"
  validateDependencies?: boolean
}

export interface RegistrationResult {
  success: boolean
  id: string
  action: "registered" | "overridden" | "skipped" | "error"
  error?: string
}

export interface RegistryFilter {
  categories?: string[]
  tags?: string[]
  enabled?: boolean
  permissions?: string[]
  priority?: { min?: number; max?: number }
  search?: string
}

export interface RegistryEvent<T extends Registrable> {
  registryId: string
  item: T | string
  timestamp: number
  source: "system" | "plugin" | "user"
}

export interface DependencyGraph {
  nodes: DependencyNode[]
  edges: DependencyEdge[]
}

export interface DependencyNode {
  id: string
  type: string
  registryId: string
  dependencies: string[]
}

export interface DependencyEdge {
  from: string
  to: string
  type: "requires" | "optional" | "extends"
}

export interface RegistrySnapshot {
  id: string
  timestamp: number
  items: Registrable[]
  version: string
}
