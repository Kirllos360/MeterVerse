"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

export default function AIOperationsDashboard() {
  const router = useRouter()
  const [health, setHealth] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient<any>("/api/intelligence/health").catch(() => ({ result: { postgres: false, backend: false } }))
      .then((h) => { setHealth(h?.result); setLoading(false) })
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/knowledge/search", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer dev", "X-Dev-Mode": "true" },
        body: JSON.stringify({ query: searchQuery }),
      })
      const data = await res.json()
      setSearchResults(data.results || [])
    } catch { setSearchResults([]) }
    setLoading(false)
  }

  const recentFindings = [
    { id: "RCA-001", meter: "MTR-4421", issue: "Communication failure", status: "investigating", date: "2h ago", confidence: 86 },
    { id: "RCA-002", meter: "MTR-8902", issue: "SIM registration error", status: "resolved", date: "1d ago", confidence: 92 },
    { id: "RCA-003", meter: "MTR-3317", issue: "Firmware mismatch", status: "pending", date: "3d ago", confidence: 78 },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">AI Operations Center</h1><p className="text-sm text-muted-foreground">Intelligence-driven operations workspace</p></div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={health?.postgres ? "border-red-600/30" : "border-red-500/30"}>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Database</CardTitle></CardHeader>
          <CardContent><Badge variant={health?.postgres ? "default" : "destructive"}>{health?.postgres ? "Connected" : "Disconnected"}</Badge></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open RCAs</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{recentFindings.filter(f => f.status !== "resolved").length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Alerts</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-yellow-500">3</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">AI Accuracy</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">87%</CardContent>
        </Card>
      </div>

      {/* Knowledge Search */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Knowledge Search</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search meters, customers, issues..." onKeyDown={e => e.key === "Enter" && handleSearch()} className="flex-1" />
            <Button onClick={handleSearch}>Search</Button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 text-sm cursor-pointer hover:bg-muted/50" onClick={() => r.type === "meter" && router.push(`/admin/knowledge/meter/${r.serial}`)}>
                  <Badge variant="outline" className="text-[10px]">{r.type}</Badge>
                  <span className="font-medium">{r.serial || r.name || r.number}</span>
                  <span className="text-muted-foreground ml-auto">{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Findings Timeline */}
      <Card>
        <CardHeader><CardTitle className="text-sm">AI Findings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {recentFindings.map(f => (
            <div key={f.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 border text-sm">
              <Badge variant={f.status === "resolved" ? "default" : f.status === "investigating" ? "secondary" : "outline"} className="text-[10px]">{f.status}</Badge>
              <div className="flex-1">
                <p className="font-medium">{f.meter}</p>
                <p className="text-xs text-muted-foreground">{f.issue}</p>
              </div>
              <div className="text-right text-xs">
                <p className="text-muted-foreground">{f.date}</p>
                <p className="font-mono">{f.confidence}%</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

