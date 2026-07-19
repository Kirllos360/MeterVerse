import { BaseApp } from "../shared/app-base"
import type { ProgramHost, ProgramMetadata, ActivateOptions, DeactivateOptions, SuspendedState, MountContext, ProgramConfig, ProgramLifecycle } from "@/runtime/contracts/program"
export class BillingApp extends BaseApp {
  readonly id = "invoices"
  readonly metadata: ProgramMetadata = this.getDefaultMetadata({ title: "Billing", category: "billing", description: "Invoice and billing management", requiredPermissions: ["invoices:generate"] })
  lifecycle: ProgramLifecycle = {
    mount: async (ctx: MountContext) => { this.state = "mounted" as ProgramState; return { success: true } },
    initialize: async (_config: ProgramConfig) => { this.state = "initialized" as ProgramState; return { success: true } },
    activate: async (_opts?: ActivateOptions) => { this.state = "active" as ProgramState; this.host.setTitle("Billing"); return { success: true } },
    deactivate: async (_opts?: DeactivateOptions) => { this.state = "deactivated" as ProgramState; return { success: true } },
    suspend: async () => ({ programId: this.id, state: this.state, timestamp: Date.now() }),
    resume: async (_state: SuspendedState) => { this.state = "active" as ProgramState; return { success: true } },
    destroy: async () => { this.state = "destroyed" as ProgramState },
  }
  async render(container: HTMLElement) {
    container.innerHTML = `<div class="p-6 overflow-y-auto h-full" style="background:var(--surface-base)"><h1 class="text-lg font-semibold" style="color:var(--text-primary)">Billing</h1><p class="text-xs mt-1 mb-4" style="color:var(--text-tertiary)">Invoice and payment management</p>
      <div class="grid grid-cols-4 gap-3 mb-4">${["Total Invoiced","Collected","Outstanding","Overdue"].map((n,i)=>`<div class="rounded-xl border p-4" style="background:var(--surface-raised);border-color:var(--border-default)"><div class="text-[11px]" style="color:var(--text-tertiary)">${n}</div><div class="text-xl font-bold mt-1" style="color:${["var(--text-primary)","var(--status-success)","var(--status-warning)","var(--status-error)"][i]}">0</div></div>`).join("")}</div>
      <div class="rounded-xl border overflow-hidden" style="border-color:var(--border-default)"><table class="w-full"><thead><tr style="background:var(--surface-tableHeader)"><th class="px-4 py-3 text-left text-xs font-medium" style="color:var(--text-secondary)">Invoice</th><th class="px-4 py-3 text-left text-xs font-medium" style="color:var(--text-secondary)">Amount</th><th class="px-4 py-3 text-left text-xs font-medium" style="color:var(--text-secondary)">Status</th><th class="px-4 py-3 text-left text-xs font-medium" style="color:var(--text-secondary)">Date</th></tr></thead><tbody><tr><td colspan="4" class="px-4 py-12 text-center text-sm" style="color:var(--text-tertiary)"><span>No invoices yet</span></td></tr></tbody></table></div></div>`
  }
}
