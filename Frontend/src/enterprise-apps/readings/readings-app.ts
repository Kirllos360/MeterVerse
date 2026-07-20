// Default view: Table
import { BaseApp } from "../shared/app-base"
import type { ProgramHost, ProgramMetadata, ProgramState, ActivateOptions, DeactivateOptions, SuspendedState, MountContext, ProgramConfig, ProgramLifecycle } from "@/runtime/contracts/program"
export class ReadingsApp extends BaseApp {
  readonly id = "readings"
  readonly metadata: ProgramMetadata = this.getDefaultMetadata({ title: "Readings", category: "readings", description: "Meter readings", requiredPermissions: ["readings:create"] })
  lifecycle: ProgramLifecycle = {
    mount: async (ctx: MountContext) => { this.state = "mounted" as ProgramState; return { success: true } },
    initialize: async (_config: ProgramConfig) => { this.state = "initialized" as ProgramState; return { success: true } },
    activate: async (_opts?: ActivateOptions) => { this.state = "active" as ProgramState; this.host.setTitle("Readings"); return { success: true } },
    deactivate: async (_opts?: DeactivateOptions) => { this.state = "deactivated" as ProgramState; return { success: true } },
    suspend: async () => ({ programId: this.id, state: this.state, timestamp: Date.now() }),
    resume: async (_state: SuspendedState) => { this.state = "active" as ProgramState; return { success: true } },
    destroy: async () => { this.state = "destroyed" as ProgramState },
  }
  async render(container: HTMLElement) {
    container.innerHTML = `<div class="p-6 overflow-y-auto h-full" style="background:var(--surface-base)"><h1 class="text-lg font-semibold" style="color:var(--text-primary)">Readings</h1><p class="text-xs mt-1 mb-4" style="color:var(--text-tertiary)">Meter reading center</p>
      <div class="grid grid-cols-3 gap-3 mb-4">${["Total Readings","Pending Review","Anomalies","Today's Entries"].map((n,i)=>`<div class="rounded-xl border p-4" style="background:var(--surface-raised);border-color:var(--border-default)"><div class="text-xs" style="color:var(--text-tertiary)">${n}</div><div class="text-xl font-bold mt-1" style="color:${["var(--text-primary)","var(--status-warning)","var(--status-error)","var(--brand)"][i]}">0</div></div>`).join("")}</div>
      <div class="rounded-xl border overflow-hidden" style="border-color:var(--border-default)"><table class="w-full"><thead><tr style="background:var(--surface-tableHeader)"><th class="px-4 py-3 text-left text-xs font-medium" style="color:var(--text-secondary)">Meter</th><th class="px-4 py-3 text-left text-xs font-medium" style="color:var(--text-secondary)">Value</th><th class="px-4 py-3 text-left text-xs font-medium" style="color:var(--text-secondary)">Date</th><th class="px-4 py-3 text-left text-xs font-medium" style="color:var(--text-secondary)">Status</th></tr></thead><tbody><tr><td colspan="4" class="px-4 py-12 text-center text-sm" style="color:var(--text-tertiary)"><span>No readings recorded</span></td></tr></tbody></table></div></div>`
  }
}


