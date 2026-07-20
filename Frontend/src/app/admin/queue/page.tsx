"use client"

import { useState, useEffect } from "react"

interface QueueJob { id: string; type: string; status: string; priority: number; attempts: number; error: string|null; createdAt: string }
const STATUS_COLORS: Record<string,string> = {pending:"#EF4444",running:"#DC2626",completed:"#DC2626",failed:"#EF4444"}

export default function AdminQueuePage() {
  const [jobs, setJobs] = useState<QueueJob[]>([]); const [stats, setStats] = useState({pending:0,running:0,completed:0,failed:0}); const [loading, setLoading] = useState(true)
  const fetchJobs = () => fetch("/api/admin/queue").then(r=>r.json()).then(d=>{setJobs(d.jobs||[]);setStats(d.stats||{});setLoading(false)}).catch(()=>setLoading(false))
  useEffect(() => { fetchJobs(); const i = setInterval(fetchJobs, 5000); return () => clearInterval(i) }, [])
  const retry = async (id:string) => { await fetch(`/api/admin/queue/${id}`,{method:"POST"}); fetchJobs() }
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Job Queue</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Async job processing</p></div>
      <div className="grid grid-cols-4 gap-3">
        {[{l:"Pending",v:stats.pending,c:"#EF4444"},{l:"Running",v:stats.running,c:"#DC2626"},{l:"Completed",v:stats.completed,c:"#DC2626"},{l:"Failed",v:stats.failed,c:"#EF4444"}].map(s=>(<div key={s.l} className="rounded-xl border p-4" style={{backgroundColor:"var(--admin-surface)",borderColor:"var(--admin-border)"}}><div className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{s.l}</div><div className="text-xl font-bold mt-1 tabular-nums" style={{color:s.c}}>{s.v}</div></div>))}
      </div>
      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        <table className="w-full">
          <thead><tr style={{backgroundColor:"var(--admin-surface)"}}>
            {["Type","Status","Priority","Attempts","Error","Created","Actions"].map(h=>(<th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{h}</th>))}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</td></tr>
            : jobs.map(j => (
              <tr key={j.id}>
                <td className="px-4 py-3 text-sm font-mono" style={{color:"rgba(255,255,255,0.7)",borderBottom:"1px solid var(--admin-border)"}}>{j.type}</td>
                <td className="px-4 py-3 text-sm" style={{color:STATUS_COLORS[j.status]||"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{j.status}</td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{j.priority}</td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.5)",borderBottom:"1px solid var(--admin-border)"}}>{j.attempts}/3</td>
                <td className="px-4 py-3 text-sm max-w-[150px] truncate" style={{color:j.error?"#EF4444":"rgba(255,255,255,0.3)",borderBottom:"1px solid var(--admin-border)"}}>{j.error||"—"}</td>
                <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{new Date(j.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">{j.status==="failed"&&<button onClick={()=>retry(j.id)} className="text-[10px] px-2 py-1 rounded font-medium" style={{backgroundColor:"rgba(245,158,11,0.1)",color:"#EF4444"}}>Retry</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

