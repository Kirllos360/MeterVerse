"use client"

import { useState, useEffect } from "react"

interface Task { id: string; name: string; description?: string; cron: string; taskType: string; active: boolean; lastRunAt: string|null; nextRunAt: string|null; createdAt: string }

export default function AdminSchedulerPage() {
  const [tasks, setTasks] = useState<Task[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/admin/scheduler").then(r=>r.json()).then(d=>{setTasks(d.tasks||[]);setLoading(false)}).catch(()=>setLoading(false)) }, [])
  const toggle = async (id:string) => { await fetch(`/api/admin/scheduler/${id}`,{method:"PUT"}); setTasks(prev=>prev.map(t=>t.id===id?{...t,active:!t.active}:t)) }
  const remove = async (id:string) => { await fetch(`/api/admin/scheduler/${id}`,{method:"DELETE"}); setTasks(prev=>prev.filter(t=>t.id!==id)) }
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-white">Task Scheduler</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Cron job management</p></div>
        <button className="px-3 py-2 rounded-lg text-xs font-medium text-white" style={{backgroundColor:"var(--status-error)"}}>Create Task</button>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        <table className="w-full">
          <thead><tr style={{backgroundColor:"var(--admin-surface)"}}>
            {["Name","Cron","Type","Active","Last Run","Next Run","Actions"].map(h=>(<th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{h}</th>))}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</td></tr>
            : tasks.map(t => (
              <tr key={t.id}>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.7)",borderBottom:"1px solid var(--admin-border)"}}><div>{t.name}</div>{t.description&&<div className="text-[10px]" style={{color:"rgba(255,255,255,0.3)"}}>{t.description}</div>}</td>
                <td className="px-4 py-3 text-sm font-mono" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{t.cron}</td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{t.taskType}</td>
                <td className="px-4 py-3 text-sm"><button onClick={()=>toggle(t.id)} className="relative w-8 h-4 rounded-full transition-colors inline-block" style={{backgroundColor:t.active?"#22C55E":"rgba(255,255,255,0.15)"}}><span className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform" style={{left:t.active?"18px":"2px"}}/></button></td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{t.lastRunAt?new Date(t.lastRunAt).toLocaleString():"Never"}</td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{t.nextRunAt?new Date(t.nextRunAt).toLocaleString():"—"}</td>
                <td className="px-4 py-3 text-sm"><button onClick={()=>remove(t.id)} className="text-[10px] px-2 py-1 rounded font-medium" style={{backgroundColor:"rgba(239,68,68,0.1)",color:"#EF4444"}}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
