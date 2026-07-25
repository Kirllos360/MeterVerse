"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"

interface CustomerCard {
  id: string; name: string; email?: string; phone?: string; area?: string; status: string;
  _count?: { meters?: number }; meters?: number; createdAt?: string;
}

// T093: Customer Business Cards — 3-column, 5-field design
export default function CustomerCardsPage() {
  const [customers, setCustomers] = useState<CustomerCard[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    apiClient<{ customers: CustomerCard[] }>("/api/customers").then(d => {
      setCustomers(d.customers || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.area || "").toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4"><Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Input placeholder="Search..." className="w-64" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <Card key={c.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{c.name}</CardTitle>
                <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Email:</span> {c.email || "—"}</p>
              <p><span className="text-muted-foreground">Phone:</span> {c.phone || "—"}</p>
              <p><span className="text-muted-foreground">Area:</span> {c.area || "—"}</p>
              <p><span className="text-muted-foreground">Meters:</span> {c._count?.meters ?? c.meters ?? 0}</p>
              <p><span className="text-muted-foreground">Created:</span> {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
