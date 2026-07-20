"use client"

import { useState, useEffect } from "react"

export default function AdminBusinessEnginePage() {
  const [tab, setTab] = useState("status")
  const [stats, setStats] = useState<any>(null)
  const [recentRuns, setRecentRuns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/business/pipeline-status")
      .then(r=>r.json()).then(d=>{ setStats(d.stats||{}); setRecentRuns(d.recentRuns||[]); setLoading(false) })
      .catch(()=>setLoading(false))
  }, [])

  if (loading) return <div className="p-6" style={{color:"rgba(255,255,255,0.3)"}}>Loading Business Engine...</div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-white">Business Engine</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Reading → Revenue Pipeline</p></div>
      </div>

      <div className="flex gap-1 pb-2">
        {[{id:"status",label:"Pipeline Status"},{id:"simulate",label:"Simulator"}].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{backgroundColor:tab===t.id?"var(--status-error)":"var(--admin-surface)",color:tab===t.id?"white":"rgba(255,255,255,0.5)",border:tab===t.id?"none":"1px solid var(--admin-border)"}}>{t.label}</button>
        ))}
      </div>

      {tab === "status" && <>
        <div className="grid grid-cols-5 gap-3">
          {[
            {l:"Total Readings",v:stats?.totalReadings||0,c:"#DC2626"},
            {l:"Valid Readings",v:stats?.validReadings||0,c:"#DC2626"},
            {l:"Validation Rate",v:`${stats?.validationRate||0}%`,c:"#DC2626"},
            {l:"Total Invoices",v:stats?.totalInvoices||0,c:"#EF4444"},
            {l:"Total Charges",v:stats?.totalCharges||0,c:"#EF4444"},
          ].map(s => (
            <div key={s.l} className="rounded-xl border p-4" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
              <div className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{s.l}</div>
              <div className="text-xl font-bold mt-1 tabular-nums" style={{color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
          <div className="px-4 py-3 border-b text-xs font-semibold" style={{borderColor:"var(--admin-border)",color:"rgba(255,255,255,0.7)"}}>Recent Bill Runs</div>
          <table className="w-full"><thead><tr style={{backgroundColor:"var(--admin-surface)"}}>
            {["Cycle","Period","Status","Count","Amount","Date"].map(h=>(<th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{h}</th>))}
          </tr></thead><tbody>
            {recentRuns.map((r:any) => (
              <tr key={r.id}><td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.7)"}}>{r.billCycle?.name}</td>
              <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.5)"}}>{r.periodStart?.substring(0,10)} — {r.periodEnd?.substring(0,10)}</td>
              <td className="px-4 py-3 text-sm"><span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{backgroundColor:r.status==="completed"?"rgba(34,197,94,0.1)":r.status==="processing"?"rgba(59,130,246,0.1)":"rgba(245,158,11,0.1)",color:r.status==="completed"?"#DC2626":r.status==="processing"?"#DC2626":"#EF4444"}}>{r.status}</span></td>
              <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.5)"}}>{r.totalCount}</td>
              <td className="px-4 py-3 text-sm tabular-nums" style={{color:"rgba(255,255,255,0.7)"}}>EGP {r.totalAmount?.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.4)"}}>{r.createdAt?.substring(0,10)}</td></tr>
            ))}
          </tbody></table>
        </div>

        <div className="rounded-xl border p-4" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
          <div className="text-xs font-semibold mb-3" style={{color:"rgba(255,255,255,0.7)"}}>Pipeline Flow</div>
          <div className="flex items-center gap-1 text-[10px] flex-wrap">
            {["Reading","Validation","Consumption","Tariff","Charges","Invoice","Ledger","Payment","Balance","Reports"].map((step,i) => (
              <div key={step} className="flex items-center gap-1">
                <span className="px-2 py-1 rounded" style={{backgroundColor:"rgba(239,68,68,0.1)",color:"#EF4444"}}>{step}</span>
                {i < 9 && <span style={{color:"rgba(255,255,255,0.2)"}}>→</span>}
              </div>
            ))}
          </div>
        </div>
      </>}

      {tab === "simulate" && <div className="rounded-xl border p-6" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        <div className="text-xs font-semibold mb-4" style={{color:"rgba(255,255,255,0.7)"}}>Pipeline Simulator</div>
        <p className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>
          The Business Engine pipeline executes: Validate Reading → Calculate Consumption → Apply Tariff → Generate Charges → Create Invoice → Post to Ledger.
        </p>
        <p className="text-xs mt-2" style={{color:"rgba(255,255,255,0.4)"}}>
          API endpoints available:
        </p>
        <ul className="text-xs mt-1 space-y-1" style={{color:"rgba(255,255,255,0.5)"}}>
          <li><code style={{color:"#DC2626"}}>POST /api/business/pipeline/execute</code> — Full pipeline run</li>
          <li><code style={{color:"#DC2626"}}>POST /api/business/simulate/tariff</code> — Tariff calculation</li>
          <li><code style={{color:"#DC2626"}}>POST /api/business/simulate/invoice</code> — Invoice simulation</li>
          <li><code style={{color:"#DC2626"}}>GET /api/business/pipeline/status</code> — Pipeline statistics</li>
        </ul>
      </div>}
    </div>
  )
}

