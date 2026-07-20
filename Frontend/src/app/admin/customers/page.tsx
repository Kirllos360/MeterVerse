"use client"

import { useState, useEffect } from "react"
import { EnterpriseTable, Column } from "@/admin/tables/EnterpriseTable"

interface Customer {
  id: string; name: string; email: string; phone: string; status: string; area: string; createdAt: string
}

const columns: Column<Customer>[] = [
  { id: "name", header: "Name", accessor: r => r.name, width: 180, sortable: true, filterable: true, pinned: "left" },
  { id: "email", header: "Email", accessor: r => r.email, width: 220, sortable: true, filterable: true },
  { id: "phone", header: "Phone", accessor: r => r.phone || "—", width: 140, sortable: true },
  { id: "status", header: "Status", accessor: r => r.status, width: 100, sortable: true, filterable: true },
  { id: "area", header: "Area", accessor: r => r.area || "—", width: 120, sortable: true, filterable: true },
  { id: "createdAt", header: "Created", accessor: r => r.createdAt?.substring(0,10) || "—", width: 110, sortable: true },
]

export default function AdminCustomersPage() {
  const [data, setData] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(d => {
        const mapped = (d.users || []).map((u: any) => ({
          id: u.id, name: u.name, email: u.email, phone: u.phone || "",
          status: u.status || "active", area: u.area || "",
          createdAt: u.createdAt || "",
        }))
        setData(mapped)
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6" style={{color:"rgba(255,255,255,0.3)"}}>Loading customers...</div>

  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Customers</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>EnterpriseTable integrated — {data.length} records</p></div>
      <EnterpriseTable
        data={data}
        columns={columns}
        getId={r => r.id}
        tableName="customers"
        onCellEdit={(row, col, val) => console.log("Edit:", row.id, col, val)}
        onBulkAction={(action, ids) => console.log("Bulk:", action, ids)}
      />
    </div>
  )
}
