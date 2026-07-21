"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

  if (loading) return <div className="space-y-4 animate-pulse p-6"><div className="bg-muted h-8 w-48 rounded" /><div className="bg-muted h-80 rounded-xl" /></div>

  const DataTable = ({headers,rows,renderRow}:{headers:string[];rows:any[];renderRow:(r:any)=>any[]}) => (
    <Card><div className="rounded-md border"><Table><TableHeader><TableRow>{headers.map(h=><TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
    <TableBody>
      {rows.length===0
        ? <TableRow><TableCell colSpan={headers.length} className="h-24 text-center text-muted-foreground">No data</TableCell></TableRow>
        : rows.map((r,i)=><TableRow key={i}>{renderRow(r).map((v,j)=><TableCell key={j}>{v}</TableCell>)}</TableRow>)}
    </TableBody></Table></div></Card>
  )

  return (
    <div className="space-y-6 p-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Enterprise Services</h1><p className="text-sm text-muted-foreground mt-1">15 platform services</p></div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="notifications">Notifications{notifications.filter(n=>!n.readAt).length>0&&` (${notifications.filter(n=>!n.readAt).length})`}</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="email">Email{emailStats?.failed?` (${emailStats.failed})`:""}</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="push">Push</TabsTrigger>
          <TabsTrigger value="ocr">OCR</TabsTrigger>
          <TabsTrigger value="pdf">PDF</TabsTrigger>
          <TabsTrigger value="excel">Excel</TabsTrigger>
          <TabsTrigger value="imports">Imports</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">In-App Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {notifications.slice(0,10).map(n => (
                <div key={n.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/30 text-sm">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor:n.readAt?"var(--muted-foreground)":"var(--primary)"}}/>
                  <div className="flex-1"><div className="font-medium">{n.title}</div><div className="text-xs text-muted-foreground">{n.body}</div></div>
                  <span className="text-xs text-muted-foreground">{n.createdAt?.substring(0,10)||""}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Activity Stream (last 10)</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {activity.slice(0,10).map((a:any,i:number) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2 text-sm border-b last:border-0">
                  <span className="text-muted-foreground">{a.timestamp?.substring(0,10)||""}</span>
                  <span className="font-medium">{a.action}</span>
                  <span className="text-muted-foreground">{a.entity}</span>
                  <span className="text-muted-foreground text-xs">{a.actor}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <DataTable headers={["Title","Body","Status","Date"]} rows={notifications}
            renderRow={(n:any)=>[n.title,n.body||"",n.readAt?"read":"new",n.createdAt?.substring(0,10)]} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <DataTable headers={["Date","Action","Entity","Actor"]} rows={activity}
            renderRow={(a:any)=>[a.timestamp?.substring(0,10),a.action,a.entity,a.actor]} />
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[{l:"Total Sent",v:emailStats?.sent||0},{l:"Failed",v:emailStats?.failed||0},{l:"Delivery Rate",v:`${emailStats?.rate||0}%`}].map(s=>(
              <Card key={s.l} className="bg-gradient-to-t from-primary/5 to-card"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{s.l}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{s.v}</div></CardContent></Card>
            ))}
          </div>
          <DataTable headers={["To","Subject","Status","Date"]} rows={emailLogs}
            renderRow={(e:any)=>[e.to,e.subject,e.status,e.createdAt?.substring(0,10)]} />
        </TabsContent>

        <TabsContent value="sms" className="space-y-4">
          <DataTable headers={["To","Message","Status","Date"]} rows={smsLogs}
            renderRow={(s:any)=>[s.to,s.message?.substring(0,40),s.status,s.createdAt?.substring(0,10)]} />
        </TabsContent>

        <TabsContent value="push" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[{l:"Total Sent",v:pushStats?.sent||0},{l:"Failed",v:pushStats?.failed||0}].map(s=>(
              <Card key={s.l} className="bg-gradient-to-t from-primary/5 to-card"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{s.l}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{s.v}</div></CardContent></Card>
            ))}
          </div>
          <DataTable headers={["Title","Body","Status","Date"]} rows={pushLogs}
            renderRow={(p:any)=>[p.title,p.body?.substring(0,40),p.status,p.createdAt?.substring(0,10)]} />
        </TabsContent>

        <TabsContent value="ocr" className="space-y-4">
          <DataTable headers={["ID","File","Status","Pages"]} rows={ocrJobs}
            renderRow={(o:any)=>[o.id?.substring(0,8),o.filename,o.status,o.pages]} />
        </TabsContent>

        <TabsContent value="pdf" className="space-y-4">
          <DataTable headers={["ID","File","Status","Pages"]} rows={pdfJobs}
            renderRow={(p:any)=>[p.id?.substring(0,8),p.filename,p.status,p.pages]} />
        </TabsContent>

        <TabsContent value="excel" className="space-y-4">
          <DataTable headers={["ID","File","Status","Rows"]} rows={excelJobs}
            renderRow={(e:any)=>[e.id?.substring(0,8),e.filename,e.status,e.rows]} />
        </TabsContent>

        <TabsContent value="imports" className="space-y-4">
          <DataTable headers={["ID","File","Status","Progress"]} rows={imports}
            renderRow={(i:any)=>[i.id?.substring(0,8),i.filename,i.status,i.progress?`${i.progress}%`:""]} />
        </TabsContent>

        <TabsContent value="exports" className="space-y-4">
          <DataTable headers={["ID","Format","Status","Date"]} rows={exports}
            renderRow={(e:any)=>[e.id?.substring(0,8),e.format,e.status,e.createdAt?.substring(0,10)]} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
