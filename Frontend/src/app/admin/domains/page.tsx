"use client"

import { useState, useEffect } from "react"

export default function AdminDomainsPage() {
  const [tab, setTab] = useState("contracts")
  const [data, setData] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)

  const domains = [
    { id:"contracts", label:"Contracts" },
    { id:"tariffs", label:"Tariffs" },
    { id:"tariff-rates", label:"Tariff Rates" },
    { id:"tariff-tiers", label:"Tariff Tiers" },
    { id:"bill-cycles", label:"Bill Cycles" },
    { id:"bill-runs", label:"Bill Runs" },
    { id:"charge-rules", label:"Charge Rules" },
    { id:"invoice-items", label:"Invoice Items" },
    { id:"meter-assignments", label:"Meter Assignments" },
    { id:"meter-events", label:"Meter Events" },
    { id:"validation-rules", label:"Validation Rules" },
    { id:"workflow-states", label:"Workflow States" },
    { id:"collection-cases", label:"Collections" },
    { id:"payment-gateways", label:"Payment Gateways" },
    { id:"customer-groups", label:"Customer Groups" },
    { id:"slas", label:"SLAs" },
    { id:"alert-rules", label:"Alert Rules" },
    { id:"escalation-policies", label:"Escalations" },
  ]

  useEffect(() => {
    Promise.all(domains.map(d => 
      fetch(`/api/domain/${d.id}`).then(r=>r.json()).catch(()=>({}))
    )).then(results => {
      const m: Record<string, any[]> = {}
      domains.forEach((d, i) => { m[d.id] = results[i]?.items || [] })
      setData(m); setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-6" style={{color:"rgba(255,255,255,0.3)"}}>Loading domains...</div>

  const currentData = data[tab] || []

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-white">Domain Manager</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>78 Prisma models — 19 domain entities</p></div>
      </div>

      <div className="flex gap-1 pb-2 flex-wrap overflow-x-auto" style={{maxHeight:120,overflowY:"auto"}}>
        {domains.map(d => (
          <button key={d.id} onClick={()=>setTab(d.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
            style={{backgroundColor:tab===d.id?"var(--status-error)":"var(--admin-surface)",color:tab===d.id?"white":"rgba(255,255,255,0.5)",border:tab===d.id?"none":"1px solid var(--admin-border)"}}>
            {d.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        <div className="px-4 py-3 border-b text-xs font-semibold" style={{borderColor:"var(--admin-border)",color:"rgba(255,255,255,0.7)"}}>
          {domains.find(d=>d.id===tab)?.label || tab} — {currentData.length} records
        </div>
        {currentData.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>
            No data in {tab}. Create records via API.
          </div>
        ) : (
          <table className="w-full">
            <thead><tr style={{backgroundColor:"var(--admin-surface)"}}>
              {Object.keys(currentData[0]).filter(k => !k.includes("Id") && k !== "id" && k !== "password" && k !== "key").slice(0,8).map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium capitalize" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{h.replace(/([A-Z])/g,' $1')}</th>
              ))}
            </tr></thead>
            <tbody>
              {currentData.slice(0,50).map((row: any, i: number) => (
                <tr key={row.id || i}>
                  {Object.keys(currentData[0]).filter(k => !k.includes("Id") && k !== "id" && k !== "password" && k !== "key").slice(0,8).map((k: string) => (
                    <td key={k} className="px-4 py-3 text-sm truncate max-w-[200px]" style={{color:"rgba(255,255,255,0.7)",borderBottom:"1px solid var(--admin-border)"}}>
                      {typeof row[k] === 'object' ? JSON.stringify(row[k]).substring(0,30) : String(row[k] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
