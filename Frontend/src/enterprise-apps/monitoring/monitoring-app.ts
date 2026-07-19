// Default view: Table
import { BaseApp } from "../shared/app-base"
import type { ProgramHost, ProgramMetadata, ActivateOptions, DeactivateOptions, SuspendedState, MountContext, ProgramConfig, ProgramLifecycle } from "@/runtime/contracts/program"
export class MonitoringApp extends BaseApp {
  readonly id = "monitoring"
  readonly metadata: ProgramMetadata = this.getDefaultMetadata({ title: "Monitoring", category: "monitoring", description: "System and meter monitoring" })
  lifecycle: ProgramLifecycle = {
    mount: async (ctx: MountContext) => { this.state = "mounted" as ProgramState; return { success: true } },
    initialize: async (_config: ProgramConfig) => { this.state = "initialized" as ProgramState; return { success: true } },
    activate: async (_opts?: ActivateOptions) => { this.state = "active" as ProgramState; this.host.setTitle("Monitoring"); return { success: true } },
    deactivate: async (_opts?: DeactivateOptions) => { this.state = "deactivated" as ProgramState; return { success: true } },
    suspend: async () => ({ programId: this.id, state: this.state, timestamp: Date.now() }),
    resume: async (_state: SuspendedState) => { this.state = "active" as ProgramState; return { success: true } },
    destroy: async () => { this.state = "destroyed" as ProgramState },
  }
  async render(container: HTMLElement) {
    container.innerHTML = `<div class="p-6 overflow-y-auto h-full" style="background:var(--surface-base)"><h1 class="text-lg font-semibold" style="color:var(--text-primary)">Monitoring</h1><p class="text-xs mt-1 mb-4" style="color:var(--text-tertiary)">System and meter health monitoring</p>
      <div class="grid grid-cols-4 gap-3 mb-4">${[["API Gateway","operational","var(--status-success)"],["Database","operational","var(--status-success)"],["Redis Cache","operational","var(--status-success)"],["WebSocket","degraded","var(--status-warning)"]].map(([name,status,color])=>`
        <div class="rounded-xl border p-4" style="background:var(--surface-raised);border-color:var(--border-default)"><div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full" style="background:${color}"></span><span class="text-xs font-medium" style="color:var(--text-primary)">${name}</span></div><div class="text-[10px] mt-1" style="color:${color}">${status}</div></div>
      `).join("")}</div>
      <div class="rounded-xl border p-4" style="background:var(--surface-raised);border-color:var(--border-default)"><h2 class="text-sm font-semibold mb-3" style="color:var(--text-primary)">System Health</h2><div class="space-y-2">${[["CPU","23%"],["Memory","6.2 GB"],["Requests/min","1,247"],["Error Rate","0.02%"]].map(([k,v])=>`<div class="flex items-center justify-between py-1.5 border-b text-xs" style="border-color:var(--border-default)"><span style="color:var(--text-secondary)">${k}</span><span class="font-medium" style="color:var(--text-primary)">${v}</span></div>`).join("")}</div></div></div>`
  }
}
