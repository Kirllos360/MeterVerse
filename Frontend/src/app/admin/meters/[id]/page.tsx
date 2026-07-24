"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorBoundary } from "@/components/effects/ErrorBoundary"

interface DetailData {
  id: string
  [key: string]: unknown
}

export default function MeterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient<Record<string, unknown>>(`/api/meters/${params.id}`)
        setData(res.meter as DetailData)
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    load()
  }, [params.id])

  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" /></div>
  if (!data) return <div className="p-6 text-center"><h2 className="text-xl font-semibold">Meter not found</h2><Button onClick={() => router.back()} className="mt-4">Go back</Button></div>

  return (
    <ErrorBoundary>
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Meter {data.id?.toString().slice(0, 8)}</h1></div>
        <Button variant="outline" onClick={() => router.push(`/admin/meters`)}>Back to list</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Meter Details</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {Object.entries(data).slice(0, 10).map(([key, val]) => (
            <p key={key}><strong>{key}:</strong> {typeof val === 'object' ? JSON.stringify(val).slice(0, 100) : String(val ?? '—')}</p>
          ))}
        </CardContent>
      </Card>
    </div>
    </ErrorBoundary>
  )
}
