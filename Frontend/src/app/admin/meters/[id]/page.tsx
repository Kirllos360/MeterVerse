"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorBoundary } from "@/components/effects/ErrorBoundary"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default", inactive: "secondary", maintenance: "outline", retired: "destructive",
}

export default function MeterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [meter, setMeter] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [terminating, setTerminating] = useState(false)
  const [termReason, setTermReason] = useState("")
  const [termFinalReading, setTermFinalReading] = useState("")

  const load = async () => {
    try {
      const res = await apiClient<any>(`/api/meters/${params.id}`)
      setMeter(res.meter || res)
    } catch { setMeter(null) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [params.id])

  const handleTerminate = async () => {
    if (!termReason.trim()) { toast.error("Reason is required"); return }
    setTerminating(true)
    try {
      const body: any = { reason: termReason }
      if (termFinalReading) body.finalReading = Number(termFinalReading)
      await apiClient(`/api/meters/${params.id}/terminate`, { method: "POST", body: JSON.stringify(body) })
      toast.success("Meter terminated")
      setTermReason(""); setTermFinalReading("")
      load()
    } catch (e: any) { toast.error(e.message || "Termination failed") }
    finally { setTerminating(false) }
  }

  const statusColor = statusVariant[meter?.status] || "outline"

  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>
  if (!meter) return <div className="p-6 text-center"><h2 className="text-xl font-semibold">Meter not found</h2><Button onClick={() => router.back()} className="mt-4">Go back</Button></div>

  return (
    <ErrorBoundary>
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">{meter.serial || meter.meterId || `Meter ${meter.id?.slice(0, 8)}`}</h1>
          <p className="text-sm text-muted-foreground">{meter.type || "—"} meter</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/meters`)}>Back to list</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Status</CardTitle></CardHeader>
          <CardContent><Badge variant={statusColor} className="text-sm">{meter.status}</Badge></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Area</CardTitle></CardHeader>
          <CardContent className="text-sm">{meter.area || meter.location || "—"}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Customer</CardTitle></CardHeader>
          <CardContent className="text-sm">{meter.customer?.name || meter.customerId || "—"}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Meter Details</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>ID:</strong> {meter.id}</p>
          <p><strong>Serial:</strong> {meter.serial || "—"}</p>
          <p><strong>Type:</strong> {meter.type || "—"}</p>
          <p><strong>Status:</strong> {meter.status || "—"}</p>
          <p><strong>Area:</strong> {meter.area || meter.location || "—"}</p>
          <p><strong>Created:</strong> {meter.createdAt ? new Date(meter.createdAt).toLocaleString() : "—"}</p>
          <p><strong>Updated:</strong> {meter.updatedAt ? new Date(meter.updatedAt).toLocaleString() : "—"}</p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        {meter.status !== "retired" && (
          <AlertDialog>
            <AlertDialogTrigger>
              <Button variant="destructive">Terminate Meter</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Terminate Meter</AlertDialogTitle>
                <AlertDialogDescription>This will retire the meter and release any assigned SIM.</AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-3 py-2">
                <div><Label htmlFor="reason">Reason</Label><Input id="reason" value={termReason} onChange={e => setTermReason(e.target.value)} placeholder="e.g. Meter faulty, customer moved" /></div>
                <div><Label htmlFor="finalReading">Final Reading (optional)</Label><Input id="finalReading" type="number" value={termFinalReading} onChange={e => setTermFinalReading(e.target.value)} placeholder="e.g. 12345" /></div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => { setTermReason(""); setTermFinalReading("") }}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleTerminate} disabled={terminating || !termReason.trim()}>
                  {terminating ? "Terminating..." : "Confirm Termination"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
    </ErrorBoundary>
  )
}
