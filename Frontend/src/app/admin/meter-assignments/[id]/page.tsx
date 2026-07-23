"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb" from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface MeterAssignment {
  id: string
  meterId: string
  customerId: string
  contractId: string | null
  startDate: string
  endDate: string | null
  reason: string | null
  status: string
  createdAt: string
}

const statusColors: Record<string, string> = { active: "bg-green-100 text-green-800", ended: "bg-gray-100 text-gray-800", pending: "bg-yellow-100 text-yellow-800" }

function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800"
  return <Badge className={color}>{status}</Badge>
}

export default function MeterAssignmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [assignment, setAssignment] = useState<MeterAssignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient<{ meterAssignment: MeterAssignment }>(`/api/meter-assignments/${params.id}`)
        setAssignment(res.meterAssignment)
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    load()
  }, [params.id])

  
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Meter Assignments", href: "/admin/meter-assignments" },
      ]} />
      if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" /></div>
  if (!assignment) return <div className="p-6 text-center"><h2 className="text-xl font-semibold">Assignment not found</h2><Button onClick={() => router.back()} className="mt-4">Go back</Button></div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Meter Assignment</h1><p className="text-muted-foreground">ID: {assignment.id.slice(0, 8)}...</p></div>
        <div className="flex gap-2"><StatusBadge status={assignment.status} />          <Button variant="outline" onClick={() => setShowEdit(true)}>Edit</Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>Delete</Button>
          <Button variant="outline" onClick={() => router.push(`/admin/meter-assignments`)}>Back to list</Button></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle>Assignment</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Start:</strong> {new Date(assignment.startDate).toLocaleDateString()}</p>
            <p><strong>End:</strong> {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : "—"}</p>
            <p><strong>Reason:</strong> {assignment.reason || "—"}</p>
          </CardContent></Card>
        <Card><CardHeader><CardTitle>Meter</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Meter ID:</strong> {assignment.meterId}</p>
            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/meters/${assignment.meterId}`)}>View Meter</Button>
          </CardContent></Card>
        <Card><CardHeader><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Customer ID:</strong> {assignment.customerId}</p>
            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/customers/${assignment.customerId}`)}>View Customer</Button>
          </CardContent></Card>
      </div>
    </div>
  )
}

