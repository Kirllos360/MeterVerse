"use client"

import { useState } from "react"

export default function AdminCRUDPage() {
  const [tab, setTab] = useState("overview")
  const [modelName, setModelName] = useState("customer")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const models = ["customer","meter","reading","invoice","payment","user","contract","tariff","billCycle","chargeRule","customerGroup","sLA","alertRule","collectionCase","paymentGateway"]

  const execute = async (action: string, extra: any = {}) => {
    setLoading(true); setResult(null)
    try {
      const body: any = { modelName, action, ...extra }
      if (action === "import") body.records = [{ name: "Test Import", email: "test@example.com" }]
      if (action === "bulk-update" || action === "bulk-delete") body.ids = [extra.id || "00000000-0000-0000-0000-000000000000"]
      const res = await fetch("/api/crud", {
        method: action === "export" || action === "history" ? "GET" : "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "export" || action === "history" ? undefined : JSON.stringify(body),
      })
      setResult(await res.json())
    } catch (e: any) { setResult({ error: e.message }) }
    setLoading(false)
  }

  const actions = [
    { id:"delete", label:"Soft Delete", desc:"Archives a record with audit trail" },
    { id:"restore", label:"Restore", desc:"Unarchives a soft-deleted record" },
    { id:"import", label:"Import", desc:"Bulk import records from array" },
    { id:"export", label:"Export", desc:"Export records as JSON or CSV" },
    { id:"history", label:"Version History", desc:"View audit trail for a record" },
    { id:"submit-approval", label:"Submit Approval", desc:"Submit for approval workflow" },
    { id:"approve", label:"Approve", desc:"Approve a pending record" },
    { id:"reject", label:"Reject", desc:"Reject a pending record" },
  ]

  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Enterprise CRUD</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Soft Delete · Bulk · Import · Export · Undo · Archive · Approval · Version History</p></div>

      <div className="flex gap-1 pb-2">
        {[{id:"overview",label:"Workflows"},{id:"console",label:"Console"}].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{backgroundColor:tab===t.id?"var(--status-error)":"var(--admin-surface)",color:tab===t.id?"white":"rgba(255,255,255,0.5)",border:tab===t.id?"none":"1px solid var(--admin-border)"}}>{t.label}</button>
        ))}
      </div>

      {tab === "overview" && <>
        <div className="grid grid-cols-4 gap-3">
          {actions.map(a => (
            <div key={a.id} className="rounded-xl border p-4" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor:"var(--status-error)"}}/>
                <span className="text-sm font-medium text-white">{a.label}</span>
              </div>
              <p className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{a.desc}</p>
              <div className="text-[10px] mt-2 font-mono" style={{color:"rgba(255,255,255,0.3)"}}>
                POST /api/crud/{"{model}"}/{a.id === "export" ? "export" : a.id === "history" ? ":id/history" : ":id/"+a.id}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border p-4" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
          <div className="text-xs font-semibold mb-2" style={{color:"rgba(255,255,255,0.7)"}}>Supported Models</div>
          <div className="flex gap-1 flex-wrap">
            {models.map(m => (
              <span key={m} className="px-2 py-1 rounded text-[10px] font-mono" style={{backgroundColor:"rgba(239,68,68,0.1)",color:"#EF4444"}}>{m}</span>
            ))}
          </div>
        </div>
      </>}

      {tab === "console" && <>
        <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
          <div className="px-4 py-3 border-b text-xs font-semibold" style={{borderColor:"var(--admin-border)",color:"rgba(255,255,255,0.7)"}}>CRUD Console</div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>Model</label>
              <select value={modelName} onChange={e=>setModelName(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border text-xs outline-none"
                style={{backgroundColor:"var(--admin-surface)",borderColor:"var(--admin-border)",color:"white"}}>
                {models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={()=>execute("export")} disabled={loading} className="px-3 py-2 rounded-lg text-xs font-medium text-white" style={{backgroundColor:"var(--status-error)"}}>Export</button>
              <button onClick={()=>execute("import")} disabled={loading} className="px-3 py-2 rounded-lg text-xs font-medium" style={{backgroundColor:"rgba(59,130,246,0.2)",color:"#3B82F6"}}>Import (test)</button>
              <button onClick={()=>execute("delete",{id:crypto.randomUUID()})} disabled={loading} className="px-3 py-2 rounded-lg text-xs font-medium" style={{backgroundColor:"rgba(245,158,11,0.2)",color:"#F59E0B"}}>Test Soft Delete</button>
              <button onClick={()=>execute("history",{id:crypto.randomUUID()})} disabled={loading} className="px-3 py-2 rounded-lg text-xs font-medium" style={{backgroundColor:"rgba(239,68,68,0.2)",color:"#EF4444"}}>Version History</button>
              <button onClick={()=>execute("submit-approval",{id:crypto.randomUUID()})} disabled={loading} className="px-3 py-2 rounded-lg text-xs font-medium" style={{backgroundColor:"rgba(34,197,94,0.2)",color:"#22C55E"}}>Test Approval</button>
            </div>

            {loading && <div className="text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Executing...</div>}
            
            {result && (
              <div className="rounded-lg border p-3" style={{borderColor:"var(--admin-border)"}}>
                <div className="text-xs font-semibold mb-2" style={{color:"rgba(255,255,255,0.7)"}}>Result</div>
                <pre className="text-xs font-mono whitespace-pre-wrap max-h-60 overflow-y-auto" style={{color:"rgba(255,255,255,0.5)"}}>{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </>}
    </div>
  )
}
