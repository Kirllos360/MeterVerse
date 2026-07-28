"use client"

import { useAdminStore } from "@/stores/admin-store"

const PAGE_LABELS: Record<string, string> = {
  home: "Home", monitoring: "Monitoring", "connection-settings": "Connection",
  "database-management": "Database Management", "migration-uploads": "Migration & Uploads",
  "location-settings": "Location", "users-permissions": "Users & Permissions",
  "customer-settings": "Customer", "meter-settings": "Meter", readings: "Readings",
  "tariff-settings": "Tariff", "bill-cycle-settings": "Billing Cycles", invoices: "Invoices",
  "payment-settings": "Payment", settings: "General Settings", audit: "Audit Log",
  "report-settings": "Reports",
}

export function Breadcrumbs() {
  const { activePage, location } = useAdminStore()
  const pageLabel = PAGE_LABELS[activePage] || activePage

  return (
    <nav className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
      <span style={{ color: "var(--text-secondary)" }}>Admin</span>
      {location.selectedArea && (
        <>
          <Chevron />
          <span style={{ color: "var(--text-secondary)" }}>{location.selectedArea}</span>
        </>
      )}
      {location.selectedProject && (
        <>
          <Chevron />
          <span style={{ color: "var(--text-secondary)" }}>{location.selectedProject.name}</span>
        </>
      )}
      <Chevron />
      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{pageLabel}</span>
    </nav>
  )
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
