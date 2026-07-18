import { useEntityRuntime, type EntityMeta } from "../entity/EntityRuntime"
import { useActionRuntime, type BusinessAction } from "../action/ActionRuntime"
import { useWidgetRuntime } from "@/runtime/ui/widgets/WidgetRuntime"
import { useCommandRuntime } from "@/runtime/command/command-runtime"
import { useWorkflowRuntime, type WorkflowStep } from "../workflow/WorkflowRuntime"
import { useBusinessMetadata, type BusinessEntityMeta } from "../metadata/BusinessMetadata"

export const SDK = {
  // Register a complete business entity
  registerEntity: (meta: EntityMeta) => {
    useEntityRuntime.getState().register(meta)
    return SDK
  },

  // Register business actions
  registerAction: (action: BusinessAction) => {
    useActionRuntime.getState().register(action)
    return SDK
  },

  // Register dashboard widgets
  registerWidget: (widget: { id: string; title: string; category: "kpi" | "metric" | "chart" | "status"; size: "sm" | "md" | "lg" }) => {
    useWidgetRuntime.getState().register({ ...widget, icon: "", permissions: [], refreshInterval: 0, lazy: false })
    return SDK
  },

  // Register command palette commands
  registerCommand: (cmd: { id: string; label: string; icon?: string; category?: "navigation" | "action" | "settings" | "app"; action: () => void }) => {
    useCommandRuntime.getState().registerAction({
      id: cmd.id,
      label: cmd.label,
      icon: cmd.icon,
      category: cmd.category || "action",
      action: cmd.action,
    })
    return SDK
  },

  // Register workflow steps
  registerWorkflow: (steps: WorkflowStep[]) => {
    useWorkflowRuntime.getState().registerDefinitions(steps)
    return SDK
  },

  // Register business metadata
  registerMetadata: (meta: BusinessEntityMeta) => {
    useBusinessMetadata.getState().register(meta)
    return SDK
  },

  // Bulk register an entire application module
  registerModule: (config: {
    entity: EntityMeta
    actions: BusinessAction[]
    widgets?: { id: string; title: string; category: "kpi" | "metric" | "chart" | "status"; size: "sm" | "md" | "lg" }[]
    commands?: { id: string; label: string; action: () => void }[]
    workflows?: WorkflowStep[]
    metadata?: BusinessEntityMeta
  }) => {
    SDK.registerEntity(config.entity)
    config.actions.forEach((a) => SDK.registerAction(a))
    config.widgets?.forEach((w) => SDK.registerWidget(w))
    config.commands?.forEach((c) => SDK.registerCommand(c))
    if (config.workflows) SDK.registerWorkflow(config.workflows)
    if (config.metadata) SDK.registerMetadata(config.metadata)
    return SDK
  },
}
