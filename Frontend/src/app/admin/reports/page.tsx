"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminReportsPage() {
  const [tab, setTab] = useState("overview")
  const [operational, setOperational] = useState<any>(null)
  const [financial, setFinancial] = useState<any>(null)
  const [executive, setExecutive] = useState<any>(null)
  const [consumption, setConsumption] = useState<any>(null)
  const [variance, setVariance] = useState<any>(null)
  const [aging, setAging] = useState<any[]>([])
  const [kpis, setKpis] = useState<any[]>([])
  const [exports, setExports] = useState<any[]>([])
  const [scheduled, setScheduled] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/reports/operational").then(r=>r.json()).catch(()=>({})),
      fetch("/api/reports/financial").then(r=>r.json()).catch(()=>({})),
      fetch("/api/reports/executive").then(r=>r.json()).catch(()=>({})),
      fetch("/api/reports/consumption").then(r=>r.json()).catch(()=>({})),
      fetch("/api/reports/variance").then(r=>r.json()).catch(()=>({})),
      fetch("/api/reports/aging").then(r=>r.json()).catch(()=>({buckets:[]})),
      fetch("/api/reports/kpi").then(r=>r.json()).catch(()=>({kpis:[]})),
      fetch("/api/reports/export").then(r=>r.json()).catch(()=>({exports:[]})),
      fetch("/api/reports/scheduled").then(r=>r.json()).catch(()=>({reports:[]})),
    ]).then(([op,fi,ex,co,va,ag,kp,ep,sc]) => {
      setOperational(op); setFinancial(fi); setExecutive(ex); setConsumption(co)
      setVariance(va); setAging(ag.buckets||[]); setKpis(kp.kpis||[])
      setExports(ep.exports||[]); setScheduled(sc.reports||[])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-4 animate-pulse p-6"><div className="bg-muted h-8 w-48 rounded" /><div className="bg-muted h-80 rounded-xl" /></div>

  const MetricCard = ({label,value,sub}:{label:string;value:string;sub?:string}) => (
    <Card className="bg-gradient-to-t from-primary/5 to-card">
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent><div className="text-2xl font-bold">{value}</div>{sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}</CardContent>
    </Card>
  )

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
      <div><h1 className="text-2xl font-bold tracking-tight">Reports &amp; Analytics</h1><p className="text-sm text-muted-foreground mt-1">9 reporting capabilities</p></div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Executive Dashboard</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
          <TabsTrigger value="variance">Variance</TabsTrigger>
          <TabsTrigger value="aging">Aging</TabsTrigger>
          <TabsTrigger value="kpi">KPIs</TabsTrigger>
          <TabsTrigger value="export">Export Center</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Total Meters" value={(executive?.metrics?.totalMeters||0).toLocaleString()} />
            <MetricCard label="Total Customers" value={(executive?.metrics?.totalCustomers||0).toLocaleString()} />
            <MetricCard label="Readings (MTD)" value={(executive?.metrics?.monthReadings||0).toLocaleString()} sub="This month" />
            <MetricCard label="Revenue (MTD)" value={`EGP ${(executive?.metrics?.monthRevenue||0).toLocaleString()}`} sub="This month" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <MetricCard label="Total Readings" value={(executive?.metrics?.totalReadings||0).toLocaleString()} />
            <MetricCard label="Total Invoices" value={(executive?.metrics?.totalInvoices||0).toLocaleString()} />
            <MetricCard label="Invoices (MTD)" value={(executive?.metrics?.monthInvoices||0).toLocaleString()} sub="This month" />
          </div>
        </TabsContent>

        <TabsContent value="operational" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Active Meters" value={(operational?.summary?.activeMeters||0).toLocaleString()} />
            <MetricCard label="Pending Readings" value={(operational?.summary?.pendingReadings||0).toLocaleString()} sub="Unbilled" />
            <MetricCard label="Validation Rate" value={`${operational?.summary?.validationRate||0}%`} />
            <MetricCard label="Collection Rate" value={`${operational?.summary?.collectionRate||0}%`} />
          </div>
          {operational?.recentReadings?.length > 0 && (
            <DataTable headers={["Meter","Reading","Date","Status"]} rows={operational.recentReadings}
              renderRow={(r:any)=>[r.meterId?.substring(0,8)||"—",r.value?.toLocaleString(),r.timestamp?.substring(0,10),r.status]} />
          )}
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Total Revenue" value={`EGP ${(financial?.summary?.totalRevenue||0).toLocaleString()}`} />
            <MetricCard label="Outstanding" value={`EGP ${(financial?.summary?.outstanding||0).toLocaleString()}`} />
            <MetricCard label="Collection Rate" value={`${financial?.summary?.collectionRate||0}%`} />
            <MetricCard label="Avg Invoice" value={`EGP ${(financial?.summary?.avgInvoice||0).toLocaleString()}`} />
          </div>
          {financial?.recentInvoices?.length > 0 && (
            <DataTable headers={["Invoice","Customer","Amount","Status","Date"]} rows={financial.recentInvoices}
              renderRow={(r:any)=>[r.id?.substring(0,8)||"—",r.customerName||"—",`EGP ${(r.amount||0).toLocaleString()}`,r.status,r.createdAt?.substring(0,10)]} />
          )}
        </TabsContent>

        <TabsContent value="consumption" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <MetricCard label="Avg Daily Consumption" value={`${consumption?.summary?.avgDaily||0} kWh`} />
            <MetricCard label="Peak Day" value={`${consumption?.summary?.peakDay||0} kWh`} />
            <MetricCard label="Lowest Day" value={`${consumption?.summary?.lowestDay||0} kWh`} />
          </div>
        </TabsContent>

        <TabsContent value="variance" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Projected Revenue" value={`EGP ${(variance?.summary?.projected||0).toLocaleString()}`} />
            <MetricCard label="Actual Revenue" value={`EGP ${(variance?.summary?.actual||0).toLocaleString()}`} />
            <MetricCard label="Variance" value={`EGP ${(variance?.summary?.variance||0).toLocaleString()}`} />
            <MetricCard label="Variance %" value={`${variance?.summary?.variancePercent||0}%`} />
          </div>
        </TabsContent>

        <TabsContent value="aging" className="space-y-4">
          {aging.length > 0 ? (
            <DataTable headers={["Bucket","Count","Amount"]} rows={aging}
              renderRow={(r:any)=>[r.bucket,r.count||0,`EGP ${(r.amount||0).toLocaleString()}`]} />
          ) : <Card><CardContent className="py-8 text-center text-muted-foreground">No aging data</CardContent></Card>}
        </TabsContent>

        <TabsContent value="kpi" className="space-y-4">
          {kpis.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {kpis.map((k:any,i:number)=>(
                <MetricCard key={i} label={k.name} value={`${k.value}${k.unit||""}`} sub={k.description} />
              ))}
            </div>
          ) : <Card><CardContent className="py-8 text-center text-muted-foreground">No KPI data</CardContent></Card>}
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          {exports.length >0 ? (
            <DataTable headers={["Name","Format","Status","Created"]} rows={exports}
              renderRow={(r:any)=>[r.name,r.format,r.status,r.createdAt?.substring(0,10)]} />
          ) : <Card><CardContent className="py-8 text-center text-muted-foreground">No export data</CardContent></Card>}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {scheduled.length >0 ? (
            <DataTable headers={["Name","Frequency","Next Run","Status"]} rows={scheduled}
              renderRow={(r:any)=>[r.name,r.frequency,r.nextRun?.substring(0,10),r.status]} />
          ) : <Card><CardContent className="py-8 text-center text-muted-foreground">No scheduled reports</CardContent></Card>}
        </TabsContent>
      </Tabs>
    </div>
  )
}
