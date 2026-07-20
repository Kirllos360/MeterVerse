"use client"

import { useState, useEffect } from "react"

export default function AdminMonitoringPage() {
  const [metrics, setMetrics] = useState<any>(null); const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/admin/monitoring").then(r=>r.json()).then(d=>{setMetrics(d.metrics);setLoading(false)}).catch(()=>setLoading(false)) }, [])
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Monitoring</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>System metrics and performance</p></div>
      {loading ? <div className="text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</div>
      : <div className="grid grid-cols-5 gap-3">
          {metrics && [
            {l:"Users",v:metrics.users,c:"#EF4444"},{l:"Meters",v:metrics.meters,c:"#3B82F6"},{l:"Readings",v:metrics.readings.toLocaleString(),c:"#22C55E"},{l:"Active Sessions",v:metrics.activeSessions,c:"#F59E0B"},{l:"Pending Jobs",v:metrics.pendingJobs,c:"#F59E0B"}
          ].map(s=>(
            <div key={s.l} className="rounded-xl border p-4" style={{backgroundColor:"var(--admin-surface)",borderColor:"var(--admin-border)"}}>
              <div className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{s.l}</div><div className="text-xl font-bold mt-1 tabular-nums" style={{color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>}
      <div className="rounded-xl border p-6" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        <h2 className="text-sm font-semibold mb-3 text-white">System Overview</h2>
        <div className="grid grid-cols-2 gap-4 text-xs">
          {[{l:"Database",v:"PostgreSQL 16",s:"operational"},{l:"Cache",v:"In-Memory",s:"operational"},{l:"Queue",v:"Database-backed",s:"operational"},{l:"Storage",v:"Local filesystem",s:"operational"}].map(s=>(
            <div key={s.l} className="flex items-center justify-between p-3 rounded-lg" style={{backgroundColor:"var(--admin-surface)",border:"1px solid var(--admin-border)"}}>
              <span style={{color:"rgba(255,255,255,0.5)"}}>{s.l}: <span style={{color:"rgba(255,255,255,0.7)"}}>{s.v}</span></span>
              <span style={{color:"#22C55E"}}>{s.s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
