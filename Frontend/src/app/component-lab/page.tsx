"use client"

import { useState } from "react"

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
  { id: "role", header: "Role", accessor: (r) => <span className="px-2 py-0.5 text-[11px] rounded-full bg-[rgba(0,191,165,0.1)] text-[#00BFA5]">{r.role}</span>, sortable: true, width: 120 },
  { id: "status", header: "Status", accessor: (r) => <span style={{ color: r.status === "Active" ? "#059669" : "#9CA3AF" }}>{r.status}</span>, width: 100 },
]

const formFields: FieldDef[] = [
  { id: "name", label: "Full Name", type: "text", required: true, width: "full" },
  { id: "email", label: "Email", type: "email", required: true, width: "half" },
  { id: "role", label: "Role", type: "select", options: [{ label: "Admin", value: "admin" }, { label: "Manager", value: "manager" }, { label: "Operator", value: "operator" }], width: "half" },
]

export default function ComponentLabPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formVals, setFormVals] = useState<Record<string, unknown>>({})

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--surface-base, #FAFAFA)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <h1 className="text-xl font-semibold mb-6" style={{ color: "var(--text-primary, #0A0A0A)" }}>Component Lab</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary, #737373)" }}>Enterprise Component Library — Interactive Showcase</p>

        {/* DataTable */}
        <Section title="DataTable Runtime">
                  </Section>

        {/* Forms */}
        <Section title="Forms Runtime">
          <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--surface-raised, #FFFFFF)", borderColor: "var(--border-default, #E5E5E5)" }}>
                      </div>
        </Section>

        {/* Charts */}
        <Section title="Charts Runtime">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--surface-raised, #FFFFFF)", borderColor: "var(--border-default, #E5E5E5)" }}>
              <p className="text-xs mb-2" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>Line Chart</p>
                          </div>
            <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--surface-raised, #FFFFFF)", borderColor: "var(--border-default, #E5E5E5)" }}>
              <p className="text-xs mb-2" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>Pie Chart</p>
                          </div>
          </div>
        </Section>

        {/* Widgets */}
        <Section title="Widgets Runtime">
          <div className="grid grid-cols-4 gap-3">
            <Widget label="Total Revenue" value="$284K" variant="kpi" trend="up" trendValue="12%" />
            <Widget label="Active Meters" value="1,234" variant="counter" />
            <Widget label="Collection Rate" value={92} variant="progress" progress={92} />
            <Widget label="System Health" status="active" variant="health" value="Healthy" />
          </div>
        </Section>

        {/* Dialogs */}
        <Section title="Dialogs">
          <button onClick={() => setDialogOpen(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#00BFA5" }}>
            Open Dialog
          </button>
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Sample Dialog"
            footer={<><button onClick={() => setDialogOpen(false)} className="px-4 py-1.5 rounded-lg text-sm">Cancel</button></>}
          >
            <p className="text-sm" style={{ color: "var(--text-secondary, #737373)" }}>Dialog content with Framer Motion spring animation.</p>
          </Dialog>
        </Section>

        {/* Loading States */}
        <Section title="Loading States">
          <div className="grid grid-cols-4 gap-3">
            <SkeletonLines />
            <LoadingScreen message="Loading data..." />
            <EmptyState message="No records found" />
            <ErrorState message="Failed to load" onRetry={() => {}} />
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary, #737373)" }}>{title}</h2>
      {children}
    </div>
  )
}

