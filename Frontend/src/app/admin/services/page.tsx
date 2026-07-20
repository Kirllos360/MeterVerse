"use client"

import { useState, useEffect } from "react"

export default function AdminServicesPage() {
  const [tab, setTab] = useState("notifications")
  const [notifications, setNotifications] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [emailStats, setEmailStats] = useState<any>(null)
  const [emailLogs, setEmailLogs] = useState<any[]>([])
  const [smsLogs, setSmsLogs] = useState<any[]>([])
  const [imports, setImports] = useState<any[]>([])
  const [exports, setExports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/services/notifications").then(r=>r.json()),
      fetch("/api/services/activity").then(r=>r.json()),
      fetch("/api/services/email").then(r=>r.json()),
      fetch("/api/services/sms").then(r=>r.json()),
      fetch("/api/services/imports").then(r=>r.json()),
      fetch("/api/services/exports").then(r=>r.json()),
    ]).then(([n,a,e,s,i,ex]) => {
      setNotifications(n.notifications||[]); setActivity(a.entries||[])
      setEmailStats(e.stats||{}); setEmailLogs(e.logs||[])
      setSmsLogs(s.logs||[]); setImports(i.jobs||[]); setExports(ex.jobs||[])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const tabs = [
    { id: "notifications", label: "Notifications", count: notifications.filter(n=>!n.readAt).length },
    { id: "activity", label: "Activity Stream" },
    { id: "email", label: "Email", count: emailStats?.failed },
    { id: "sms", label: "SMS" },
    { id: "imports", label: "Imports" },
    { id: "exports", label: "Exports" },
  ]

  if (loading) return <div className="p-6 text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</div>

  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Enterprise Services</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Platform-wide service monitoring</p></div>
      
      <div className="flex gap-1 pb-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize flex items-center gap-1.5"
            style={{backgroundColor:tab===t.id?"var(--status-error)":"var(--admin-surface)",color:tab===t.id?"white":"rgba(255,255,255,0.5)",border:tab===t.id?"none":"1px solid var(--admin-border)"}}>
            {t.label}{t.count?<span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px]" style={{backgroundColor:"rgba(239,68,68,0.2)",color:"#EF4444"}}>{t.count}</span>:null}
          </button>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        {tab === "notifications" && <>
          <div className="px-4 py-3 border-b text-xs font-semibold" style={{borderColor:"var(--admin-border)",color:"rgba(255,255,255,0.7)"}}>In-App Notifications</div>
          {notifications.map(n => (
            <div key={n.id} className="flex items-center gap-3 px-4 py-3 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor:n.readAt?"rgba(255,255,255,0.15)" : "#EF4444"}}/>
              <div className="flex-1"><div className="font-medium" style={{color:"rgba(255,255,255,0.8)"}}>{n.title}</div><div className="text-[10px]" style={{color:"rgba(255,255,255,0.3)"}}>{n.body}</div></div>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{backgroundColor:n.channel==="email"?"rgba(59,130,246,0.1)":"rgba(34,197,94,0.1)",color:n.channel==="email"?"#3B82F6":"#22C55E"}}>{n.channel}</span>
              <span style={{color:"rgba(255,255,255,0.3)"}}>{new Date(n.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </>}

        {tab === "activity" && <>
          <div className="px-4 py-3 border-b text-xs font-semibold" style={{borderColor:"var(--admin-border)",color:"rgba(255,255,255,0.7)"}}>Activity Stream</div>
          {activity.map(a => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-2 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{backgroundColor:a.severity==="error"?"#EF4444":a.severity==="warn"?"#F59E0B":"#22C55E"}}/>
              <span className="w-24 shrink-0 font-mono text-[10px]" style={{color:"rgba(255,255,255,0.3)"}}>{new Date(a.createdAt).toLocaleTimeString()}</span>
              <span className="w-24 shrink-0 truncate" style={{color:"rgba(255,255,255,0.5)"}}>{a.actor||"system"}</span>
              <span className="flex-1 truncate" style={{color:"rgba(255,255,255,0.7)"}}>{a.action}</span>
              {a.resource&&<span className="text-[10px] font-mono" style={{color:"rgba(255,255,255,0.3)"}}>{a.resource}</span>}
            </div>
          ))}
        </>}

        {tab === "email" && <>
          <div className="grid grid-cols-3 gap-3 p-4">
            {[{l:"Total Sent",v:emailStats?.sent||0,c:"#22C55E"},{l:"Failed",v:emailStats?.failed||0,c:"#EF4444"},{l:"Total",v:emailStats?.total||0,c:"#3B82F6"}].map(s=>(<div key={s.l} className="rounded-lg border p-3" style={{borderColor:"var(--admin-border)"}}><div className="text-[10px]" style={{color:"rgba(255,255,255,0.4)"}}>{s.l}</div><div className="text-lg font-bold tabular-nums" style={{color:s.c}}>{s.v}</div></div>))}
          </div>
          {emailLogs.map(l => (
            <div key={l.id} className="flex items-center gap-3 px-4 py-2 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
              <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:l.status==="sent"?"#22C55E":"#EF4444"}}/>
              <span className="w-32 truncate font-mono" style={{color:"rgba(255,255,255,0.5)"}}>{l.to}</span>
              <span className="flex-1 truncate" style={{color:"rgba(255,255,255,0.7)"}}>{l.subject}</span>
              <span style={{color:"rgba(255,255,255,0.3)"}}>{l.sentAt?new Date(l.sentAt).toLocaleString():"—"}</span>
            </div>
          ))}
        </>}

        {tab === "sms" && <>{smsLogs.map(l => (
          <div key={l.id} className="flex items-center gap-3 px-4 py-2 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
            <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:l.status==="sent"?"#22C55E":"#EF4444"}}/>
            <span className="w-32 truncate font-mono" style={{color:"rgba(255,255,255,0.5)"}}>{l.to}</span>
            <span className="flex-1 truncate" style={{color:"rgba(255,255,255,0.7)"}}>{l.message}</span>
            <span style={{color:"rgba(255,255,255,0.3)"}}>{l.sentAt?new Date(l.sentAt).toLocaleString():"—"}</span>
          </div>
        ))}</>}

        {tab === "imports" && <table className="w-full"><thead><tr style={{backgroundColor:"var(--admin-surface)"}}>
          {["Type","File","Status","Progress","Errors","Created"].map(h=>(<th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{h}</th>))}
        </tr></thead><tbody>
          {imports.map(j => (
            <tr key={j.id}><td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.7)"}}>{j.type}</td>
            <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.5)"}}>{j.fileName||"—"}</td>
            <td className="px-4 py-3 text-sm"><span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{backgroundColor:j.status==="completed"?"rgba(34,197,94,0.1)":j.status==="failed"?"rgba(239,68,68,0.1)":"rgba(245,158,11,0.1)",color:j.status==="completed"?"#22C55E":j.status==="failed"?"#EF4444":"#F59E0B"}}>{j.status}</span></td>
            <td className="px-4 py-3 text-sm tabular-nums" style={{color:"rgba(255,255,255,0.5)"}}>{j.processed}/{j.totalRows}</td>
            <td className="px-4 py-3 text-sm" style={{color:j.failed>0?"#EF4444":"rgba(255,255,255,0.3)"}}>{j.failed||0}</td>
            <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.4)"}}>{new Date(j.createdAt).toLocaleDateString()}</td></tr>
          ))}
        </tbody></table>}

        {tab === "exports" && <table className="w-full"><thead><tr style={{backgroundColor:"var(--admin-surface)"}}>
          {["Type","Format","Status","Rows","File","Created"].map(h=>(<th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{h}</th>))}
        </tr></thead><tbody>
          {exports.map(j => (
            <tr key={j.id}><td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.7)"}}>{j.type}</td>
            <td className="px-4 py-3 text-sm uppercase" style={{color:"rgba(255,255,255,0.5)"}}>{j.format}</td>
            <td className="px-4 py-3 text-sm"><span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{backgroundColor:j.status==="completed"?"rgba(34,197,94,0.1)":"rgba(245,158,11,0.1)",color:j.status==="completed"?"#22C55E":"#F59E0B"}}>{j.status}</span></td>
            <td className="px-4 py-3 text-sm tabular-nums" style={{color:"rgba(255,255,255,0.5)"}}>{j.totalRows}</td>
            <td className="px-4 py-3 text-sm font-mono" style={{color:"rgba(255,255,255,0.5)"}}>{j.filePath||"—"}</td>
            <td className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.4)"}}>{new Date(j.createdAt).toLocaleDateString()}</td></tr>
          ))}
        </tbody></table>}
      </div>
    </div>
  )
}
