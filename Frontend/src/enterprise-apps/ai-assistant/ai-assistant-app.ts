import { BaseApp } from "../shared/app-base"
import type { ProgramHost, ProgramMetadata, ActivateOptions, DeactivateOptions, SuspendedState, MountContext, ProgramConfig, ProgramLifecycle } from "@/runtime/contracts/program"
export class AIAssistantApp extends BaseApp {
  readonly id = "ai-assistant"
  readonly metadata: ProgramMetadata = this.getDefaultMetadata({ title: "AI Assistant", category: "ai", description: "AI-powered insights and assistance" })
  lifecycle: ProgramLifecycle = {
    mount: async (ctx: MountContext) => { this.state = "mounted" as ProgramState; return { success: true } },
    initialize: async (_config: ProgramConfig) => { this.state = "initialized" as ProgramState; return { success: true } },
    activate: async (_opts?: ActivateOptions) => { this.state = "active" as ProgramState; this.host.setTitle("AI Assistant"); return { success: true } },
    deactivate: async (_opts?: DeactivateOptions) => { this.state = "deactivated" as ProgramState; return { success: true } },
    suspend: async () => ({ programId: this.id, state: this.state, timestamp: Date.now() }),
    resume: async (_state: SuspendedState) => { this.state = "active" as ProgramState; return { success: true } },
    destroy: async () => { this.state = "destroyed" as ProgramState },
  }
  async render(container: HTMLElement) {
    container.innerHTML = `<div class="p-6 overflow-y-auto h-full flex flex-col" style="background:var(--surface-base)">
      <h1 class="text-lg font-semibold" style="color:var(--text-primary)">AI Assistant</h1>
      <p class="text-xs mt-1 mb-4" style="color:var(--text-tertiary)">Ask questions about your energy data</p>
      <div class="flex-1 rounded-xl border mb-4 p-6 flex items-center justify-center" style="background:var(--surface-raised);border-color:var(--border-default)">
        <div class="text-center"><span class="text-3xl">🤖</span><p class="text-sm mt-2" style="color:var(--text-secondary)">How can I help you today?</p><p class="text-xs mt-1" style="color:var(--text-tertiary)">Ask about consumption, billing, meters, or anomalies</p></div>
      </div>
      <div class="flex items-center gap-2"><input placeholder="Ask anything..." class="flex-1 px-3 py-2 rounded-xl border text-sm outline-none focus:border-[var(--brand)] transition-colors" style="background:var(--surface-sunken);border-color:var(--border-default);color:var(--text-primary)"><button class="px-3 py-2 rounded-xl text-sm font-medium text-white" style="background:var(--brand)">Send</button></div>
    </div>`
  }
}

