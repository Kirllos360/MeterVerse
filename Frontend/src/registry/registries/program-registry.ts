import { BaseRegistry } from "./base-registry"
import type { ProgramRegistration, ProgramMetadata } from "@/runtime/contracts/program"

export interface ProgramRegistryItem extends ProgramRegistration {
  id: string
  name: string
  metadata: ProgramMetadata
  category: string
  enabled: boolean
}

export class ProgramRegistry extends BaseRegistry<ProgramRegistryItem> {
  constructor() { super("program-registry", "Program Registry") }

  getByCategory(category: string): ProgramRegistryItem[] {
    return this.getAll().filter((p) => p.metadata.category === category)
  }

  getByWorkspaceType(type: string): ProgramRegistryItem[] {
    return this.getAll().filter((p) => p.metadata.supportsSplitView || type === "single")
  }

  getDefaultPrograms(): ProgramRegistryItem[] {
    return this.getAll().filter((p) => p.metadata.category === "executive").slice(0, 1)
  }

  getRecentPrograms(limit = 10): ProgramRegistryItem[] {
    return this.getAll().slice(0, limit)
  }

  supportsFeature(programId: string, feature: string): boolean {
    const p = this.get(programId)
    if (!p) return false
    const featureMap: Record<string, keyof ProgramMetadata> = {
      splitView: "supportsSplitView", popout: "supportsPopout",
      minimize: "supportsMinimize", multiple: "supportsMultiple",
    }
    const key = featureMap[feature]
    return key ? !!p.metadata[key] : false
  }
}
