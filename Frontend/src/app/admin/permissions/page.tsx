"use client"

import { useState, useEffect } from "react"

interface Permission { id: string; name: string; description: string; module: string }

export default function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/admin/permissions").then(r=>r.json()).then(d=>{setPermissions(d.permissions||[]);setLoading(false)}).catch(()=>setLoading(false)) }, [])
  const modules = [...new Set(permissions.map(p => p.module))]
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Permissions</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>{permissions.length} permissions across {modules.length} modules</p></div>
      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        <table className="w-full">
          <thead><tr style={{backgroundColor:"var(--admin-surface)"}}>
            {["Permission","Module","Description"].map(h=>(<th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{h}</th>))}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={3} className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</td></tr>
            : permissions.map(p => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-sm font-mono" style={{color:"rgba(255,255,255,0.7)",borderBottom:"1px solid var(--admin-border)"}}>{p.name}</td>
                <td className="px-4 py-3 text-sm"><span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{backgroundColor:"rgba(var(--status-error-rgb),0.1)",color:"var(--status-error)"}}>{p.module}</span></td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{p.description||"—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
