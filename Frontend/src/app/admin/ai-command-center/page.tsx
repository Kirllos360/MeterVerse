"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { motion } from "framer-motion"

// Phase 15 — AI Command Center
const AI_AGENTS = [
  { id: "rca", label: "Meter RCA", icon: "🔍", status: "active", desc: "Root cause analysis for meter issues" },
  { id: "email", label: "Email Intel", icon: "📧", status: "active", desc: "Analyze customer email communications" },
  { id: "supplier", label: "Supplier RCA", icon: "🏭", status: "active", desc: "Supplier responsibility analysis" },
  { id: "task", label: "Task Assistant", icon: "✅", status: "idle", desc: "Smart task reminders and scheduling" },
  { id: "knowledge", label: "Knowledge Graph", icon: "🧠", status: "idle", desc: "Enterprise knowledge connections" },
  { id: "audit", label: "Audit Timeline", icon: "📋", status: "active", desc: "Event correlation and timeline analysis" },
]

export default function AICommandCenter() {
  const [query, setQuery] = useState("")
  const [chat, setChat] = useState<{ role: string; text: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [kpis, setKpis] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/incidents/stats", { headers: { Authorization: "Bearer dev", "X-Dev-Mode": "true" } }).then(r => r.json()).catch(() => null),
      fetch("/api/admin-settings/health/summary", { headers: { Authorization: "Bearer dev", "X-Dev-Mode": "true" } }).then(r => r.json()).catch(() => null),
    ]).then(([s, h]) => { setStats(s); if (h) setKpis([
      { name: "Total Meters", value: h.meters },
      { name: "Customers", value: h.customers },
      { name: "Open Incidents", value: s?.byStatus?.find((x: any) => x.status !== "resolved")?._count || 0 },
      { name: "Avg Correlation", value: s?.avgCorrelation || 0 },
    ]) })
  }, [])

  const handleSend = async () => {
    if (!query.trim()) return
    setChat(prev => [...prev, { role: "user", text: query }])
    setLoading(true)
    try {
      const res = await fetch("/api/ai/operator", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer dev", "X-Dev-Mode": "true" },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      setChat(prev => [...prev, { role: "ai", text: data.response || data.message || "No response" }])
    } catch {
      setChat(prev => [...prev, { role: "ai", text: "AI service unavailable. Please try again." }])
    }
    setLoading(false)
    setQuery("")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">AI Command Center</h1><p className="text-sm text-muted-foreground">Intelligence Layer — MeterVerse Enterprise AI</p></div>
      </div>

      {kpis.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{k.name}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{String(k.value)}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Agent Status */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {AI_AGENTS.map(a => (
          <Card key={a.id} className={a.status === "active" ? "border-red-600/30" : "opacity-60"}>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">{a.icon} {a.label}</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-1">
              <Badge variant={a.status === "active" ? "default" : "secondary"} className="text-[10px]">{a.status}</Badge>
              <p className="text-muted-foreground pt-1">{a.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Chat Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">AI Assistant</CardTitle></CardHeader>
          <CardContent>
            <div className="h-80 overflow-y-auto space-y-3 mb-4 p-2">
              {chat.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">Ask about meters, customers, invoices, or system health.</p>}
              {chat.map((m, i) => (
                <div key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={"max-w-[80%] rounded-xl px-4 py-2 text-sm " + (m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>{m.text}</div>
                </div>
              ))}
              {loading && <div className="flex justify-start"><Skeleton className="h-8 w-48 rounded-xl" /></div>}
            </div>
            <div className="flex gap-2">
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ask about meters, customers, or system..." onKeyDown={e => e.key === "Enter" && handleSend()} />
              <Button onClick={handleSend} disabled={loading}>Send</Button>
            </div>
          </CardContent>
        </Card>

        {/* RCA Timeline */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { t: "Meter #MTR-4421 fault analyzed", s: "rca", ts: "2m ago" },
              { t: "Invoice #INV-4231 customer inquiry", s: "email", ts: "15m ago" },
              { t: "Supplier Landis+Gyr response received", s: "supplier", ts: "1h ago" },
              { t: "Knowledge graph updated — 3 new connections", s: "knowledge", ts: "2h ago" },
              { t: "Audit timeline — payment anomaly detected", s: "audit", ts: "3h ago" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                <span className="text-lg">{a.s === "rca" ? "🔍" : a.s === "email" ? "📧" : a.s === "supplier" ? "🏭" : a.s === "knowledge" ? "🧠" : "📋"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs">{a.t}</p>
                  <p className="text-[10px] text-muted-foreground">{a.ts}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

