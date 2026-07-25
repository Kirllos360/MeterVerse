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
import { toast } from "sonner"

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  available: "default", assigned: "secondary", active: "default", faulty: "destructive", retired: "outline",
}

export default function SimDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [sim, setSim] = useState<any>(null)
  const [eligibility, setEligibility] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [releasing, setReleasing] = useState(false)

  const load = async () => {
    try {
      const res = await apiClient<any>(`/api/sim/${params.id}`)
      setSim(res.sim || res)
      const elRes = await apiClient<any>(`/api/sim/${params.id}/eligibility`)
      setEligibility(elRes)
    } catch { setSim(null) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [params.id])

  const handleRelease = async () => {
    setReleasing(true)
    try {
      await apiClient(`/api/sim/${params.id}/release`, { method: "POST" })
      toast.success("SIM released")
      load()
    } catch (e: any) { toast.error(e.message || "Release failed") }
    finally { setReleasing(false) }
  }

  const isAssigned = sim?.status === "assigned" || sim?.status === "active"
  const isInCooldown = eligibility?.cooldownUntil && new Date(eligibility.cooldownUntil) > new Date()
  const statusColor = statusVariant[sim?.status] || "outline"

  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" /></div>
  if (!sim) return <div className="p-6 text-center"><h2 className="text-xl font-semibold">SIM not found</h2><Button onClick={() => router.back()} className="mt-4">Go back</Button></div>

  return (
    <ErrorBoundary>
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">SIM {sim.simNumber || sim.iccid?.slice(-8)}</h1>
          <p className="text-sm text-muted-foreground">{sim.operator || "—"} · {sim.iccid}</p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/admin/sim`)}>Back to list</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Status</CardTitle></CardHeader>
          <CardContent><Badge variant={statusColor} className="text-sm">{sim.status}</Badge></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Eligible</CardTitle></CardHeader>
          <CardContent><Badge variant={eligibility?.eligible ? "default" : "secondary"}>{eligibility?.eligible ? "Yes" : "No"}</Badge></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cooldown</CardTitle></CardHeader>
          <CardContent className="text-sm">{isInCooldown ? `Until ${new Date(eligibility.cooldownUntil).toLocaleDateString()}` : "None"}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Meter</CardTitle></CardHeader>
          <CardContent className="text-sm">{sim.meter?.serial || sim.meterId || "—"}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>SIM Details</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>ID:</strong> {sim.id}</p>
          <p><strong>ICCID:</strong> {sim.iccid}</p>
          <p><strong>SIM Number:</strong> {sim.simNumber}</p>
          <p><strong>Operator:</strong> {sim.operator || "—"}</p>
          <p><strong>Status:</strong> {sim.status || "—"}</p>
          <p><strong>IP Address:</strong> {sim.ipAddress || "—"}</p>
          <p><strong>APN:</strong> {sim.apn || "—"}</p>
          <p><strong>Cooldown Until:</strong> {sim.cooldownUntil ? new Date(sim.cooldownUntil).toLocaleDateString() : "—"}</p>
          <p><strong>Eligibility Reason:</strong> {eligibility?.reason || "—"}</p>
          <p><strong>Created:</strong> {sim.createdAt ? new Date(sim.createdAt).toLocaleString() : "—"}</p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        {isAssigned && (
          <AlertDialog>
            <AlertDialogTrigger>
              <Button variant="destructive">Release SIM</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Release SIM</AlertDialogTitle>
                <AlertDialogDescription>Release this SIM from its current meter assignment. It will become available for reuse.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRelease} disabled={releasing}>
                  {releasing ? "Releasing..." : "Confirm Release"}
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
