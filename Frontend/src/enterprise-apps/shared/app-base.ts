import type { ProgramContract, ProgramLifecycle, ProgramMetadata, ProgramHost, ProgramState, MountContext, ProgramConfig, ActivateOptions, DeactivateOptions, SuspendedState } from "@/runtime/contracts/program"
import { getDataEngine } from "@/data-engine/hooks/useDataEngine"
import { getEventBus } from "@/event-bus/core/event-bus-provider"

export abstract class BaseApp implements ProgramContract {
  abstract readonly id: string
  abstract readonly metadata: ProgramMetadata
  state: ProgramState = "registered" as ProgramState
  abstract readonly lifecycle: ProgramLifecycle
  readonly host: ProgramHost
  protected dataEngine = getDataEngine()
  protected eventBus = getEventBus()

  constructor(host: ProgramHost) { this.host = host }

  abstract render(container: HTMLElement): Promise<void>

  async destroy(): Promise<void> {
    this.state = "destroyed" as ProgramState
    this.eventBus.publish("runtime:program:destroyed", { programId: this.id })
  }

  protected getDefaultMetadata(overrides: Partial<ProgramMetadata>): ProgramMetadata {
    return {
      id: this.id, title: this.id.charAt(0).toUpperCase() + this.id.slice(1),
      version: "1.0.0", description: `${this.id} management`,
      category: "general", supportsSplitView: true, supportsPopout: false,
      supportsMinimize: true, supportsMultiple: false, estimatedMemory: 1024,
      requiredPermissions: [], canSuspend: true, canDestroy: true,
      preserveScroll: true, preserveState: true, ...overrides,
    }
  }
}
