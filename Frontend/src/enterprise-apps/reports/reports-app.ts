import { BaseApp } from "../shared/app-base"
import type { ProgramHost, ProgramMetadata, ActivateOptions, DeactivateOptions, SuspendedState, MountContext, ProgramConfig, ProgramLifecycle } from "@/runtime/contracts/program"
export class ReportsApp extends BaseApp {
  readonly id = "reports"
  readonly metadata: ProgramMetadata = this.getDefaultMetadata({ title: "Reports", category: "reports", description: "Reporting center", requiredPermissions: ["reports:export"] })
  lifecycle: ProgramLifecycle = {
    mount: async (ctx: MountContext) => { this.state = "mounted" as ProgramState; return { success: true } },
    initialize: async (_config: ProgramConfig) => { this.state = "initialized" as ProgramState; return { success: true } },
    activate: async (_opts?: ActivateOptions) => { this.state = "active" as ProgramState; this.host.setTitle("Reports"); return { success: true } },
    deactivate: async (_opts?: DeactivateOptions) => { this.state = "deactivated" as ProgramState; return { success: true } },
    suspend: async () => ({ programId: this.id, state: this.state, timestamp: Date.now() }),
    resume: async (_state: SuspendedState) => { this.state = "active" as ProgramState; return { success: true } },
    destroy: async () => { this.state = "destroyed" as ProgramState },
  }
  async render(container: HTMLElement) {
    container.innerHTML = `<div class="p-6 overflow-y-auto h-full" style="background:var(--surface-base)"><h1 class="text-lg font-semibold" style="color:var(--text-primary)">Reports</h1><p class="text-xs mt-1 mb-4" style="color:var(--text-tertiary)">Report generation center</p>
      <div class="grid grid-cols-2 gap-3">${[["Consumption Report","chart"],["Financial Report","dollar"],["Meter Status","gauge"],["Collection Report","wallet"]].map(([name,icon])=>`
        <div class="rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all" style="background:var(--surface-raised);border-color:var(--border-default)">
          <div class="flex items-center gap-2"><span class="text-lg">${icon==="chart"?"📊":icon==="dollar"?"💰":icon==="gauge"?"📈":"💳"}</span><div><div class="text-sm font-medium" style="color:var(--text-primary)">${name}</div><div class="text-xs mt-0.5" style="color:var(--text-tertiary)">Generate ${name.toLowerCase()}</div></div></div>
        </div>`).join("")}</div></div>`
  }
}
