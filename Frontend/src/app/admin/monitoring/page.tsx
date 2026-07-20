"use client"

import { useState, useEffect } from "react"

export default function AdminMonitorPage() {
  const [tab, setTab] = useState("dashboard")
  const [deep, setDeep] = useState<any>(null)
  const [perf, setPerf] = useState<any>(null)
  const [audit, setAudit] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/monitor/health-deep").then(r=>r.json()).catch(()=>({})),
      fetch("/api/monitor/performance").then(r=>r.json()).catch(()=>({})),
      fetch("/api/monitor/audit-explorer").then(r=>r.json()).catch(()=>({})),
      fetch("/api/monitor/analytics?days=30").then(r=>r.json()).catch(()=>({})),
    ]).then(([h,p,a,an]) => { setDeep(h); setPerf(p); setAudit(a); setAnalytics(an); setLoading(false) }).catch(()=>setLoading(false))
  }, [])

  if (loading) return <div className="p-6" style={{color:"rgba(255,255,255,0.3)"}}>Loading monitoring...</div>

  const tabs = [
    { id:"dashboard", label:"Health Dashboard" },
    { id:"performance", label:"Performance" },
    { id:"audit", label:"Audit Explorer" },
    { id:"analytics", label:"Business Analytics" },
  ]

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-white">Monitoring &amp; Observability</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Prometheus · Health · Performance · Audit · Analytics</p></div>
      </div>

      <div className="flex gap-1 pb-2">
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{backgroundColor:tab===t.id?"var(--status-error)":"var(--admin-surface)",color:tab===t.id?"white":"rgba(255,255,255,0.5)",border:tab===t.id?"none":"1px solid var(--admin-border)"}}>{t.label}</button>
        ))}
      </div>

      {tab === "dashboard" && <>
        <div className="grid grid-cols-3 gap-3">
          {deep?.checks?.map((c: any,i: number) => (
            <div key={i} className="rounded-xl border p-4" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{color:"rgba(255,255,255,0.7)"}}>{c.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{backgroundColor:c.status==="healthy"?"rgba(34,197,94,0.1)":"rgba(245,158,11,0.1)",color:c.status==="healthy"?"#DC2626":"#EF4444"}}>{c.status}</span>
              </div>
              {c.latency && <div className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>Latency: {c.latency}</div>}
              {c.stuckJobs !== undefined && <div className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>Stuck jobs: {c.stuckJobs}</div>}
              {c.expiredSessions !== undefined && <div className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>Expired sessions: {c.expiredSessions}</div>}
              {c.files !== undefined && <div className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>Files: {c.files}</div>}
              {c.errors !== undefined && <div className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>Errors (24h): {c.errors}</div>}
            </div>
          ))}
        </div>
        <div className="rounded-xl border p-4" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
          <div className="text-xs mb-2" style={{color:"rgba(255,255,255,0.4)"}}>Overall Status: <span style={{color:deep?.status==="healthy"?"#DC2626":"#EF4444",fontWeight:600}}>{deep?.status?.toUpperCase()}</span></div>
          <div className="text-[10px] font-mono" style={{color:"rgba(255,255,255,0.3)"}}>GET /api/monitor/health/deep · GET /api/monitor/metrics/prometheus</div>
        </div>
      </>}

      {tab === "performance" && <>
        <div className="grid grid-cols-4 gap-3">
          {[
            {l:"Total Readings",v:perf?.summary?.totalReadings||0,c:"#DC2626"},
            {l:"Validation Rate",v:`${perf?.summary?.validationRate||0}%`,c:"#DC2626"},
            {l:"Total Invoices",v:perf?.summary?.totalInvoices||0,c:"#EF4444"},
            {l:"Revenue",v:`EGP ${(perf?.summary?.totalRevenue||0).toLocaleString()}`,c:"#DC2626"},
          ].map(s => (
            <div key={s.l} className="rounded-xl border p-4" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
              <div className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{s.l}</div>
              <div className="text-lg font-bold mt-1 tabular-nums" style={{color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            {l:"Today's Readings",v:perf?.today?.readings||0,c:"#DC2626"},
            {l:"Today's Invoices",v:perf?.today?.invoices||0,c:"#DC2626"},
            {l:"Throughput (30d avg)",v:`${perf?.throughput?.readingsPerDay||0}/day`,c:"#EF4444"},
          ].map(s => (
            <div key={s.l} className="rounded-xl border p-4" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
              <div className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{s.l}</div>
              <div className="text-lg font-bold mt-1 tabular-nums" style={{color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>
      </>}

      {tab === "audit" && <>
        <div className="grid grid-cols-3 gap-3">
          {[
            {l:"Total Entries",v:audit?.stats?.total||0,c:"#DC2626"},
            {l:"Failures",v:audit?.stats?.failures||0,c:audit?.stats?.failures>0?"#EF4444":"#DC2626"},
            {l:"Today",v:audit?.stats?.today||0,c:"#EF4444"},
          ].map(s => (
            <div key={s.l} className="rounded-xl border p-4" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
              <div className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{s.l}</div>
              <div className="text-lg font-bold mt-1 tabular-nums" style={{color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
          <div className="px-4 py-3 border-b text-xs font-semibold" style={{borderColor:"var(--admin-border)",color:"rgba(255,255,255,0.7)"}}>Recent Audit Entries</div>
          {audit?.entries?.slice(0,15).map((e:any) => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-2 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{backgroundColor:e.status==="success"?"#DC2626":"#EF4444"}}/>
              <span className="w-20 shrink-0 font-mono text-[10px]" style={{color:"rgba(255,255,255,0.3)"}}>{e.timestamp?.substring(11,19)}</span>
              <span className="w-24 shrink-0 truncate" style={{color:"rgba(255,255,255,0.5)"}}>{e.actor||"system"}</span>
              <span className="flex-1 truncate" style={{color:"rgba(255,255,255,0.7)"}}>{e.action}</span>
              <span className="w-20 truncate text-[10px] font-mono" style={{color:"rgba(255,255,255,0.3)"}}>{e.resource}</span>
            </div>
          ))}
        </div>
      </>}

      {tab === "analytics" && <>
        <div className="grid grid-cols-4 gap-3">
          {[
            {l:"New Customers (30d)",v:analytics?.growth?.customers||0,c:"#DC2626"},
            {l:"New Meters (30d)",v:analytics?.growth?.meters||0,c:"#DC2626"},
            {l:"Readings (30d)",v:analytics?.growth?.readings||0,c:"#EF4444"},
            {l:"Invoices (30d)",v:analytics?.growth?.invoices||0,c:"#EF4444"},
          ].map(s => (
            <div key={s.l} className="rounded-xl border p-4" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
              <div className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{s.l}</div>
              <div className="text-lg font-bold mt-1 tabular-nums" style={{color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-4" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
            <div className="text-xs font-semibold mb-2" style={{color:"rgba(255,255,255,0.7)"}}>Revenue by Status</div>
            {analytics?.revenue?.map((r:any,i:number) => (
              <div key={i} className="flex items-center justify-between py-1 text-xs">
                <span style={{color:"rgba(255,255,255,0.5)"}}>{r.status}</span>
                <span className="tabular-nums" style={{color:"rgba(255,255,255,0.8)"}}>EGP {r.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border p-4" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
            <div className="text-xs font-semibold mb-2" style={{color:"rgba(255,255,255,0.7)"}}>Top Areas by Meters</div>
            {analytics?.topAreas?.map((a:any,i:number) => (
              <div key={i} className="flex items-center justify-between py-1 text-xs">
                <span style={{color:"rgba(255,255,255,0.5)"}}>{a.area}</span>
                <span className="tabular-nums" style={{color:"rgba(255,255,255,0.8)"}}>{a.count} meters</span>
              </div>
            ))}
          </div>
        </div>
      </>}
    </div>
  )
}

