"use client"

import { useState, useEffect } from "react"

interface Webhook { id: string; name: string; url: string; events: string; active: boolean; lastTriggeredAt: string|null; createdAt: string }

export default function AdminWebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/admin/webhooks").then(r=>r.json()).then(d=>{setWebhooks(d.webhooks||[]);setLoading(false)}).catch(()=>setLoading(false)) }, [])
  const toggle = async (id:string) => { await fetch(`/api/admin/webhooks/${id}`,{method:"PUT"}); setWebhooks(prev=>prev.map(w=>w.id===id?{...w,active:!w.active}:w)) }
  const remove = async (id:string) => { await fetch(`/api/admin/webhooks/${id}`,{method:"DELETE"}); setWebhooks(prev=>prev.filter(w=>w.id!==id)) }
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-white">Webhooks</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Manage outgoing webhook endpoints</p></div>
        <button className="px-3 py-2 rounded-lg text-xs font-medium text-white" style={{backgroundColor:"var(--status-error)"}}>Add Webhook</button>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        <table className="w-full">
          <thead><tr style={{backgroundColor:"var(--admin-surface)"}}>
            {["Name","URL","Events","Status","Last Triggered","Actions"].map(h=>(<th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{h}</th>))}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</td></tr>
            : webhooks.map(w => (
              <tr key={w.id}>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.7)",borderBottom:"1px solid var(--admin-border)"}}>{w.name}</td>
                <td className="px-4 py-3 text-sm font-mono" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{w.url.substring(0,40)}...</td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{w.events === "[]" ? "All" : w.events}</td>
                <td className="px-4 py-3 text-sm"><button onClick={()=>toggle(w.id)} className="relative w-8 h-4 rounded-full transition-colors inline-block" style={{backgroundColor:w.active?"#DC2626":"rgba(255,255,255,0.15)"}}><span className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform" style={{left:w.active?"18px":"2px"}}/></button></td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{w.lastTriggeredAt?new Date(w.lastTriggeredAt).toLocaleString():"Never"}</td>
                <td className="px-4 py-3 text-sm"><button onClick={()=>remove(w.id)} className="text-[10px] px-2 py-1 rounded font-medium" style={{backgroundColor:"rgba(239,68,68,0.1)",color:"#EF4444"}}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

