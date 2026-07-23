"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb" from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Reading {
  id: string
  meterId: string
  value: number
  unit: string
  timestamp: string
  source: string
  status: string
  createdAt: string
  meter?: { id: string; serial: string }
}

const statusColors: Record<string, string> = { valid: "bg-green-100 text-green-800", invalid: "bg-red-100 text-red-800", pending: "bg-yellow-100 text-yellow-800" }

function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800"
  return <Badge className={color}>{status}</Badge>
}

export default function ReadingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [reading, setReading] = useState<Reading | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient<{ reading: Reading }>(`/api/readings/${params.id}`)
        setReading(res.reading)
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    load()
  }, [params.id])

  
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Readings", href: "/admin/readings" },
      ]} />
      if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" /></div>
  if (!reading) return <div className="p-6 text-center"><h2 className="text-xl font-semibold">Reading not found</h2><Button onClick={() => router.back()} className="mt-4">Go back</Button></div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Reading Details</h1><p className="text-muted-foreground">ID: {reading.id.slice(0, 8)}...</p></div>
        <div className="flex gap-2"><StatusBadge status={reading.status} /><Button variant="outline" onClick={() => router.push("/admin/readings")}>Back to list</Button></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle>Reading</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Value:</strong> {reading.value} {reading.unit}</p>
            <p><strong>Timestamp:</strong> {new Date(reading.timestamp).toLocaleString()}</p>
            <p><strong>Source:</strong> {reading.source}</p>
            <p><strong>Created:</strong> {new Date(reading.createdAt).toLocaleString()}</p>
          </CardContent></Card>
        <Card><CardHeader><CardTitle>Meter</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Meter ID:</strong> {reading.meterId}</p>
            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/meters/${reading.meterId}`)}>View Meter</Button>
          </CardContent></Card>
      </div>
    </div>
  )
}

