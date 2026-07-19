import type { LayoutTemplate, WorkspaceLayout } from "../contracts/workspace"

export const BUILTIN_TEMPLATES: LayoutTemplate[] = [
  {
    id: "single-focus",
    name: "Single Focus",
    description: "One program at a time, full workspace",
    icon: "maximize",
    category: "productivity",
    isDefault: true,
    isBuiltin: true,
    layout: {
      id: "single-focus", name: "Single Focus", type: "single",
      columns: 1, rows: 1, splits: [], windows: [],
      dock: { mode: "dock", pinnedItems: [], recentItems: [], expandedCategories: [] },
      inspector: { isOpen: false, width: 360, activeSection: "details" },
    },
  },
  {
    id: "split-comparison",
    name: "Split Comparison",
    description: "Two programs side by side",
    icon: "columns",
    category: "productivity",
    isDefault: false,
    isBuiltin: true,
    layout: {
      id: "split-comparison", name: "Split Comparison", type: "split",
      columns: 2, rows: 1,
      splits: [{ direction: "vertical", panels: [], dividers: [{ index: 0, position: 50 }] }],
      windows: [],
      dock: { mode: "dock", pinnedItems: [], recentItems: [], expandedCategories: [] },
      inspector: { isOpen: true, width: 360, activeSection: "details" },
    },
  },
  {
    id: "monitoring-grid",
    name: "Monitoring Grid",
    description: "4-up grid for live monitoring",
    icon: "grid",
    category: "monitoring",
    isDefault: false,
    isBuiltin: true,
    layout: {
      id: "monitoring-grid", name: "Monitoring Grid", type: "grid",
      columns: 2, rows: 2, splits: [], windows: [],
      dock: { mode: "auto-hide", pinnedItems: [], recentItems: [], expandedCategories: [] },
      inspector: { isOpen: false, width: 360, activeSection: "details" },
    },
  },
  {
    id: "billing-workflow",
    name: "Billing Workflow",
    description: "Invoices + Payments + Reports",
    icon: "receipt",
    category: "billing",
    isDefault: false,
    isBuiltin: true,
    layout: {
      id: "billing-workflow", name: "Billing Workflow", type: "grid",
      columns: 3, rows: 1, splits: [], windows: [],
      dock: { mode: "collapsed", pinnedItems: ["invoices", "payments", "reports"], recentItems: [], expandedCategories: [] },
      inspector: { isOpen: true, width: 360, activeSection: "details" },
    },
  },
]

export class LayoutManager {
  private _currentTemplate: string = "single-focus"
  private _savedLayouts: Map<string, WorkspaceLayout> = new Map()

  get current() { return this._currentTemplate }
  get templates() { return BUILTIN_TEMPLATES }

  applyTemplate(templateId: string): WorkspaceLayout | undefined {
    const template = BUILTIN_TEMPLATES.find((t) => t.id === templateId)
    if (!template) return undefined
    this._currentTemplate = templateId
    return { ...template.layout, id: `${template.id}_${Date.now()}` }
  }

  saveLayout(name: string, layout: WorkspaceLayout): string {
    const id = `saved_${Date.now()}`
    this._savedLayouts.set(id, { ...layout, name, id })
    this.persistSavedLayouts()
    return id
  }

  loadLayout(id: string): WorkspaceLayout | undefined {
    return this._savedLayouts.get(id)
  }

  deleteLayout(id: string): void {
    this._savedLayouts.delete(id)
    this.persistSavedLayouts()
  }

  getSavedLayouts(): WorkspaceLayout[] {
    return Array.from(this._savedLayouts.values())
  }

  private persistSavedLayouts(): void {
    try {
      localStorage.setItem("mv:savedLayouts", JSON.stringify(Array.from(this._savedLayouts.entries())))
    } catch {}
  }

  loadSavedLayouts(): void {
    try {
      const raw = localStorage.getItem("mv:savedLayouts")
      if (raw) this._savedLayouts = new Map(JSON.parse(raw))
    } catch {}
  }
}
