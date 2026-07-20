"use client"

import { useState, useMemo } from "react"

// ═══════════════════════════════════════════════════════════════════════════════
//  METADATA SCHEMA — defines any entity
// ═══════════════════════════════════════════════════════════════════════════════

export interface FieldDef {
  name: string
  label: string
  type: "string" | "number" | "boolean" | "date" | "email" | "enum" | "textarea"
  required?: boolean
  readonly?: boolean
  placeholder?: string
  defaultValue?: any
  options?: { label: string; value: string }[]  // for enum
  min?: number
  max?: number
  pattern?: string
  description?: string
}

export interface ActionDef {
  name: string
  label: string
  icon?: string
  color?: string
  confirm?: string
  requirePermission?: string
  handler: string  // "delete" | "archive" | "approve" | "export" | "custom"
}

export interface EntityMetadata {
  name: string               // e.g. "customer"
  label: string              // e.g. "Customer"
  labelPlural: string        // e.g. "Customers"
  description?: string
  fields: FieldDef[]
  columns?: string[]         // which fields show in table (by name)
  formFields?: string[]      // which fields show in create/edit form
  actions?: ActionDef[]
  permissions?: { create?: string; read?: string; update?: string; delete?: string }
  defaultSort?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SAMPLE ENTITY DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const sampleEntities: Record<string, EntityMetadata> = {
  customer: {
    name: "customer", label: "Customer", labelPlural: "Customers",
    description: "Manage utility customers",
    fields: [
      { name: "name", label: "Name", type: "string", required: true, placeholder: "John Doe" },
      { name: "email", label: "Email", type: "email", placeholder: "john@example.com" },
      { name: "phone", label: "Phone", type: "string", placeholder: "+20 100 000 0000" },
      { name: "status", label: "Status", type: "enum", defaultValue: "active", options: [{label:"Active",value:"active"},{label:"Inactive",value:"inactive"},{label:"Suspended",value:"suspended"}] },
      { name: "area", label: "Area", type: "string" },
      { name: "address", label: "Address", type: "textarea" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    columns: ["name","email","phone","status","area"],
    formFields: ["name","email","phone","status","area","address","notes"],
    actions: [{name:"edit",label:"Edit",icon:"✏️",handler:"custom"},{name:"delete",label:"Delete",icon:"🗑",color:"#EF4444",confirm:"Delete this customer?",handler:"delete"},{name:"export",label:"Export",icon:"📤",handler:"export"}],
    permissions: { create: "admin", read: "user", update: "admin", delete: "super_admin" },
    defaultSort: "name",
  },
  meter: {
    name: "meter", label: "Meter", labelPlural: "Meters",
    fields: [
      { name: "serial", label: "Serial Number", type: "string", required: true },
      { name: "type", label: "Type", type: "enum", options: [{label:"Electric",value:"electric"},{label:"Water",value:"water"},{label:"Gas",value:"gas"}] },
      { name: "status", label: "Status", type: "enum", defaultValue: "active", options: [{label:"Active",value:"active"},{label:"Faulty",value:"faulty"},{label:"Retired",value:"retired"}] },
      { name: "location", label: "Location", type: "string" },
      { name: "area", label: "Area", type: "string" },
    ],
    columns: ["serial","type","status","location","area"],
    formFields: ["serial","type","status","location","area"],
    actions: [{name:"edit",label:"Edit",icon:"✏️",handler:"custom"},{name:"delete",label:"Delete",icon:"🗑",color:"#EF4444",handler:"delete"}],
  },
  invoice: {
    name: "invoice", label: "Invoice", labelPlural: "Invoices",
    fields: [
      { name: "number", label: "Invoice #", type: "string", readonly: true },
      { name: "customer", label: "Customer", type: "string", required: true },
      { name: "amount", label: "Amount", type: "number", min: 0 },
      { name: "status", label: "Status", type: "enum", options: [{label:"Pending",value:"pending"},{label:"Paid",value:"paid"},{label:"Overdue",value:"overdue"},{label:"Cancelled",value:"cancelled"}] },
      { name: "dueDate", label: "Due Date", type: "date" },
      { name: "issuedAt", label: "Issue Date", type: "date", readonly: true },
    ],
    columns: ["number","customer","amount","status","dueDate"],
    formFields: ["customer","amount","status","dueDate"],
    actions: [
      {name:"approve",label:"Approve",icon:"✅",color:"#22C55E",requirePermission:"invoices.approve",handler:"approve"},
      {name:"delete",label:"Delete",icon:"🗑",color:"#EF4444",handler:"delete"},
      {name:"export",label:"PDF",icon:"📄",handler:"export"},
    ],
    defaultSort: "-number",
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

function generateMockData(meta: EntityMetadata, count = 50): any[] {
  return Array.from({ length: count }, (_, i) => {
    const row: any = { id: `id-${i}` }
    for (const f of meta.fields) {
      switch (f.type) {
        case "string": row[f.name] = `${f.label} ${i + 1}`; break
        case "email": row[f.name] = `user${i + 1}@example.com`; break
        case "number": row[f.name] = Math.floor(Math.random() * 10000 + 100); break
        case "boolean": row[f.name] = Math.random() > 0.5; break
        case "date": row[f.name] = new Date(Date.now() - Math.random() * 30 * 86400000).toISOString().split("T")[0]; break
        case "enum": row[f.name] = f.options?.[i % (f.options?.length || 1)]?.value; break
        case "textarea": row[f.name] = `Sample ${f.label} text`; break
      }
    }
    return row
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
//  RUNTIME ENGINE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function RuntimeEngine({ metadata }: { metadata: EntityMetadata }) {
  const [mode, setMode] = useState<"list" | "create" | "edit" | "detail">("list")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [data, setData] = useState<any[]>(() => generateMockData(metadata))
  const [search, setSearch] = useState("")

  const filteredData = useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter(row => metadata.columns?.some(col => String(row[col] ?? "").toLowerCase().includes(q)))
  }, [data, search, metadata.columns])

  // ─── Validation ────────────────────────────────────────────────────────
  const validate = (form: Record<string, any>) => {
    const errs: Record<string, string> = {}
    for (const f of metadata.fields) {
      if (f.required && !form[f.name]) errs[f.name] = `${f.label} is required`
      if (f.type === "email" && form[f.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form[f.name])) errs[f.name] = "Invalid email"
      if (f.type === "number") {
        const val = Number(form[f.name])
        if (f.min !== undefined && val < f.min) errs[f.name] = `Min: ${f.min}`
        if (f.max !== undefined && val > f.max) errs[f.name] = `Max: ${f.max}`
      }
    }
    return errs
  }

  // ─── Actions ────────────────────────────────────────────────────────────
  const handleAction = (action: ActionDef, row: any) => {
    if (action.confirm && !confirm(action.confirm)) return
    switch (action.handler) {
      case "delete": setData(d => d.filter(r => r.id !== row.id)); break
      case "approve": setData(d => d.map(r => r.id === row.id ? { ...r, status: "approved" } : r)); break
      case "export": {
        const csv = [metadata.columns?.join(","), ...filteredData.map(r => metadata.columns?.map(c => r[c]).join(","))].join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${metadata.name}.csv`; a.click()
        break
      }
      case "custom": setSelectedId(row.id); setFormData(row); setMode("edit"); break
    }
  }

  // ─── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const errs = validate(formData)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    if (mode === "create") {
      setData(d => [{ ...formData, id: `new-${Date.now()}` }, ...d])
    } else if (mode === "edit" && selectedId) {
      setData(d => d.map(r => r.id === selectedId ? { ...r, ...formData } : r))
    }
    setMode("list"); setFormData({}); setSelectedId(null)
  }

  const initForm = () => {
    const init: Record<string, any> = {}
    for (const f of metadata.fields) init[f.name] = f.defaultValue ?? ""
    return init
  }

  const renderField = (field: FieldDef) => {
    const val = formData[field.name] ?? ""
    const common = {
      value: val,
      onChange: (e: any) => setFormData(p => ({ ...p, [field.name]: e.target.value })),
      className: "w-full px-3 py-2 rounded-lg border text-xs outline-none",
      style: { backgroundColor: "var(--admin-surface)", borderColor: errors[field.name] ? "#EF4444" : "var(--admin-border)", color: "white" } as React.CSSProperties,
      placeholder: field.placeholder,
      disabled: field.readonly,
    }
    switch (field.type) {
      case "textarea": return <textarea {...common} rows={3} />
      case "enum": return <select {...common}>{field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
      case "boolean": return <input type="checkbox" checked={!!val} onChange={e => setFormData(p => ({ ...p, [field.name]: e.target.checked }))} style={{ accentColor: "#EF4444" }} />
      case "date": return <input type="date" {...common} />
      default: return <input type={field.type === "number" ? "number" : "text"} {...common} />
    }
  }

  return (
    <div className="space-y-4">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {mode === "list" ? metadata.labelPlural : mode === "create" ? `New ${metadata.label}` : `Edit ${metadata.label}`}
          </h2>
          <p className="text-xs mt-0.5" style={{color:"rgba(255,255,255,0.4)"}}>{metadata.description}</p>
        </div>
        {mode === "list" && (
          <div className="flex items-center gap-2">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="px-3 py-2 rounded-lg border text-xs outline-none" style={{width:200, backgroundColor:"var(--admin-surface)",borderColor:"var(--admin-border)",color:"white"}} />
            <button onClick={() => { setFormData(initForm()); setErrors({}); setMode("create") }} className="px-4 py-2 rounded-lg text-xs font-medium text-white" style={{backgroundColor:"var(--status-error)"}}>+ New</button>
          </div>
        )}
        {mode !== "list" && (
          <div className="flex gap-2">
            <button onClick={() => { setMode("list"); setFormData({}); setErrors({}) }} className="px-3 py-2 rounded-lg text-xs font-medium" style={{backgroundColor:"var(--admin-surface)",border:"1px solid var(--admin-border)",color:"rgba(255,255,255,0.5)"}}>Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 rounded-lg text-xs font-medium text-white" style={{backgroundColor:"var(--status-error)"}}>{mode === "create" ? "Create" : "Save"}</button>
          </div>
        )}
      </div>

      {/* ─── List View ───────────────────────────────────────────────────── */}
      {mode === "list" && (
        <div className="rounded-xl border overflow-auto" style={{borderColor:"var(--admin-border)",maxHeight:500}}>
          <table className="w-full"><thead><tr style={{position:"sticky",top:0,zIndex:1,backgroundColor:"var(--admin-surface)"}}>
            {(metadata.columns || metadata.fields.map(f => f.name)).map(col => (
              <th key={col} className="text-left px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>
                {metadata.fields.find(f => f.name === col)?.label || col}
              </th>
            ))}
            {metadata.actions && metadata.actions.length > 0 && <th className="px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>Actions</th>}
          </tr></thead>
          <tbody>
            {filteredData.map(row => (
              <tr key={row.id} className="hover:opacity-80 transition-opacity">
                {(metadata.columns || metadata.fields.map(f => f.name)).map(col => (
                  <td key={col} className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.7)",borderBottom:"1px solid var(--admin-border)"}}>
                    {row[col] ?? "—"}
                  </td>
                ))}
                {metadata.actions && <td className="px-4 py-3 text-sm" style={{borderBottom:"1px solid var(--admin-border)"}}>
                  <div className="flex gap-1">
                    {metadata.actions.map(a => (
                      <button key={a.name} onClick={() => handleAction(a, row)} className="px-2 py-1 rounded text-[10px] font-medium" style={{color:a.color||"rgba(255,255,255,0.6)",backgroundColor:a.color ? `${a.color}1a` : "var(--admin-surface)",border:"1px solid var(--admin-border)"}} title={a.label}>
                        {a.icon || a.label}
                      </button>
                    ))}
                  </div>
                </td>}
              </tr>
            ))}
          </tbody></table>
        </div>
      )}

      {/* ─── Form View (Create/Edit) ──────────────────────────────────────── */}
      {mode !== "list" && (
        <div className="rounded-xl border p-6" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
          <div className="grid grid-cols-2 gap-4">
            {(metadata.formFields || metadata.fields.map(f => f.name)).filter(fn => metadata.fields.find(f => f.name === fn)).map(fn => {
              const field = metadata.fields.find(f => f.name === fn)!
              return (
                <div key={field.name} className={field.type === "textarea" ? "col-span-2" : ""}>
                  <label className="block text-xs font-medium mb-1" style={{color:"rgba(255,255,255,0.6)"}}>
                    {field.label}{field.required && <span style={{color:"#EF4444"}}>*</span>}
                  </label>
                  {renderField(field)}
                  {errors[field.name] && <p className="text-[10px] mt-1" style={{color:"#EF4444"}}>{errors[field.name]}</p>}
                  {field.description && !errors[field.name] && <p className="text-[10px] mt-1" style={{color:"rgba(255,255,255,0.3)"}}>{field.description}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
