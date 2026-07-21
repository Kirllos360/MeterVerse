"use client"

import { useState } from "react"
import { GenericAdminPage } from "@/admin/tables/GenericAdminPage"
import { pageConfigs } from "@/admin/tables/page-configs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

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
    <GenericAdminPage config={pageConfigs.crud} renderCustom={() => (
      <div className="space-y-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="overview">Workflows</TabsTrigger>
            <TabsTrigger value="console">Console</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {actions.map(a => (
                <Card key={a.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm font-medium">{a.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                    <div className="text-[10px] mt-2 font-mono text-muted-foreground/60">
                      POST /api/crud/{`{model}`}/{a.id}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardContent className="py-4">
                <p className="text-sm font-medium mb-3 text-muted-foreground">Supported Models</p>
                <div className="flex gap-1 flex-wrap">
                  {models.map(m => <Badge key={m} variant="outline" className="font-mono text-[10px]">{m}</Badge>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="console" className="space-y-6">
            <Card>
              <div className="px-4 py-3 border-b text-sm font-medium text-muted-foreground">CRUD Console</div>
              <CardContent className="space-y-4 pt-4">
                <div>
                  <label className="text-sm text-muted-foreground">Model</label>
                  <select value={modelName} onChange={e=>setModelName(e.target.value)}
                    className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background text-sm">
                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" onClick={()=>execute("export")} disabled={loading}>Export</Button>
                  <Button size="sm" variant="secondary" onClick={()=>execute("import")} disabled={loading}>Import (test)</Button>
                  <Button size="sm" variant="outline" onClick={()=>execute("delete",{id:crypto.randomUUID()})} disabled={loading}>Test Soft Delete</Button>
                  <Button size="sm" variant="ghost" onClick={()=>execute("history",{id:crypto.randomUUID()})} disabled={loading}>Version History</Button>
                  <Button size="sm" variant="secondary" onClick={()=>execute("submit-approval",{id:crypto.randomUUID()})} disabled={loading}>Test Approval</Button>
                </div>
                {loading && <div className="text-sm text-muted-foreground">Executing...</div>}
                {result && (
                  <div className="rounded-lg border p-3 bg-muted/30">
                    <p className="text-xs font-semibold mb-2 text-muted-foreground">Result</p>
                    <pre className="text-xs font-mono whitespace-pre-wrap max-h-60 overflow-y-auto text-muted-foreground">{JSON.stringify(result, null, 2)}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )} />
  )
}
