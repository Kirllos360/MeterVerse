"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

  if (loading) return <div className="space-y-4 animate-pulse p-6"><div className="bg-muted h-8 w-48 rounded" /><div className="bg-muted h-80 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Monitoring &amp; Observability</h1>
        <p className="text-sm text-muted-foreground mt-1">Prometheus · Health · Performance · Audit · Analytics</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Health Dashboard</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="audit">Audit Explorer</TabsTrigger>
          <TabsTrigger value="analytics">Business Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {deep?.checks?.map((c: any,i: number) => (
              <Card key={i} className="bg-gradient-to-t from-primary/5 to-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{c.name}</CardTitle>
                  <Badge variant={c.status==="healthy"?"default":"secondary"}>{c.status}</Badge>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1">
                  {c.latency && <div>Latency: {c.latency}</div>}
                  {c.stuckJobs !== undefined && <div>Stuck jobs: {c.stuckJobs}</div>}
                  {c.expiredSessions !== undefined && <div>Expired sessions: {c.expiredSessions}</div>}
                  {c.files !== undefined && <div>Files: {c.files}</div>}
                  {c.errors !== undefined && <div>Errors (24h): {c.errors}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="flex items-center justify-between py-4 text-sm">
              <span className="text-muted-foreground">Overall Status: <span className="font-semibold" style={{color:deep?.status==="healthy"?"var(--status-success, #059669)":"var(--status-error, #DC2626)"}}>{deep?.status?.toUpperCase()}</span></span>
              <span className="text-xs font-mono text-muted-foreground">GET /api/monitor/health/deep · GET /api/monitor/metrics/prometheus</span>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              {l:"Total Readings",v:perf?.summary?.totalReadings||0},
              {l:"Validation Rate",v:`${perf?.summary?.validationRate||0}%`},
              {l:"Total Invoices",v:perf?.summary?.totalInvoices||0},
              {l:"Revenue",v:`EGP ${(perf?.summary?.totalRevenue||0).toLocaleString()}`},
            ].map(s => (
              <Card key={s.l} className="bg-gradient-to-t from-primary/5 to-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.l}</CardTitle>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{s.v}</div></CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              {l:"Today's Readings",v:perf?.today?.readings||0},
              {l:"Today's Invoices",v:perf?.today?.invoices||0},
              {l:"Throughput (30d avg)",v:`${perf?.throughput?.readingsPerDay||0}/day`},
            ].map(s => (
              <Card key={s.l}>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{s.l}</CardTitle></CardHeader>
                <CardContent><div className="text-xl font-bold">{s.v}</div></CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              {l:"Total Entries",v:audit?.stats?.total||0},
              {l:"Failures",v:audit?.stats?.failures||0},
              {l:"Today",v:audit?.stats?.today||0},
            ].map(s => (
              <Card key={s.l} className="bg-gradient-to-t from-primary/5 to-card">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{s.l}</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{s.v}</div></CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <div className="px-4 py-3 border-b text-sm font-medium text-muted-foreground">Recent Audit Entries</div>
            <div className="divide-y">
              {audit?.entries?.slice(0,15).map((e:any) => (
                <div key={e.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor:e.status==="success"?"var(--status-success, #059669)":"var(--status-error, #DC2626)"}}/>
                  <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">{e.timestamp?.substring(11,19)}</span>
                  <span className="w-24 shrink-0 truncate text-muted-foreground">{e.actor||"system"}</span>
                  <span className="flex-1 truncate">{e.action}</span>
                  <span className="w-20 truncate text-xs font-mono text-muted-foreground">{e.resource}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              {l:"New Customers (30d)",v:analytics?.growth?.customers||0},
              {l:"New Meters (30d)",v:analytics?.growth?.meters||0},
              {l:"Readings (30d)",v:analytics?.growth?.readings||0},
              {l:"Invoices (30d)",v:analytics?.growth?.invoices||0},
            ].map(s => (
              <Card key={s.l} className="bg-gradient-to-t from-primary/5 to-card">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{s.l}</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{s.v}</div></CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold">Revenue by Status</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {analytics?.revenue?.map((r:any,i:number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{r.status}</span>
                    <span className="tabular-nums font-medium">EGP {r.amount.toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold">Top Areas by Meters</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {analytics?.topAreas?.map((a:any,i:number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{a.area}</span>
                    <span className="tabular-nums font-medium">{a.count} meters</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
