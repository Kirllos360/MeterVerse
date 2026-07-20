"use client"

import { useState } from "react"
import { EnterpriseTable, Column } from "@/admin/tables/EnterpriseTable"

interface DemoItem {
  id: string; name: string; email: string; status: string; area: string; readings: number; consumption: number; revenue: number; lastActive: string
}

const generateData = (): DemoItem[] => Array.from({ length: 200 }, (_, i) => ({
  id: `id-${i}`,
  name: `Customer ${String(i + 1).padStart(3, "0")}`,
  email: `cust${i + 1}@example.com`,
  status: ["active", "inactive", "suspended", "pending"][i % 4],
  area: ["October", "New Cairo", "SODIC", "Sheikh Zayed", "North Coast"][i % 5],
  readings: Math.floor(Math.random() * 100 + 10),
  consumption: Math.floor(Math.random() * 5000 + 500),
  revenue: Math.floor(Math.random() * 50000 + 1000),
  lastActive: new Date(Date.now() - Math.random() * 30 * 86400000).toLocaleDateString(),
}))

const columns: Column<DemoItem>[] = [
  { id: "name", header: "Name", accessor: r => r.name, width: 160, sortable: true, filterable: true, editable: true, pinned: "left" },
  { id: "email", header: "Email", accessor: r => r.email, width: 200, sortable: true, filterable: true },
  { id: "status", header: "Status", accessor: r => r.status, width: 100, sortable: true, filterable: true, format: v => ({ active: "✅ Active", inactive: "⏸ Inactive", suspended: "⛔ Suspended", pending: "⏳ Pending" }[v as string] || v) },
  { id: "area", header: "Area", accessor: r => r.area, width: 120, sortable: true, filterable: true },
  { id: "readings", header: "Readings", accessor: r => r.readings, width: 100, sortable: true, align: "right", aggregate: "sum" },
  { id: "consumption", header: "Consumption", accessor: r => r.consumption, width: 120, sortable: true, align: "right", format: v => `${(v as number).toLocaleString()} kWh`, aggregate: "sum" },
  { id: "revenue", header: "Revenue", accessor: r => r.revenue, width: 120, sortable: true, align: "right", format: v => `EGP ${(v as number).toLocaleString()}`, aggregate: "sum" },
  { id: "lastActive", header: "Last Active", accessor: r => r.lastActive, width: 110, sortable: true },
]

export default function AdminTablesPage() {
  const [data] = useState(generateData)
  const [tab, setTab] = useState("demo")

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-white">Enterprise Tables</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Column presets · Resize · Reorder · Pin · Inline Edit · Grouping · Aggregation · Filters · Saved Views · Bulk Actions · Export · Keyboard Shortcuts</p></div>
      </div>

      <div className="flex gap-1 pb-2">
        {[{id:"demo",label:"Demo Table"},{id:"features",label:"Feature Reference"}].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{backgroundColor:tab===t.id?"var(--status-error)":"var(--admin-surface)",color:tab===t.id?"white":"rgba(255,255,255,0.5)",border:tab===t.id?"none":"1px solid var(--admin-border)"}}>{t.label}</button>
        ))}
      </div>

      {tab === "demo" && <EnterpriseTable
        data={data}
        columns={columns}
        getId={r => r.id}
        tableName="customers"
        onCellEdit={(row, col, val) => console.log("Edit:", row.id, col, val)}
        onBulkAction={(action, ids) => console.log("Bulk:", action, ids)}
      />}

      {tab === "features" && (
        <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
          <table className="w-full"><thead><tr style={{backgroundColor:"var(--admin-surface)"}}>
            {["Feature","How to Use","Implementation"].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{h}</th>
            ))}
          </tr></thead><tbody>
            {[
              ["Column Presets","Save/load via 💾 Save View button","savedViews state + localStorage-ready"],
              ["Resize","Drag the vertical divider at right edge of column header","onMouseDown handler with document mousemove"],
              ["Reorder","Drag column header and drop on another","HTML5 Drag and Drop API"],
              ["Pin","Click 📌 icon on column header to pin left","pinned: 'left' column property"],
              ["Inline Editing","Double-click a cell → edit → Enter to save","editing state + onCellEdit callback"],
              ["Grouping","Select from Group: dropdown above table","Map-based group renderer"],
              ["Aggregation","Set aggregate: 'sum|avg|min|max|count' on column","getAggregate() in tfoot"],
              ["Advanced Filters","Click 🔍 Filters to show filter row","filters state with per-column input"],
              ["Saved Views","Type name + 💾 Save View → click to load","savedViews state record"],
              ["Bulk Actions","Check rows → 🗑 Delete button appears","selected Set + onBulkAction callback"],
              ["Export CSV","Click 📤 CSV button","Blob + URL.createObjectURL"],
              ["Keyboard Shortcuts","Ctrl+A select all, ↩ edit, Esc cancel","useEffect with keydown listener"],
            ].map(([feat, use, impl]) => (
              <tr key={feat}><td className="px-4 py-3 text-sm font-medium" style={{color:"rgba(255,255,255,0.8)",borderBottom:"1px solid var(--admin-border)"}}>{feat}</td>
              <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{use}</td>
              <td className="px-4 py-3 text-sm font-mono text-[11px]" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{impl}</td></tr>
            ))}
          </tbody></table>
        </div>
      )}
    </div>
  )
}
