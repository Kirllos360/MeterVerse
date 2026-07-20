import { BaseApp } from "../shared/app-base"
import type { ProgramHost, ProgramMetadata, ProgramConfig, ProgramState, ActivateOptions, DeactivateOptions, SuspendedState, MountContext, ProgramLifecycle } from "@/runtime/contracts/program"

export class AdminApp extends BaseApp {
  readonly id = "admin"
  readonly metadata: ProgramMetadata = this.getDefaultMetadata({
    title: "Administration", category: "admin", description: "System administration",
    requiredPermissions: ["admin:settings"],
  })
  lifecycle: ProgramLifecycle = {
    mount: async (ctx: MountContext) => { this.state = "mounted" as ProgramState; return { success: true } },
    initialize: async (_config: ProgramConfig) => { this.state = "initialized" as ProgramState; return { success: true } },
    activate: async (_opts?: ActivateOptions) => { this.state = "active" as ProgramState; this.host.setTitle("Administration"); return { success: true } },
    deactivate: async (_opts?: DeactivateOptions) => { this.state = "deactivated" as ProgramState; return { success: true } },
    suspend: async () => ({ programId: this.id, state: this.state, timestamp: Date.now() }),
    resume: async (_state: SuspendedState) => { this.state = "active" as ProgramState; return { success: true } },
    destroy: async () => { this.state = "destroyed" as ProgramState },
  }

  async render(container: HTMLElement) {
    container.innerHTML = `<div class="p-6 overflow-y-auto h-full" style="background:var(--surface-base)">
      <h1 class="text-lg font-semibold" style="color:var(--text-primary)">Administration</h1>
      <p class="text-xs mt-1 mb-6" style="color:var(--text-tertiary)">System administration and configuration</p>
      <div class="grid grid-cols-3 gap-3">
        ${["Users", "Roles & Permissions", "System Settings", "Audit Logs", "Backup", "Integrations"].map((name) => `
          <div class="rounded-xl border p-4 cursor-pointer hover:shadow-md transition-shadow" style="background:var(--surface-raised);border-color:var(--border-default)">
            <div class="text-sm font-medium" style="color:var(--text-primary)">${name}</div>
            <div class="text-xs mt-1" style="color:var(--text-tertiary)">Manage ${name.toLowerCase()}</div>
          </div>
        `).join("")}
      </div>
    </div>`
  }
}
