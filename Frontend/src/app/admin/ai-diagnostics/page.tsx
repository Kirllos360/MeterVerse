"use client"

import { useState, useEffect } from "react"

interface DiagnosticCheck { name: string; status: string; duration: string; details: string }

export default function AdminAIDiagnosticsPage() {
  const [checks, setChecks] = useState<DiagnosticCheck[]>([]); const [summary, setSummary] = useState({passed:0,total:0}); const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/admin/ai-diagnostics").then(r=>r.json()).then(d=>{setChecks(d.checks||[]);setSummary(d.summary||{});setLoading(false)}).catch(()=>setLoading(false)) }, [])
  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">AI Diagnostics</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>System diagnostic checks · {summary.passed}/{summary.total} passed</p></div>
      {loading ? <div className="text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</div>
      : <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
          {checks.map(c => (
            <div key={c.name} className="flex items-center justify-between px-4 py-3 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor:c.status==="passed"?"#DC2626":c.status==="failed"?"#EF4444":"#EF4444"}}/>
                <div><span style={{color:"rgba(255,255,255,0.8)"}}>{c.name}</span><span className="ml-2 text-[10px]" style={{color:"rgba(255,255,255,0.3)"}}>{c.details}</span></div>
              </div>
              <div className="flex items-center gap-3">
                <span style={{color:c.status==="passed"?"#DC2626":"#EF4444"}}>{c.status}</span>
                <span style={{color:"rgba(255,255,255,0.3)"}}>{c.duration}</span>
              </div>
            </div>
          ))}
        </div>}
    </div>
  )
}

