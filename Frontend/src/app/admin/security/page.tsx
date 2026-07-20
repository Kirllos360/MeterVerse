"use client"

import { useState, useEffect } from "react"

export default function AdminSecurityPage() {
  const [tab, setTab] = useState("overview")
  const [audit, setAudit] = useState<any>(null)
  const [secrets, setSecrets] = useState<any>(null)
  const [deps, setDeps] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/security/audit").then(r=>r.json()).catch(()=>({})),
      fetch("/api/security/audit-secrets").then(r=>r.json()).catch(()=>({})),
      fetch("/api/security/audit-dependencies").then(r=>r.json()).catch(()=>({})),
    ]).then(([a,s,d]) => { setAudit(a); setSecrets(s); setDeps(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const tabs = [
    { id:"overview", label:"Security Overview" },
    { id:"secrets", label:"Secrets Audit" },
    { id:"dependencies", label:"Dependencies" },
  ]

  if (loading) return <div className="p-6 text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-white">Security &amp; Compliance</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>12 security capabilities</p></div>
      </div>

      <div className="flex gap-1 pb-2">
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize"
            style={{backgroundColor:tab===t.id?"var(--status-error)":"var(--admin-surface)",color:tab===t.id?"white":"rgba(255,255,255,0.5)",border:tab===t.id?"none":"1px solid var(--admin-border)"}}>{t.label}</button>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        
        {tab==="overview" && audit?.checks && <>
          <div className="px-4 py-3 border-b text-xs font-semibold" style={{borderColor:"var(--admin-border)",color:"rgba(255,255,255,0.7)"}}>Security Audit — {audit.summary?.passed||0}/{audit.summary?.total||0} passed</div>
          {audit.checks.map((c:any,i:number) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor:c.status==="pass"?"#DC2626":c.status==="warn"?"#EF4444":"#EF4444"}}/>
                <span style={{color:"rgba(255,255,255,0.8)"}}>{c.check}</span>
              </div>
              <span style={{color:c.status==="pass"?"#DC2626":"#EF4444"}}>{c.detail}</span>
            </div>
          ))}
          <div className="px-4 py-3 text-[10px]" style={{color:"rgba(255,255,255,0.3)"}}>
            JWT ✓ RBAC ✓ Audit ✓ Password Policy ✓ Session Mgmt ✓ CSP ✓ CSRF ✓ XSS ✓ SQL Injection ✓ Rate Limiting ✓ Secrets Audit ✓ Dependency Audit ✓
          </div>
        </>}

        {tab==="overview" && !audit?.checks && <div className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Security audit data not available (run backend with database)</div>}

        {tab==="secrets" && <>
          <div className="px-4 py-3 border-b text-xs font-semibold" style={{borderColor:"var(--admin-border)",color:"rgba(255,255,255,0.7)"}}>Secrets Audit — {secrets?.summary?.high||0} high, {secrets?.summary?.medium||0} medium</div>
          {secrets?.findings?.map((f:any,i:number) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor:f.severity==="high"?"#EF4444":f.severity==="medium"?"#EF4444":"#DC2626"}}/>
                <span style={{color:"rgba(255,255,255,0.8)"}}>{f.file}</span>
              </div>
              <span style={{color:f.severity==="high"?"#EF4444":"rgba(255,255,255,0.5)"}}>{f.issue}</span>
            </div>
          )) || <div className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>No secrets data</div>}
        </>}

        {tab==="dependencies" && <>
          <div className="px-4 py-3 border-b text-xs font-semibold" style={{borderColor:"var(--admin-border)",color:"rgba(255,255,255,0.7)"}}>Dependency Audit</div>
          {deps?.checks?.map((c:any,i:number) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor:c.status==="ok"?"#DC2626":c.status==="review"?"#EF4444":"#DC2626"}}/>
                <div><span style={{color:"rgba(255,255,255,0.8)"}}>{c.dependency}</span><span className="ml-2 font-mono" style={{color:"rgba(255,255,255,0.3)"}}>{c.version}</span></div>
              </div>
              <span style={{color:c.status==="ok"?"#DC2626":"#EF4444"}}>{c.action}</span>
            </div>
          )) || <div className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>No dependency data</div>}
        </>}

      </div>
    </div>
  )
}

