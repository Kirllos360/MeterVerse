"use client"

import { useState, useEffect } from "react"

export default function AdminHomePage() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/health").then(r=>r.json()).catch(()=>({})),
      fetch("/api/business/pipeline-status").then(r=>r.json()).catch(()=>({})),
      fetch("/api/monitor/performance").then(r=>r.json()).catch(()=>({})),
    ]).then(([h,b,p]) => setStats({ health: h, business: b, performance: p }))
  }, [])

  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Admin Home</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>MeterVerse Enterprise Administration</p></div>

      <div className="grid grid-cols-4 gap-3">
        {[
          {l:"Users",v:stats?.performance?.summary?.totalReadings||"—",c:"#3B82F6"},
          {l:"Meters",v:"—",c:"#22C55E"},
          {l:"Readings",v:stats?.performance?.summary?.totalReadings?.toLocaleString()||"—",c:"#F59E0B"},
          {l:"Invoices",v:stats?.performance?.summary?.totalInvoices||"—",c:"#EF4444"},
        ].map(s => (
          <div key={s.l} className="rounded-xl border p-4" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
            <div className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{s.l}</div>
            <div className="text-xl font-bold mt-1 tabular-nums" style={{color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-4" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        <div className="text-sm font-semibold text-white mb-2">Quick Links</div>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {[
            {l:"👥 Users",p:"/admin/users"},{l:"🛡️ Security",p:"/admin/security"},{l:"📊 Reports",p:"/admin/reports"},
            {l:"🤖 AI",p:"/admin/ai"},{l:"📋 Audit",p:"/admin/audit"},{l:"⚙️ Settings",p:"/admin/settings"},
            {l:"📈 Monitor",p:"/admin/monitoring"},{l:"🧩 Services",p:"/admin/services"},
          ].map(q => (
            <a key={q.l} href={q.p} className="px-3 py-2 rounded-lg" style={{backgroundColor:"var(--admin-surface)",border:"1px solid var(--admin-border)",color:"rgba(255,255,255,0.7)",textDecoration:"none"}}>{q.l}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
