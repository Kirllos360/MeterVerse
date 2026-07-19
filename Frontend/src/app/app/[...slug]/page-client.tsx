"use client"

import { useEffect, useState } from "react"
import { useAppRegistry } from "@/app-framework/registry/application-registry"
import { seedApps } from "@/app-framework/registry/seed-apps"
import { PageShell } from "@/components/enterprise/PageShell"

const entityColumns = {
  customers: [
    { id: "name", label: "Name", sortable: true },
    { id: "email", label: "Email", sortable: true },
    { id: "phone", label: "Phone" },
    { id: "status", label: "Status", sortable: true },
  ],
  meters: [
    { id: "serial", label: "Serial", sortable: true },
    { id: "type", label: "Type", sortable: true },
    { id: "status", label: "Status", sortable: true },
    { id: "location", label: "Location" },
  ],
  invoices: [
    { id: "number", label: "Number", sortable: true },
    { id: "amount", label: "Amount", sortable: true },
    { id: "status", label: "Status", sortable: true },
    { id: "date", label: "Date", sortable: true },
  ],
  readings: [
    { id: "meter", label: "Meter", sortable: true },
    { id: "value", label: "Value", sortable: true },
    { id: "date", label: "Date", sortable: true },
    { id: "status", label: "Status", sortable: true },
  ],
  payments: [
    { id: "method", label: "Method", sortable: true },
    { id: "amount", label: "Amount", sortable: true },
    { id: "date", label: "Date", sortable: true },
    { id: "status", label: "Status", sortable: true },
  ],
}

const entityIcons: Record<string, string> = {
  customers: "customers", meters: "meters", invoices: "invoices",
  readings: "readings", payments: "payments",
}

export default function AppPageClient({ slug }: { slug?: string[] }) {
  const { registerMany, get } = useAppRegistry()
  const [notif, setNotif] = useState<string | null>(null)

  useEffect(() => { registerMany(seedApps) }, [])

  const route = slug ? `/${slug.join("/")}` : ""
  const appId = slug?.[0] ?? ""
  const app = get(appId) ?? seedApps.find((a) => a.route === `/app/${slug?.join("/")}`)

  const showAdd = ["customers", "meters", "invoices", "readings", "payments", "settings", "admin", "security", "reports"].includes(appId)
  const columns = entityColumns[appId as keyof typeof entityColumns] || [
    { id: "name", label: "Name", sortable: true },
    { id: "status", label: "Status", sortable: true },
  ]

  const handleAdd = () => {
    setNotif(`New ${app?.title || "item"} dialog would open here`)
    setTimeout(() => setNotif(null), 3000)
  }

  if (!app) {
    return (
      <PageShell title="Not Found" description="Application not found" icon="dashboard">
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>The application was not found.</p>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={app.title}
      description={app.description}
      icon={entityIcons[appId] || "dashboard"}
      addLabel={showAdd ? `+ New ${app.title}` : undefined}
      onAdd={showAdd ? handleAdd : undefined}
      columns={columns}
      searchPlaceholder={`Search ${app.title.toLowerCase()}...`}
    >
      {/* Empty state table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-default)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "var(--surface-tableHeader)" }}>
              {columns.map((col) => (
                <th key={col.id} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-default)" }}>
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6l4-4 4 4M8 18l4 4 4-4"/></svg>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
                <div className="flex flex-col items-center gap-2">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M8 2v20M16 2v20M2 8h20M2 16h20"/></svg>
                  <span>No {app.title.toLowerCase()} yet</span>
                  {showAdd && (
                    <button onClick={handleAdd} className="px-3 py-2 rounded-lg text-xs font-medium text-white mt-2" style={{ backgroundColor: "var(--brand-primary)" }}>
                      + Add your first {app.title.toLowerCase()}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Toast notification */}
      {notif && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-xs text-white z-50 animate-in slide-in-from-right"
          style={{ backgroundColor: "var(--sidebar-background)" }}>
          {notif}
        </div>
      )}
    </PageShell>
  )
}
