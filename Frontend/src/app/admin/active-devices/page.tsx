"use client"

import { useState, useEffect } from "react"

interface Session { id: string; device: string|null; userAgent: string|null; location: string|null; isActive: boolean; lastUsedAt: string; user: {name:string;email:string}|null }

export default function AdminActiveDevicesPage() {
  const [sessions, setSessions] = useState<Session[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/admin/sessions").then(r=>r.json()).then(d=>{setSessions((d.sessions||[]).filter((s:any)=>s.isActive));setLoading(false)}).catch(()=>setLoading(false)) }, [])
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Active Devices</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>{sessions.length} currently active</p></div>
      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        <table className="w-full"><thead><tr style={{backgroundColor:"var(--admin-surface)"}}>
          {["User","Device","Location","Last Active"].map(h=>(<th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{h}</th>))}
        </tr></thead>
        <tbody>{loading ? <tr><td colSpan={4} className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</td></tr>
          : sessions.map(s => (
            <tr key={s.id}><td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.7)",borderBottom:"1px solid var(--admin-border)"}}>{s.user?.name||"Unknown"}</td>
            <td className="px-4 py-3 text-sm font-mono" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{s.device||s.userAgent?.substring(0,30)||"—"}</td>
            <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{s.location||"—"}</td>
            <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{new Date(s.lastUsedAt).toLocaleString()}</td></tr>
          ))}</tbody></table>
      </div>
    </div>
  )
}
