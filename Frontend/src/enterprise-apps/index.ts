// Enterprise Applications — Phase 17H
// Business applications on top of the MeterVerse platform

import { customersRegistration } from "./customers/customers-app"
import { MetersApp } from "./meters/meters-app"
import { BillingApp } from "./billing/billing-app"
import { ReadingsApp } from "./readings/readings-app"
import { PaymentsApp } from "./payments/payments-app"
import { ReportsApp } from "./reports/reports-app"
import { MonitoringApp } from "./monitoring/monitoring-app"
import { AdminApp } from "./administration/admin-app"
import type { ProgramRegistration, ProgramHost } from "@/runtime/contracts/program"
import { RegistryManagerImpl } from "@/registry/registries/registry-manager"
import { getWorkflowEngine } from "@/workflow/workflow-init"

export function registerAllApplications(registry: RegistryManagerImpl): void {
  const apps: { id: string; title: string; category: string; permissions: string[]; create: (host: ProgramHost) => import("@/runtime/contracts/program").ProgramContract }[] = [
    { id: "customers", title: "Customers", category: "crm", permissions: ["customers:read"], create: (h) => new (require("./customers/customers-app").CustomersApp)(h) },
    { id: "meters", title: "Meters", category: "meters", permissions: ["meters:read"], create: (h) => new MetersApp(h) },
    { id: "invoices", title: "Billing", category: "billing", permissions: ["invoices:generate"], create: (h) => new BillingApp(h) },
    { id: "readings", title: "Readings", category: "readings", permissions: ["readings:create"], create: (h) => new ReadingsApp(h) },
    { id: "payments", title: "Payments", category: "billing", permissions: ["payments:process"], create: (h) => new PaymentsApp(h) },
    { id: "reports", title: "Reports", category: "reports", permissions: ["reports:export"], create: (h) => new ReportsApp(h) },
    { id: "monitoring", title: "Monitoring", category: "monitoring", permissions: [], create: (h) => new MonitoringApp(h) },
    { id: "admin", title: "Administration", category: "admin", permissions: ["admin:settings"], create: (h) => new AdminApp(h) },
  ]

  for (const app of apps) {
    registry.programs.register({
      id: app.id, name: app.title, category: app.category, enabled: true,
      metadata: {
        id: app.id, title: app.title, version: "1.0.0", description: `${app.title} management`,
        category: app.category, supportsSplitView: true, supportsPopout: false,
        supportsMinimize: true, supportsMultiple: false, estimatedMemory: 1024,
        requiredPermissions: app.permissions, canSuspend: true, canDestroy: true,
        preserveScroll: true, preserveState: true,
      },
      create: app.create,
    })
  }
}

export function registerApplicationCommands(registry: RegistryManagerImpl): void {
  const apps = ["customers", "meters", "invoices", "readings", "payments", "reports", "monitoring", "admin"]
  const labels: Record<string, string> = {
    customers: "Customers", meters: "Meters", invoices: "Billing", readings: "Readings",
    payments: "Payments", reports: "Reports", monitoring: "Monitoring", admin: "Administration",
  }

  for (const appId of apps) {
    registry.commands.register({
      id: `command:open:${appId}`,
      name: `Open ${labels[appId]}`,
      description: `Open the ${labels[appId]} application`,
      category: "navigation",
      execute: async () => {
        const { getRuntime } = await import("@/runtime/providers/runtime-provider")
        const runtime = getRuntime()
        await runtime.navigation.openProgram(appId)
        return { success: true }
      },
      keywords: [appId, labels[appId].toLowerCase()],
      group: "navigation",
      priority: 80,
    })
  }
}

export { CustomersApp } from "./customers/customers-app"
export { MetersApp } from "./meters/meters-app"
export { BillingApp } from "./billing/billing-app"
export { ReadingsApp } from "./readings/readings-app"
export { PaymentsApp } from "./payments/payments-app"
export { ReportsApp } from "./reports/reports-app"
export { MonitoringApp } from "./monitoring/monitoring-app"
export { AdminApp } from "./administration/admin-app"

