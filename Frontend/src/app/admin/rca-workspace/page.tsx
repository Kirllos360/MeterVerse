"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

const API_HEADERS = { Authorization: "Bearer dev", "X-Dev-Mode": "true", "Content-Type": "application/json" }

export default function RCAWorkspace() {
  const [cases, setCases] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [serial, setSerial] = useState("")
  const [issue, setIssue] = useState("")
  const [selected, setSelected] = useState<any>(null)
  const [whys, setWhys] = useState<string[]>([""])
  const [rootCause, setRootCause] = useState("")
  const [confidence, setConfidence] = useState(85)
  const [recommendation, setRecommendation] = useState("")
  const [preventiveInput, setPreventiveInput] = useState("")
  const [patternQuery, setPatternQuery] = useState("")
  const [patterns, setPatterns] = useState<any[]>([])

  const load = async () => {
    try {
      const res = await fetch("/api/rca/cases", { headers: API_HEADERS })
      const data = await res.json()
      setCases(data.cases || [])
      setStats(data.stats)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const createCase = async () => {
    if (!serial.trim() || !issue.trim()) { toast.error("Serial and issue required"); return }
    await fetch("/api/rca/cases", { method: "POST", headers: API_HEADERS, body: JSON.stringify({ serial, issue }) })
    toast.success("RCA case created")
    setSerial(""); setIssue("")
    load()
  }

  const autoAnalyze = async (id: string) => {
    const res = await fetch(`/api/rca/cases/${id}/auto-analyze`, { method: "POST", headers: API_HEADERS })
    if (res.ok) {
      toast.success("AI analysis generated")
      load()
    } else {
      const err = await res.json()
      toast.error(err.error || "Auto-analysis failed")
    }
  }

  const submitAnalysis = async (id: string) => {
    const validWhys = whys.filter(w => w.trim())
    if (validWhys.length < 2) { toast.error("At least 2 whys required"); return }
    await fetch(`/api/rca/cases/${id}/analyze`, {
      method: "POST", headers: API_HEADERS,
      body: JSON.stringify({ fiveWhys: validWhys, fiveW: { who: "", what: issue, when: new Date().toISOString(), where: "", why: rootCause }, rootCause, confidence, recommendation }),
    })
    toast.success("Analysis submitted")
    load()
  }

  const approveCase = async (id: string) => {
    await fetch(`/api/rca/cases/${id}/approve`, { method: "POST", headers: API_HEADERS })
    toast.success("Case approved")
    load()
  }

  const resolveCase = async (id: string) => {
    await fetch(`/api/rca/cases/${id}/resolve`, {
      method: "POST", headers: API_HEADERS,
      body: JSON.stringify({ action: recommendation, notes: `Resolved via ${recommendation}` }),
    })
    toast.success("Case resolved")
    load()
  }

  const learnCase = async (id: string) => {
    const res = await fetch(`/api/rca/cases/${id}/learn`, { method: "POST", headers: API_HEADERS })
    if (res.ok) { toast.success("Pattern learned"); load() } else toast.error("Learn failed")
  }

  const addPreventive = async (id: string) => {
    if (!preventiveInput.trim()) return
    const c = cases.find(c => c.id === id)
    const measures = [...(c?.preventiveMeasures || []), preventiveInput.trim()]
    await fetch(`/api/rca/cases/${id}/preventive`, { method: "PUT", headers: API_HEADERS, body: JSON.stringify({ measures }) })
    toast.success("Preventive measure added")
    setPreventiveInput("")
    load()
  }

  const searchPatterns = async () => {
    if (!patternQuery.trim()) return
    const res = await fetch(`/api/rca/patterns/similar?query=${encodeURIComponent(patternQuery)}`, { headers: API_HEADERS })
    const data = await res.json()
    setPatterns(data.patterns || [])
  }

  const recordEffectiveness = async (patternId: string, rating: string) => {
    await fetch(`/api/rca/patterns/${patternId}/effectiveness`, {
      method: "POST", headers: API_HEADERS,
      body: JSON.stringify({ rating }),
    })
    toast.success(`Pattern marked as ${rating}`)
    searchPatterns()
  }

  const statusColor: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    NEW: "secondary", INVESTIGATING: "outline", AI_ANALYSIS_READY: "default",
    HUMAN_REVIEW: "destructive", APPROVED: "default", RESOLVED: "default", LEARNED: "outline",
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">RCA Workspace</h1><p className="text-sm text-muted-foreground">Root Cause Analysis — Intelligence & Learning</p></div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          {Object.entries(stats.byStatus).map(([k, v]) => (
            <Card key={k} className="text-center p-2">
              <div className="text-lg font-bold">{v as number}</div>
              <div className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">New RCA Case</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={serial} onChange={e => setSerial(e.target.value)} placeholder="Meter serial..." className="w-48" />
              <Input value={issue} onChange={e => setIssue(e.target.value)} placeholder="Issue description..." className="flex-1" />
              <Button onClick={createCase}>Create & Analyze</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Pattern Search</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={patternQuery} onChange={e => setPatternQuery(e.target.value)} placeholder="Search past patterns..." className="flex-1" />
              <Button variant="outline" size="sm" onClick={searchPatterns}>Search</Button>
            </div>
            {patterns.length > 0 && (
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {patterns.map((p: any) => (
                  <div key={p.id} className="text-xs border-b pb-1 flex items-center justify-between">
                    <div>
                      <span className="font-medium">{p.issue?.slice(0, 30)}</span>
                      <span className="text-muted-foreground ml-1">→ {p.resolution?.slice(0, 30)}</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button className="text-red-600 hover:underline" onClick={() => recordEffectiveness(p.id, "effective")}>✓</button>
                      <button className="text-yellow-500 hover:underline" onClick={() => recordEffectiveness(p.id, "partial")}>~</button>
                      <button className="text-red-500 hover:underline" onClick={() => recordEffectiveness(p.id, "ineffective")}>✗</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        {loading && <Skeleton className="h-20" />}
        {cases.map(c => (
          <div key={c.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between" onClick={() => setSelected(selected?.id === c.id ? null : c)}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold">{c.id}</span>
                <Badge variant={statusColor[c.status] || "outline"} className="text-[10px]">{c.status}</Badge>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="text-sm"><span className="text-muted-foreground">Meter:</span> {c.meter} <span className="text-muted-foreground ml-4">Issue:</span> {c.issue}</div>

            {selected?.id === c.id && (
              <div className="space-y-4 pt-2 border-t">
                {c.evidence && (
                  <div>
                    <p className="text-xs font-medium mb-1">Evidence ({c.evidence.items?.length || 0} items, {c.evidence.confidence}% confidence)</p>
                    <div className="flex flex-wrap gap-1">
                      {c.evidence.items?.map((item: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-[10px]">{item.type}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {c.similarPatterns && c.similarPatterns.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1">Similar Past Patterns ({c.similarPatterns.length})</p>
                    <div className="space-y-1">
                      {c.similarPatterns.map((p: any, i: number) => (
                        <div key={i} className="text-xs bg-muted p-2 rounded">
                          <span className="font-medium">{p.issue?.slice(0, 50)}</span>
                          <span className="text-muted-foreground"> → {p.resolution?.slice(0, 50)}</span>
                          <Badge variant="outline" className="ml-1 text-[10px]">{p.effectiveness}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {c.status === "HUMAN_REVIEW" && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium mb-1">5 Whys</p>
                      {c.fiveWhys?.map((w: string, i: number) => <p key={i} className="text-sm">Why {i + 1}: {w}</p>)}
                    </div>
                    <p className="text-sm"><span className="text-muted-foreground">Root Cause:</span> {c.rootCause}</p>
                    <p className="text-sm"><span className="text-muted-foreground">Confidence:</span> {c.confidence}%</p>
                    <p className="text-sm"><span className="text-muted-foreground">Recommendation:</span> {c.recommendation}</p>
                    {c.preventiveMeasures && c.preventiveMeasures.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-1">Preventive Measures</p>
                        {c.preventiveMeasures.map((m: string, i: number) => <p key={i} className="text-sm">• {m}</p>)}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => approveCase(c.id)}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => resolveCase(c.id)}>Resolve</Button>
                    </div>
                  </div>
                )}

                {(c.status === "NEW" || c.status === "INVESTIGATING" || c.status === "AI_ANALYSIS_READY") && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => autoAnalyze(c.id)}>Auto-Generate Analysis</Button>
                    </div>
                    <div><p className="text-xs font-medium mb-1">5 Whys (Manual)</p>
                      {whys.map((w, i) => (
                        <Input key={i} value={w} onChange={e => { const n = [...whys]; n[i] = e.target.value; setWhys(n) }} placeholder={`Why ${i + 1}?`} className="mb-1 text-sm" />
                      ))}
                      <Button variant="ghost" size="sm" onClick={() => setWhys([...whys, ""])}>+ Add why</Button>
                    </div>
                    <Input value={rootCause} onChange={e => setRootCause(e.target.value)} placeholder="Root cause" className="text-sm" />
                    <div className="flex gap-2 items-center">
                      <span className="text-xs">Confidence:</span>
                      <input type="range" min={0} max={100} value={confidence} onChange={e => setConfidence(Number(e.target.value))} className="flex-1" />
                      <span className="text-xs font-mono w-8">{confidence}%</span>
                    </div>
                    <Input value={recommendation} onChange={e => setRecommendation(e.target.value)} placeholder="Recommended action" className="text-sm" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => submitAnalysis(c.id)}>Submit Analysis</Button>
                    </div>
                  </div>
                )}

                {c.status === "RESOLVED" && (
                  <div className="space-y-2">
                    <p className="text-sm"><span className="text-muted-foreground">Resolution:</span> {c.resolution}</p>
                    <p className="text-xs text-muted-foreground">Time to fix: {c.timeToFix}h</p>
                    <div className="flex gap-2 items-center">
                      <Input value={preventiveInput} onChange={e => setPreventiveInput(e.target.value)} placeholder="Add preventive measure..." className="text-sm flex-1" />
                      <Button size="sm" variant="outline" onClick={() => addPreventive(c.id)}>Add</Button>
                    </div>
                    <Button size="sm" onClick={() => learnCase(c.id)}>Learn from Case</Button>
                  </div>
                )}

                {c.status === "LEARNED" && (
                  <p className="text-xs text-muted-foreground">Pattern learned and stored in knowledge base.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

