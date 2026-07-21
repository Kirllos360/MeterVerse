"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Icons } from "@/components/icons"

interface AuditEntry {
  id: string; timestamp: string; actor: string; action: string; resource: string; status: "success" | "failure"; details?: string; ip?: string
}

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/admin/audit").then((r) => r.json()).then((d) => { setEntries(d.entries || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = search ? entries.filter((e) =>
    e.actor?.includes(search) || e.action?.includes(search) || e.resource?.includes(search)
  ) : entries

  if (loading) {
    return <div className="space-y-4 animate-pulse p-6"><div className="bg-muted h-8 w-48 rounded" /><div className="bg-muted h-80 rounded-xl" /></div>
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">System audit trail — {entries.length} entries</p>
      </div>

      <div className="relative w-64">
        <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search audit log..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Time</TableHead>
                <TableHead className="w-[140px]">Actor</TableHead>
                <TableHead className="w-[140px]">Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No audit entries found</TableCell></TableRow>
              ) : filtered.map((e) => (
                <TableRow key={e.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">{new Date(e.timestamp).toLocaleTimeString()}</TableCell>
                  <TableCell className="text-muted-foreground">{e.actor || "system"}</TableCell>
                  <TableCell className="font-medium">{e.action}</TableCell>
                  <TableCell className="text-muted-foreground">{e.resource || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={e.status === "success" ? "default" : "destructive"} className="capitalize">{e.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
