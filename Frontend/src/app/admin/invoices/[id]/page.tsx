"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient, getAuthHeaders } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorBoundary } from "@/components/effects/ErrorBoundary"

interface DetailData {
  id: string
  number?: string
  amount?: number
  status?: string
  [key: string]: unknown
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient<Record<string, unknown>>(`/api/invoices/${params.id}`)
        setData(res.invoice as DetailData)
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    load()
  }, [params.id])

  // Download the real invoice PDF through the download endpoint (browser download).
  async function handleDownload() {
    if (!data?.id || downloading) return
    setDownloading(true)
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.PORTAL_MODE === "1" ? "http://localhost:3003" : "http://localhost:3131")
      const res = await fetch(`${BACKEND_URL}/api/pdf/invoices/${data.id}/download`, {
        headers: { ...getAuthHeaders() },
      })
      if (!res.ok) throw new Error(`Download failed: ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${data.number || data.id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) { console.error(e) } finally { setDownloading(false) }
  }

  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" /></div>
  if (!data) return <div className="p-6 text-center"><h2 className="text-xl font-semibold">Invoice not found</h2><Button onClick={() => router.back()} className="mt-4">Go back</Button></div>

  return (
    <ErrorBoundary>
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Invoice {data.number || data.id?.toString().slice(0, 8)}</h1></div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/invoices`)}>Back to list</Button>
          <Button onClick={handleDownload} disabled={downloading}>{downloading ? "Downloading…" : "Download Invoice"}</Button>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
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
