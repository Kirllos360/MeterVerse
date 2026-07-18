import { BaseApp } from "../shared/app-base"
import type { ProgramLifecycle, ProgramHost, ProgramMetadata, MountContext, ProgramConfig, ActivateOptions, DeactivateOptions, SuspendedState } from "@/runtime/contracts/program"
import { KPIWidget, KPIWidgetGrid } from "@/enterprise/kpi/KPIWidget"

export class CustomersApp extends BaseApp {
  readonly id = "customers"
  readonly metadata: ProgramMetadata = this.getDefaultMetadata({
    title: "Customers", category: "crm", description: "Customer management",
    requiredPermissions: ["customers:read"],
  })

  lifecycle: ProgramLifecycle = {
    mount: async (ctx: MountContext) => { this.state = "mounted" as ProgramState; return { success: true } },
    initialize: async (_config: ProgramConfig) => { this.state = "initialized" as ProgramState; return { success: true } },
    activate: async (_opts?: ActivateOptions) => {
      this.state = "active" as ProgramState
      this.host.setTitle("Customers")
      this.host.context.events.dispatch("runtime:program:activated", { programId: this.id })
      return { success: true }
    },
    deactivate: async (_opts?: DeactivateOptions) => { this.state = "deactivated" as ProgramState; return { success: true } },
    suspend: async () => ({ programId: this.id, state: this.state, timestamp: Date.now() }),
    resume: async (_state: SuspendedState) => { this.state = "active" as ProgramState; return { success: true } },
    destroy: async () => { this.state = "destroyed" as ProgramState },
  }

  async render(container: HTMLElement) {
    container.innerHTML = ""
    const root = document.createElement("div")
    root.className = "p-6 space-y-6 overflow-y-auto h-full"
    root.style.backgroundColor = "var(--surface-base, #FAFAFA)"
    root.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-semibold" style="color:var(--text-primary)">Customers</h1>
          <p class="text-xs mt-0.5" style="color:var(--text-tertiary)">Customer management</p>
        </div>
      </div>
      <div class="grid grid-cols-4 gap-3">
        <div class="rounded-xl border p-4" style="background:var(--surface-raised);border-color:var(--border-default)">
          <div class="text-[11px]" style="color:var(--text-tertiary)">Total Customers</div>
          <div class="text-xl font-bold mt-1" style="color:var(--text-primary)">0</div>
        </div>
        <div class="rounded-xl border p-4" style="background:var(--surface-raised);border-color:var(--border-default)">
          <div class="text-[11px]" style="color:var(--text-tertiary)">Active</div>
          <div class="text-xl font-bold mt-1" style="color:#059669">0</div>
        </div>
        <div class="rounded-xl border p-4" style="background:var(--surface-raised);border-color:var(--border-default)">
          <div class="text-[11px]" style="color:var(--text-tertiary)">Overdue Balance</div>
          <div class="text-xl font-bold mt-1" style="color:#DC2626">0</div>
        </div>
        <div class="rounded-xl border p-4" style="background:var(--surface-raised);border-color:var(--border-default)">
          <div class="text-[11px]" style="color:var(--text-tertiary)">New This Month</div>
          <div class="text-xl font-bold mt-1" style="color:var(--brand-primary)">0</div>
        </div>
      </div>
      <div class="rounded-xl border overflow-hidden" style="border-color:var(--border-default)">
        <table class="w-full">
          <thead><tr style="background:var(--surface-tableHeader,#F5F5F5)">
            <th class="px-4 py-3 text-left text-xs font-medium" style="color:var(--text-secondary)">Name</th>
            <th class="px-4 py-3 text-left text-xs font-medium" style="color:var(--text-secondary)">Email</th>
            <th class="px-4 py-3 text-left text-xs font-medium" style="color:var(--text-secondary)">Phone</th>
            <th class="px-4 py-3 text-left text-xs font-medium" style="color:var(--text-secondary)">Status</th>
          </tr></thead>
          <tbody>
            <tr><td colspan="4" class="px-4 py-12 text-center text-sm" style="color:var(--text-tertiary)">
              <div class="flex flex-col items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M8 2v20M16 2v20M2 8h20M2 16h20"/></svg>
                <span>No customers yet</span>
              </div>
            </td></tr>
          </tbody>
        </table>
      </div>
    `
    container.appendChild(root)
  }
}

export const customersRegistration = {
  id: "customers",
  metadata: new CustomersApp(null!).metadata,
  create: (host: ProgramHost) => new CustomersApp(host),
}
