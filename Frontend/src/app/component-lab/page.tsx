"use client"

import { useState, type ReactNode } from "react"

interface Column<T> { id: string; header: string; accessor: (r: T) => ReactNode; sortable?: boolean; width?: number }
interface FieldDef { id: string; label: string; type: string; required?: boolean; width?: string; options?: { label: string; value: string }[] }

interface DemoItem {
  id: number; name: string; email: string; role: string; status: string
}

const demoData: DemoItem[] = [
  { id: 1, name: "Ahmed Hassan", email: "ahmed@mv.com", role: "Admin", status: "Active" },
  { id: 2, name: "Mona Ibrahim", email: "mona@mv.com", role: "Manager", status: "Active" },
  { id: 3, name: "Youssef Ali", email: "youssef@mv.com", role: "Operator", status: "Active" },
  { id: 4, name: "Laila Omar", email: "laila@mv.com", role: "Viewer", status: "Inactive" },
  { id: 5, name: "Karim Nabil", email: "karim@mv.com", role: "Operator", status: "Active" },
]

const demoColumns: Column<DemoItem>[] = [
  { id: "name", header: "Name", accessor: (r) => r.name, sortable: true, width: 160 },
  { id: "email", header: "Email", accessor: (r) => r.email, sortable: true, width: 200 },
  { id: "role", header: "Role", accessor: (r) => <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: "rgba(var(--brand-primary-rgb), 0.1)", color: "var(--brand-primary)" }}>{r.role}</span>, width: 120 },
  { id: "status", header: "Status", accessor: (r) => <span style={{ color: r.status === "Active" ? "var(--status-success)" : "#9CA3AF" }}>{r.status}</span>, width: 100 },
]

const formFields: FieldDef[] = [
  { id: "name", label: "Full Name", type: "text", required: true, width: "full" },
  { id: "email", label: "Email", type: "email", required: true, width: "half" },
  { id: "role", label: "Role", type: "select", options: [{ label: "Admin", value: "admin" }, { label: "Manager", value: "manager" }, { label: "Operator", value: "operator" }], width: "half" },
]

export default function ComponentLabPage() {
  const [_formVals, _setFormVals] = useState<Record<string, unknown>>({})

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--surface-base)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <h1 className="text-xl font-semibold mb-6" style={{ color: "var(--text-primary)" }}>Component Lab</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>Enterprise Component Library — Interactive Showcase</p>

        {/* DataTable */}
        <Section title="DataTable Runtime">
          <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
            <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>Sample table with demo data</p>
          </div>
        </Section>

        {/* Forms */}
        <Section title="Forms Runtime">
          <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
            <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>Form fields showcase</p>
          </div>
        </Section>

        {/* Charts */}
        <Section title="Charts Runtime">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
              <p className="text-xs mb-2" style={{ color: "var(--text-tertiary)" }}>Line Chart</p>
              <div className="h-32 bg-black/5 rounded"></div>
            </div>
            <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
              <p className="text-xs mb-2" style={{ color: "var(--text-tertiary)" }}>Pie Chart</p>
              <div className="h-32 bg-black/5 rounded"></div>
            </div>
          </div>
        </Section>

        {/* Loading States */}
        <Section title="Loading States">
          <div className="grid grid-cols-4 gap-3">
            <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--surface-raised)", boxShadow: "var(--shadow-sm)" }}>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Skeleton loading placeholder</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--surface-raised)", boxShadow: "var(--shadow-sm)" }}>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Loading state placeholder</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--surface-raised)", boxShadow: "var(--shadow-sm)" }}>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Empty state placeholder</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--surface-raised)", boxShadow: "var(--shadow-sm)" }}>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Error state placeholder</p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>{title}</h2>
      {children}
    </div>
  )
}
