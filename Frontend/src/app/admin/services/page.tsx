"use client"

import { useState, useEffect } from "react"

export default function AdminServicesPage() {
  const [tab, setTab] = useState("all")
  const [notifications, setNotifications] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [emailStats, setEmailStats] = useState<any>(null)
  const [emailLogs, setEmailLogs] = useState<any[]>([])
  const [smsLogs, setSmsLogs] = useState<any[]>([])
  const [pushLogs, setPushLogs] = useState<any[]>([])
  const [pushStats, setPushStats] = useState<any>(null)
  const [imports, setImports] = useState<any[]>([])
  const [exports, setExports] = useState<any[]>([])
  const [ocrJobs, setOcrJobs] = useState<any[]>([])
  const [pdfJobs, setPdfJobs] = useState<any[]>([])
  const [excelJobs, setExcelJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/services/notifications").then(r=>r.json()).catch(()=>({notifications:[]})),
      fetch("/api/services/activity").then(r=>r.json()).catch(()=>({entries:[]})),
      fetch("/api/services/email").then(r=>r.json()).catch(()=>({logs:[],stats:{}})),
      fetch("/api/services/sms").then(r=>r.json()).catch(()=>({logs:[]})),
      fetch("/api/services/push").then(r=>r.json()).catch(()=>({notifications:[],stats:{}})),
      fetch("/api/services/imports").then(r=>r.json()).catch(()=>({jobs:[]})),
      fetch("/api/services/exports").then(r=>r.json()).catch(()=>({jobs:[]})),
      fetch("/api/services/ocr").then(r=>r.json()).catch(()=>({jobs:[]})),
      fetch("/api/services/pdf").then(r=>r.json()).catch(()=>({jobs:[]})),
      fetch("/api/services/excel").then(r=>r.json()).catch(()=>({jobs:[]})),
    ]).then(([n,a,e,s,p,i,ex,o,pdf,exc]) => {
      setNotifications(n.notifications||[]); setActivity(a.entries||[])
      setEmailStats(e.stats||{}); setEmailLogs(e.logs||[])
      setSmsLogs(s.logs||[]); setPushLogs(p.notifications||[]); setPushStats(p.stats||{})
      setImports(i.jobs||[]); setExports(ex.jobs||[])
      setOcrJobs(o.jobs||[]); setPdfJobs(pdf.jobs||[]); setExcelJobs(exc.jobs||[])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const tabs = [
    { id:"all", label:"All Services" },
    { id:"notifications", label:"Notifications", count: notifications.filter(n=>!n.readAt).length },
    { id:"activity", label:"Activity" },
    { id:"email", label:"Email", count: emailStats?.failed },
    { id:"sms", label:"SMS" },
    { id:"push", label:"Push" },
    { id:"ocr", label:"OCR" },
    { id:"pdf", label:"PDF" },
    { id:"excel", label:"Excel" },
    { id:"imports", label:"Imports" },
    { id:"exports", label:"Exports" },
  ]

  if (loading) return <div className="p-6 text-xs" style={{color:"rgba(255,255,255,0.3)"}}>Loading...</div>

  const TabButton = ({id,label,count}:{id:string;label:string;count?:number}) => (
    <button onClick={()=>setTab(id)} className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize flex items-center gap-1.5"
      style={{backgroundColor:tab===id?"var(--status-error)":"var(--admin-surface)",color:tab===id?"white":"rgba(255,255,255,0.5)",border:tab===id?"none":"1px solid var(--admin-border)"}}>
      {label}{count?<span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px]" style={{backgroundColor:"rgba(239,68,68,0.2)",color:"#EF4444"}}>{count}</span>:null}
    </button>
  )

  const renderTable = (headers: string[], rows: any[], renderRow: (item:any) => string[]) => (
    <table className="w-full"><thead><tr style={{backgroundColor:"var(--admin-surface)"}}>
      {headers.map(h=>(<th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{color:"rgba(255,255,255,0.4)",borderBottom:"1px solid var(--admin-border)"}}>{h}</th>))}
    </tr></thead><tbody>
      {rows.map((r,i)=>(
        <tr key={i}>{renderRow(r).map((v,j)=>(
          <td key={j} className="px-4 py-3 text-sm" style={{color:"rgba(255,255,255,0.7)",borderBottom:"1px solid var(--admin-border)"}}>{v}</td>
        ))}</tr>
      ))}
      {rows.length===0&&<tr><td colSpan={headers.length} className="px-4 py-8 text-center text-xs" style={{color:"rgba(255,255,255,0.3)"}}>No data</td></tr>}
    </tbody></table>
  )

  return (
    <div className="p-6 space-y-4">
      <div><h1 className="text-lg font-semibold text-white">Enterprise Services</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>15 platform services</p></div>
      
      <div className="flex gap-1 pb-2 flex-wrap">
        {tabs.map(t => <TabButton key={t.id} {...t} />)}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
        {(tab==="all"||tab==="notifications") && <>
          <div className="px-4 py-3 border-b text-xs font-semibold" style={{borderColor:"var(--admin-border)",color:"rgba(255,255,255,0.7)"}}>In-App Notifications</div>
          {notifications.slice(0,10).map(n => (
            <div key={n.id} className="flex items-center gap-3 px-4 py-3 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor:n.readAt?"rgba(255,255,255,0.15)":"#EF4444"}}/>
              <div className="flex-1"><div style={{color:"rgba(255,255,255,0.8)"}}>{n.title}</div><div className="text-[10px]" style={{color:"rgba(255,255,255,0.3)"}}>{n.body}</div></div>
              <span style={{color:"rgba(255,255,255,0.3)"}}>{n.createdAt?.substring(0,10)||""}</span>
            </div>
          ))}
        </>}

        {(tab==="all"||tab==="activity") && <>
          <div className="px-4 py-3 border-b text-xs font-semibold" style={{borderColor:"var(--admin-border)",color:"rgba(255,255,255,0.7)"}}>Activity Stream (last 10)</div>
          {activity.slice(0,10).map(a => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-2 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{backgroundColor:a.severity==="error"?"#EF4444":a.severity==="warn"?"#EF4444":"#DC2626"}}/>
              <span className="w-20 shrink-0 font-mono text-[10px]" style={{color:"rgba(255,255,255,0.3)"}}>{a.createdAt?.substring(11,19)||""}</span>
              <span className="w-20 shrink-0 truncate" style={{color:"rgba(255,255,255,0.5)"}}>{a.actor||"system"}</span>
              <span className="flex-1 truncate" style={{color:"rgba(255,255,255,0.7)"}}>{a.action}</span>
            </div>
          ))}
        </>}

        {(tab==="all"||tab==="email") && <>
          <div className="grid grid-cols-3 gap-3 p-4">
            {[{l:"Sent",v:emailStats?.sent||0,c:"#DC2626"},{l:"Failed",v:emailStats?.failed||0,c:"#EF4444"},{l:"Total",v:emailStats?.total||0,c:"#DC2626"}].map(s=>(
              <div key={s.l} className="rounded-lg border p-3" style={{borderColor:"var(--admin-border)"}}><div className="text-[10px]" style={{color:"rgba(255,255,255,0.4)"}}>{s.l}</div><div className="text-lg font-bold tabular-nums" style={{color:s.c}}>{s.v}</div></div>
            ))}
          </div>
          {emailLogs.slice(0,10).map(l => (
            <div key={l.id} className="flex items-center gap-3 px-4 py-2 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
              <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:l.status==="sent"?"#DC2626":"#EF4444"}}/>
              <span className="w-28 truncate font-mono" style={{color:"rgba(255,255,255,0.5)"}}>{l.to}</span>
              <span className="flex-1 truncate" style={{color:"rgba(255,255,255,0.7)"}}>{l.subject}</span>
            </div>
          ))}
        </>}

        {(tab==="all"||tab==="sms") && <>{smsLogs.slice(0,10).map(l => (
          <div key={l.id} className="flex items-center gap-3 px-4 py-2 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
            <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:l.status==="sent"?"#DC2626":"#EF4444"}}/>
            <span className="w-28 truncate font-mono" style={{color:"rgba(255,255,255,0.5)"}}>{l.to}</span>
            <span className="flex-1 truncate" style={{color:"rgba(255,255,255,0.7)"}}>{l.message}</span>
          </div>
        ))}</>}

        {(tab==="all"||tab==="push") && <>
          <div className="grid grid-cols-3 gap-3 p-4">
            {[{l:"Sent",v:pushStats?.sent||0,c:"#DC2626"},{l:"Failed",v:pushStats?.failed||0,c:"#EF4444"},{l:"Total",v:pushStats?.total||0,c:"#DC2626"}].map(s=>(
              <div key={s.l} className="rounded-lg border p-3" style={{borderColor:"var(--admin-border)"}}><div className="text-[10px]" style={{color:"rgba(255,255,255,0.4)"}}>{s.l}</div><div className="text-lg font-bold tabular-nums" style={{color:s.c}}>{s.v}</div></div>
            ))}
          </div>
          {pushLogs.slice(0,10).map(l => (
            <div key={l.id} className="flex items-center gap-3 px-4 py-2 border-b text-xs" style={{borderColor:"var(--admin-border)"}}>
              <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:l.status==="sent"?"#DC2626":"#EF4444"}}/>
              <span style={{color:"rgba(255,255,255,0.7)"}}>{l.title}</span>
              <span className="flex-1 truncate" style={{color:"rgba(255,255,255,0.5)"}}>{l.body}</span>
            </div>
          ))}
        </>}

        {(tab==="all"||tab==="ocr") && renderTable(["File","Status","Confidence","Result","Date"], ocrJobs.slice(0,10), j=>[j.fileName,j.status,j.confidence?`${(j.confidence*100).toFixed(0)}%`:"—",j.result?.substring(0,30)||"—",j.createdAt?.substring(0,10)||""])}

        {(tab==="all"||tab==="pdf") && renderTable(["Type","Template","Status","File","Date"], pdfJobs.slice(0,10), j=>[j.type,j.template||"—",j.status,j.filePath||"—",j.createdAt?.substring(0,10)||""])}

        {(tab==="all"||tab==="excel") && renderTable(["Type","Format","Status","Rows","File","Date"], excelJobs.slice(0,10), j=>[j.type,j.format?.toUpperCase(),j.status,j.totalRows||0,j.filePath||"—",j.createdAt?.substring(0,10)||""])}

        {(tab==="all"||tab==="imports") && renderTable(["Type","File","Status","Progress","Errors","Date"], imports.slice(0,10), j=>[j.type,j.fileName||"—",j.status,`${j.processed||0}/${j.totalRows||0}`,j.failed||"0",j.createdAt?.substring(0,10)||""])}

        {(tab==="all"||tab==="exports") && renderTable(["Type","Format","Status","Rows","File","Date"], exports.slice(0,10), j=>[j.type,j.format?.toUpperCase(),j.status,j.totalRows||0,j.filePath||"—",j.createdAt?.substring(0,10)||""])}
      </div>
    </div>
  )
}

