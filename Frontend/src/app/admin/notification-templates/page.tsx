"use client"

import { useState, useEffect } from "react"

interface Template { id: string; key: string; name: string; type: string; subject?: string; createdAt: string }

export default function AdminNotificationTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/admin/notification-templates").then(r=>r.json()).then(d=>{setTemplates(d.templates||[]);setLoading(false)}).catch(()=>setLoading(false)) }, [])
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-white">Notification Templates</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Email and notification templates</p></div>
        <button className="px-3 py-2 rounded-lg text-xs font-medium text-white" style={{backgroundColor:"var(--status-error)"}}>Create Template</button>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        <table className="w-full">
          <thead><tr style={{backgroundColor:"var(--admin-surface)"}}>
            {["Name","Key","Type","Subject","Created"].map(h=>(<th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{h}</th>))}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</td></tr>
            : templates.map(t => (
              <tr key={t.id}>
                <td className="px-4 py-3 text-sm font-medium" style={{color:"rgba(255,255,255,0.7)",borderBottom:"1px solid var(--admin-border)"}}>{t.name}</td>
                <td className="px-4 py-3 text-sm font-mono" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{t.key}</td>
                <td className="px-4 py-3 text-sm"><span className="px-2 py-0.5 rounded text-[10px] font-medium capitalize" style={{backgroundColor:"rgba(59,130,246,0.1)",color:"#DC2626"}}>{t.type}</span></td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{t.subject||"—"}</td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

