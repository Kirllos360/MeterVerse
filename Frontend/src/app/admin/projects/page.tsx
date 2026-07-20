"use client"

import { useState, useEffect } from "react"

interface Project { id: string; name: string; description?: string; status: string; organization: { name: string }; createdAt: string }
interface Org { id: string; name: string }

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/admin/projects").then(r=>r.json()).then(d=>{setProjects(d.projects||[]);setLoading(false)}).catch(()=>setLoading(false)) }, [])
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Projects</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Organization projects and workspaces</p></div>
      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        <table className="w-full">
          <thead><tr style={{backgroundColor:"var(--admin-surface)"}}>
            {["Name","Organization","Status","Created"].map(h=>(<th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{h}</th>))}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</td></tr>
            : projects.map(p => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.7)",borderBottom:"1px solid var(--admin-border)"}}><div>{p.name}</div>{p.description && <div className="text-[10px]" style={{color:"rgba(255,255,255,0.3)"}}>{p.description}</div>}</td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{p.organization?.name||"—"}</td>
                <td className="px-4 py-3 text-sm" style={{color:p.status==="active"?"#DC2626":"rgba(255,255,255,0.3)",borderBottom:"1px solid var(--admin-border)"}}>{p.status}</td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

