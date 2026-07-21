"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"

export default function AdminAIPage() {
  const [tab, setTab] = useState("operator")
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [chat, setChat] = useState<{role:string;content:string}[]>([])

  const agents = [
    { id:"operator", label:"AI Operator", icon:"🤖", desc:"Natural language system queries" },
    { id:"billing", label:"Billing Assistant", icon:"💰", desc:"Invoice analysis and insights" },
    { id:"validator", label:"Reading Validator", icon:"📊", desc:"Detect anomalous readings" },
    { id:"leak", label:"Leak Detection", icon:"💧", desc:"Identify potential leaks" },
    { id:"forecasting", label:"Forecasting", icon:"📈", desc:"Predict consumption and revenue" },
    { id:"root-cause", label:"Root Cause", icon:"🔍", desc:"Trace billing issues" },
    { id:"reports", label:"Report Builder", icon:"📋", desc:"Generate business reports" },
    { id:"sql", label:"SQL Assistant", icon:"🗄️", desc:"Natural language to SQL" },
    { id:"workflow", label:"Workflow Generator", icon:"⚡", desc:"Auto-create workflows" },
  ]

  const executeAI = async (agentId: string, body: any) => {
    setLoading(true); setResult(null)
    try {
      const res = await fetch(`/api/ai/${agentId}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      })
      setResult(await res.json())
    } catch (e: any) { setResult({ error: e.message }) }
    setLoading(false)
  }

  const handleOperatorChat = async () => {
    if (!query.trim()) return
    setChat(p => [...p, { role: "user", content: query }])
    setLoading(true)
    try {
      const res = await fetch("/api/ai/operator", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) })
      const data = await res.json()
      const summary = data.results?.map((r: any) => r.summary).join("\n") || "No results"
      setChat(p => [...p, { role: "assistant", content: summary }])
      setResult(data)
    } catch { setChat(p => [...p, { role: "assistant", content: "AI service unavailable" }]) }
    setLoading(false); setQuery("")
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Layer</h1>
        <p className="text-sm text-muted-foreground mt-1">9 AI Agents — Intelligent Automation for MeterVerse</p>
      </div>

      <div className="flex gap-1 pb-2 flex-wrap">
        {agents.map(a => (
          <Button key={a.id} variant={tab === a.id ? "default" : "outline"} size="sm" onClick={() => setTab(a.id)}>
            <span>{a.icon}</span><span className="ml-1">{a.label}</span>
          </Button>
        ))}
      </div>

      <Card className="min-h-[400px]">
        {/* ═══ AI OPERATOR — Chat Interface ═══ */}
        {tab === "operator" && <>
          <div className="px-4 py-3 border-b text-sm font-medium text-muted-foreground flex items-center gap-2">🤖 AI Operator — Chat with your system</div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {chat.length === 0 && <div className="text-sm text-center py-8 text-muted-foreground">Ask anything about your system. Try: "Show me overdue invoices" or "How many active meters?"</div>}
            {chat.map((m,i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-xl text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary/10" : "bg-muted"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-sm text-center text-muted-foreground">Thinking...</div>}
          </div>
          <div className="flex gap-2 p-4 border-t">
            <Input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleOperatorChat()} placeholder="Ask the AI Operator..." />
            <Button onClick={handleOperatorChat} disabled={loading || !query.trim()}>Send</Button>
          </div>
        </>}

        {/* ═══ OTHER AGENTS ═══ */}
        {tab !== "operator" && <>
          <div className="px-4 py-3 border-b text-sm font-medium text-muted-foreground">
            {agents.find(a=>a.id===tab)?.icon} {agents.find(a=>a.id===tab)?.label} — {agents.find(a=>a.id===tab)?.desc}
          </div>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {tab === "billing" && "Enter an invoice ID to analyze billing details, payment status, and overdue insights."}
              {tab === "validator" && "Enter a meter ID to validate readings and detect anomalies."}
              {tab === "leak" && "Enter a meter ID to analyze consumption patterns for potential leaks."}
              {tab === "forecasting" && "View consumption and revenue forecasts based on historical data."}
              {tab === "root-cause" && "Enter an invoice ID to trace the root cause of billing issues."}
              {tab === "reports" && "Generate automated business reports with key metrics."}
              {tab === "sql" && "Describe what you want to query in natural language — get SQL."}
              {tab === "workflow" && "Describe a workflow — get an automated workflow template."}
            </p>

            <div className="flex gap-2">
              {(tab === "billing" || tab === "root-cause") && <>
                <Input id="entityId" placeholder="Invoice ID (uuid)..." />
                <Button onClick={() => executeAI(tab, { invoiceId: (document.getElementById("entityId") as HTMLInputElement)?.value })} disabled={loading}>Analyze</Button>
              </>}
              {(tab === "validator" || tab === "leak") && <>
                <Input id="meterId" placeholder="Meter ID (uuid)..." />
                <Button onClick={() => executeAI(tab, { meterId: (document.getElementById("meterId") as HTMLInputElement)?.value })} disabled={loading}>Analyze</Button>
              </>}
              {tab === "forecasting" && <>
                <Button onClick={async()=>{setLoading(true);const r=await fetch("/api/ai/forecasting?period=30");setResult(await r.json());setLoading(false)}} disabled={loading}>Generate Forecast</Button>
              </>}
              {tab === "reports" && <>
                <Button onClick={() => executeAI("report-builder", { reportType: "detailed", period: "monthly", metric: "consumption" })} disabled={loading}>Generate Report</Button>
              </>}
              {tab === "sql" && <>
                <Input id="sqlQuery" placeholder="Describe what you want..." />
                <Button onClick={() => executeAI("sql-assistant", { query: (document.getElementById("sqlQuery") as HTMLInputElement)?.value })} disabled={loading}>Generate SQL</Button>
              </>}
              {tab === "workflow" && <>
                <Input id="wfDesc" placeholder="Describe workflow..." />
                <Button onClick={() => executeAI("workflow-generator", { description: (document.getElementById("wfDesc") as HTMLInputElement)?.value })} disabled={loading}>Generate</Button>
              </>}
            </div>

            {loading && <div className="text-sm text-muted-foreground">Processing...</div>}

            {result && (
              <div className="rounded-lg border p-3 max-h-60 overflow-y-auto bg-muted/30">
                <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </>}
      </Card>

      {/* Agent Grid Footer */}
      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <span>Endpoint: POST /api/ai/{`{agent}`}</span>
        <span>Auth: Bearer token (admin+)</span>
        <span>Ready for LLM integration (OpenAI/Anthropic)</span>
      </div>
    </div>
  )
}
