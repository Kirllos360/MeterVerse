import { AIBase } from "../shared/ai-base"

export interface CopilotSuggestion {
  id: string
  title: string
  description: string
  context: string
  action: { label: string; actionId: string }
  confidence: number
}

export class ContextCopilot extends AIBase {
  getSuggestions(): CopilotSuggestion[] {
    const context = this.getCurrentContext()
    const programId = context.workspaceContext.activeProgramId
    const suggestions: CopilotSuggestion[] = []

    if (programId === "customers") {
      suggestions.push({
        id: `copilot_${Date.now()}`, title: "Add New Customer",
        description: "Create a new customer record",
        context: "customers", confidence: 0.95,
        action: { label: "Add Customer", actionId: `copilot_action_${Date.now()}` },
      })
      suggestions.push({
        id: `copilot_${Date.now() + 1}`, title: "Import Customers",
        description: "Bulk import customers from CSV",
        context: "customers", confidence: 0.85,
        action: { label: "Import", actionId: `copilot_action_${Date.now() + 1}` },
      })
    }

    if (programId === "meters") {
      suggestions.push({
        id: `copilot_${Date.now() + 2}`, title: "Register New Meter",
        description: "Add a new meter to inventory",
        context: "meters", confidence: 0.95,
        action: { label: "Add Meter", actionId: `copilot_action_${Date.now() + 2}` },
      })
    }

    if (programId === "invoices") {
      suggestions.push({
        id: `copilot_${Date.now() + 3}`, title: "Generate Invoice",
        description: "Generate invoices for current billing period",
        context: "invoices", confidence: 0.92,
        action: { label: "Generate", actionId: `copilot_action_${Date.now() + 3}` },
      })
      suggestions.push({
        id: `copilot_${Date.now() + 4}`, title: "Check Overdue",
        description: "View overdue invoices requiring attention",
        context: "invoices", confidence: 0.88,
        action: { label: "View Overdue", actionId: `copilot_action_${Date.now() + 4}` },
      })
    }

    suggestions.push({
      id: `copilot_${Date.now() + 5}`, title: "Ask AI Assistant",
      description: "Get answers about your energy data",
      context: "global", confidence: 0.90,
      action: { label: "Ask AI", actionId: `copilot_action_${Date.now() + 5}` },
    })

    return suggestions
  }
}
