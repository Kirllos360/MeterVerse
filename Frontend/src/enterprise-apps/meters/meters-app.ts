// Default view: Table
import { BaseApp } from "../shared/app-base"
import type { ProgramHost, ProgramMetadata, ProgramState, ProgramConfig, ActivateOptions, DeactivateOptions, SuspendedState, MountContext, ProgramLifecycle } from "@/runtime/contracts/program"

export class MetersApp extends BaseApp {
  readonly id = "meters"
  readonly metadata: ProgramMetadata = this.getDefaultMetadata({ title: "Meters", category: "meters", description: "Meter inventory management", requiredPermissions: ["meters:read"] })
  lifecycle: ProgramLifecycle = {
    mount: async (ctx: MountContext) => { this.state = "mounted" as ProgramState; return { success: true } },
    initialize: async (_config: ProgramConfig) => { this.state = "initialized" as ProgramState; return { success: true } },
    activate: async (_opts?: ActivateOptions) => { this.state = "active" as ProgramState; this.host.setTitle("Meters"); return { success: true } },
    deactivate: async (_opts?: DeactivateOptions) => { this.state = "deactivated" as ProgramState; return { success: true } },
    suspend: async () => ({ programId: this.id, state: this.state, timestamp: Date.now() }),
    resume: async (_state: SuspendedState) => { this.state = "active" as ProgramState; return { success: true } },
    destroy: async () => { this.state = "destroyed" as ProgramState },
  }
  async render(container: HTMLElement) {
    container.innerHTML = `<div class="p-6 overflow-y-auto h-full" style="background:var(--surface-base)"><h1 class="text-lg font-semibold" style="color:var(--text-primary)">Meters</h1><p class="text-xs mt-1 mb-4" style="color:var(--text-tertiary)">Meter inventory and assignment</p>
      <div class="rounded-xl border overflow-hidden" style="border-color:var(--border-default)"><table class="w-full"><thead><tr style="background:var(--surface-tableHeader)">
        <th class="px-4 py-3 text-left text-xs font-medium" style="color:var(--text-secondary)">Serial</th><th class="px-4 py-3 text-left text-xs font-medium" style="color:var(--text-secondary)">Type</th><th class="px-4 py-3 text-left text-xs font-medium" style="color:var(--text-secondary)">Status</th><th class="px-4 py-3 text-left text-xs font-medium" style="color:var(--text-secondary)">Location</th>
      </tr></thead><tbody><tr><td colspan="4" class="px-4 py-12 text-center text-sm" style="color:var(--text-tertiary)"><span>No meters yet</span></td></tr></tbody></table></div></div>`
  }
}

