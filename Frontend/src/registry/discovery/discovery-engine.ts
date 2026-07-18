export interface DiscoveredItem {
  id: string
  type: "program" | "entity" | "command" | "action" | "widget" | "panel" | "permission" | "theme" | "plugin" | "route" | "contextMenu"
  path: string
  name: string
  category?: string
  lazy: boolean
}

export interface DiscoveryEngine {
  discoverAll(): Promise<DiscoveredItem[]>
  discoverPrograms(): Promise<DiscoveredItem[]>
  discoverCommands(): Promise<DiscoveredItem[]>
  discoverActions(): Promise<DiscoveredItem[]>
  discoverPanels(): Promise<DiscoveredItem[]>
  discoverWidgets(): Promise<DiscoveredItem[]>
  discoverThemes(): Promise<DiscoveredItem[]>
}

export class DiscoveryEngineImpl implements DiscoveryEngine {
  async discoverAll(): Promise<DiscoveredItem[]> {
    const results = await Promise.all([
      this.discoverPrograms(),
      this.discoverCommands(),
      this.discoverActions(),
      this.discoverPanels(),
      this.discoverWidgets(),
      this.discoverThemes(),
    ])
    return results.flat()
  }

  async discoverPrograms(): Promise<DiscoveredItem[]> {
    return [
      { id: "welcome", type: "program", path: "programs/welcome", name: "Welcome", category: "executive", lazy: false },
      { id: "customers", type: "program", path: "programs/customers", name: "Customers", category: "crm", lazy: true },
      { id: "meters", type: "program", path: "programs/meters", name: "Meters", category: "meters", lazy: true },
      { id: "readings", type: "program", path: "programs/readings", name: "Readings", category: "readings", lazy: true },
      { id: "invoices", type: "program", path: "programs/invoices", name: "Invoices", category: "billing", lazy: true },
      { id: "payments", type: "program", path: "programs/payments", name: "Payments", category: "billing", lazy: true },
      { id: "reports", type: "program", path: "programs/reports", name: "Reports", category: "reports", lazy: true },
      { id: "dashboard", type: "program", path: "programs/dashboard", name: "Dashboard", category: "executive", lazy: false },
    ]
  }

  async discoverCommands(): Promise<DiscoveredItem[]> {
    return [
      { id: "command:openPalette", type: "command", path: "commands/palette", name: "Open Command Palette", category: "system", lazy: false },
      { id: "command:openProgram", type: "command", path: "commands/open-program", name: "Open Program", category: "navigation", lazy: false },
      { id: "command:quickSearch", type: "command", path: "commands/search", name: "Quick Search", category: "search", lazy: false },
    ]
  }

  async discoverActions(): Promise<DiscoveredItem[]> {
    const programs = await this.discoverPrograms()
    return programs.filter((p) => p.id !== "welcome").map((p) => ({
      id: `action:${p.id}:create`,
      type: "action" as const,
      path: `actions/${p.id}`,
      name: `New ${p.name}`,
      category: p.category,
      lazy: true,
    }))
  }

  async discoverPanels(): Promise<DiscoveredItem[]> {
    return [
      { id: "panel:meter:properties", type: "panel", path: "panels/meter/properties", name: "Meter Properties", category: "meter", lazy: true },
      { id: "panel:customer:details", type: "panel", path: "panels/customer/details", name: "Customer Details", category: "customer", lazy: true },
      { id: "panel:invoice:details", type: "panel", path: "panels/invoice/details", name: "Invoice Details", category: "invoice", lazy: true },
    ]
  }

  async discoverWidgets(): Promise<DiscoveredItem[]> {
    return [
      { id: "widget:kpiSummary", type: "widget", path: "widgets/kpi-summary", name: "KPI Summary", category: "metrics", lazy: true },
      { id: "widget:energyChart", type: "widget", path: "widgets/energy-chart", name: "Energy Chart", category: "charts", lazy: true },
      { id: "widget:alertFeed", type: "widget", path: "widgets/alert-feed", name: "Alert Feed", category: "monitoring", lazy: true },
    ]
  }

  async discoverThemes(): Promise<DiscoveredItem[]> {
    return [
      { id: "vercel", type: "theme", path: "themes/vercel", name: "Vercel", category: "theme", lazy: false },
      { id: "claude", type: "theme", path: "themes/claude", name: "Claude", category: "theme", lazy: false },
      { id: "whatsapp", type: "theme", path: "themes/whatsapp", name: "WhatsApp", category: "theme", lazy: false },
      { id: "mono", type: "theme", path: "themes/mono", name: "Mono", category: "theme", lazy: false },
    ]
  }
}
