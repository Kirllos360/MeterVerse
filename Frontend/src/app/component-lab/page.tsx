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
  { id: "role", header: "Role", accessor: (r) => <span className="px-2 py-0.5 text-[11px] rounded-full" style={{ backgroundColor: "rgba(var(--brand-primary-rgb), 0.1)", color: "var(--brand-primary)" }}>{r.role}</span>, width: 140 },
  { id: "status", header: "Status", accessor: (r) => <span style={{ color: r.status === "Active" ? "var(--status-success)" : "#9CA3AF" }}>{r.status}</span>, width: 100 },
]

const formFields: FieldDef[] = [
  { id: "name", label: "Full Name", type: "text", required: true, width: "full" },
  { id: "email", label: "Email", type: "email", required: true, width: "half" },
  { id: "role", label: "Role", type: "select", options: [{ label: "Admin", value: "admin" }, { label: "Manager", value: "manager" }, { label: "Operator", value: "operator" }], width: "half" },
]

export default function ComponentLabPage() {
  const [_dialogOpen, setDialogOpen] = useState(false)
  const [_formVals, setFormVals] = useState<Record<string, unknown>>({})

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--surface-base)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <h1 className="text-xl font-semibold mb-6" style={{ color: "var(--text-primary)" }}>Component Lab</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>Enterprise Component Library — Interactive Showcase</p>

        {/* DataTable */}
        <Section title="DataTable Runtime">
          <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
            <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>Interactive data table with sorting and filtering</p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                    {demoColumns.map(col => (
                      <th key={col.id} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", width: col.width }}>
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {demoData.map(row => (
                    <tr key={row.id} style={{ borderBottom: "1px solid var(--border-default)" }}>
                      {demoColumns.map(col => (
                        <td key={`${row.id}-${col.id}`} style={{ padding: "8px 12px", color: "var(--text-primary)" }}>
                          {col.accessor(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* Forms */}
        <Section title="Forms Runtime">
          <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
            <form style={{ display: "grid", gap: "16px" }}>
              {formFields.map(field => (
                <div key={field.id}>
                  <label htmlFor={field.id} style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
                    {field.label}
                    {field.required && <span style={{ color: "var(--status-error)" }}>*</span>}
                  </label>
                  {field.type === "select" ? (
                    <select
                      id={field.id}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-default)",
                        backgroundColor: "var(--surface-base)",
                        color: "var(--text-primary)",
                        fontSize: "14px"
                      }}
                      onChange={(e) => setFormVals({ ...formFields, [field.id]: e.target.value })}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={field.id}
                      type={field.type}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-default)",
                        backgroundColor: "var(--surface-base)",
                        color: "var(--text-primary)",
                        fontSize: "14px"
                      }}
                      onChange={(e) => setFormVals({ ...formFields, [field.id]: e.target.value })}
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                style={{
                  padding: "10px 16px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "var(--brand-primary)",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Submit
              </button>
            </form>
          </div>
        </Section>

        {/* Charts */}
        <Section title="Charts Runtime">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
              <p className="text-xs mb-2" style={{ color: "var(--text-tertiary)" }}>Line Chart</p>
              <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)" }}>
                Chart placeholder
              </div>
            </div>
            <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
              <p className="text-xs mb-2" style={{ color: "var(--text-tertiary)" }}>Pie Chart</p>
              <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)" }}>
                Chart placeholder
              </div>
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
