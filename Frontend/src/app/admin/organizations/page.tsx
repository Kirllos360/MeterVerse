"use client"

import { useState, useEffect } from "react"

interface Organization { id: string; name: string; slug: string; domain?: string; plan: string; status: string; _count: { projects: number }; createdAt: string }

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/admin/organizations").then(r=>r.json()).then(d=>{setOrgs(d.organizations||[]);setLoading(false)}).catch(()=>setLoading(false)) }, [])
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-white">Organizations</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Multi-tenant organization management</p></div>
        <button className="px-3 py-2 rounded-lg text-xs font-medium text-white" style={{backgroundColor:"var(--status-error)"}}>Create Organization</button>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        <table className="w-full">
          <thead><tr style={{backgroundColor:"var(--admin-surface)"}}>
            {["Name","Slug","Plan","Projects","Status","Created"].map(h=>(<th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{h}</th>))}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</td></tr>
            : orgs.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>No organizations</td></tr>
            : orgs.map(o => (
              <tr key={o.id}>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.7)",borderBottom:"1px solid var(--admin-border)"}}>{o.name}</td>
                <td className="px-4 py-3 text-sm font-mono" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{o.slug}</td>
                <td className="px-4 py-3 text-sm"><span className="px-2 py-0.5 rounded text-[10px] font-medium capitalize" style={{backgroundColor:"rgba(var(--status-error-rgb),0.1)",color:"var(--status-error)"}}>{o.plan}</span></td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{o._count?.projects||0}</td>
                <td className="px-4 py-3 text-sm" style={{color:o.status==="active"?"#DC2626":"rgba(255,255,255,0.3)",borderBottom:"1px solid var(--admin-border)"}}>{o.status}</td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

