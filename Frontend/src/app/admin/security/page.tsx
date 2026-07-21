"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

  if (loading) return <div className="space-y-4 animate-pulse p-6"><div className="bg-muted h-8 w-48 rounded" /><div className="bg-muted h-80 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security &amp; Compliance</h1>
        <p className="text-sm text-muted-foreground mt-1">12 security capabilities</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Security Overview</TabsTrigger>
          <TabsTrigger value="secrets">Secrets Audit</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-0">
          {audit?.checks ? (
            <Card>
              <div className="px-4 py-3 border-b text-sm font-medium text-muted-foreground">Security Audit — {audit.summary?.passed||0}/{audit.summary?.total||0} passed</div>
              <div className="divide-y">
                {audit.checks.map((c:any,i:number) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{backgroundColor:c.status==="pass"?"var(--status-success, #059669)":c.status==="warn"?"var(--status-warning, #D97706)":"var(--status-error, #DC2626)"}}/>
                      <span>{c.check}</span>
                    </div>
                    <span className="text-muted-foreground">{c.detail}</span>
                  </div>
                ))}
              </div>
              <CardContent className="text-xs text-muted-foreground py-3">
                JWT ✓ RBAC ✓ Audit ✓ Password Policy ✓ Session Mgmt ✓ CSP ✓ CSRF ✓ XSS ✓ SQL Injection ✓ Rate Limiting ✓ Secrets Audit ✓ Dependency Audit ✓
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Security audit data not available (run backend with database)</CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="secrets" className="space-y-0">
          {secrets?.findings?.length > 0 ? (
            <Card>
              <div className="px-4 py-3 border-b text-sm font-medium text-muted-foreground">Secrets Audit — {secrets?.summary?.high||0} high, {secrets?.summary?.medium||0} medium</div>
              <div className="divide-y">
                {secrets.findings.map((f:any,i:number) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{backgroundColor:f.severity==="high"?"var(--status-error, #DC2626)":f.severity==="medium"?"var(--status-warning, #D97706)":"var(--status-info, #3B82F6)"}}/>
                      <span>{f.file}</span>
                    </div>
                    <span className="text-muted-foreground">{f.issue}</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No secrets data</CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-0">
          {deps?.checks?.length > 0 ? (
            <Card>
              <div className="px-4 py-3 border-b text-sm font-medium text-muted-foreground">Dependency Audit</div>
              <div className="divide-y">
                {deps.checks.map((c:any,i:number) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{backgroundColor:c.status==="ok"?"var(--status-success, #059669)":c.status==="review"?"var(--status-warning, #D97706)":"var(--status-error, #DC2626)"}}/>
                      <span>{c.dependency}</span>
                      <span className="text-xs font-mono text-muted-foreground">{c.version}</span>
                    </div>
                    <Badge variant={c.status==="ok"?"outline":"secondary"}>{c.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No dependency data</CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
