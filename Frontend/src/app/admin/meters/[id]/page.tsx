"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb" from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Reading {
  id: string
  value: number
  unit: string
  timestamp: string
  source: string
  status: string
}

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
}

interface Meter {
  id: string
  serial: string
  type: string
  location: string | null
  status: string
  area: string | null
  customerId: string | null
  createdAt: string
  updatedAt: string
  readings: Reading[]
  customer: Customer | null
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  maintenance: "bg-yellow-100 text-yellow-800",
  terminated: "bg-red-100 text-red-800",
  valid: "bg-green-100 text-green-800",
  invalid: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
}

function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800"
  return <Badge className={color}>{status}</Badge>
}

export default function MeterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [meter, setMeter] = useState<Meter | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient<{ meter: Meter }>(`/api/meters/${params.id}`)
        setMeter(res.meter)
      } catch (e) {
        console.error("Failed to load meter", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Meters", href: "/admin/meters" },
      ]} />
      if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!meter) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">Meter not found</h2>
        <Button onClick={() => router.back()} className="mt-4">Go back</Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meter {meter.serial}</h1>
          <p className="text-muted-foreground">ID: {meter.id.slice(0, 8)}...</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={meter.status} />
                    <Button variant="outline" onClick={() => setShowEdit(true)}>Edit</Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>Delete</Button>
          <Button variant="outline" onClick={() => router.push(`/admin/meters`)}>Back to list</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Meter Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Type:</strong> {meter.type}</p>
            <p><strong>Location:</strong> {meter.location || "—"}</p>
            <p><strong>Area:</strong> {meter.area || "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {meter.customer ? (
              <>
                <p><strong>Name:</strong> {meter.customer.name}</p>
                <p><strong>Email:</strong> {meter.customer.email || "—"}</p>
                <p><strong>Phone:</strong> {meter.customer.phone || "—"}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push(`/admin/customers/${meter.customerId}`)}>
                  View Customer
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">Not assigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Created:</strong> {new Date(meter.createdAt).toLocaleDateString()}</p>
            <p><strong>Updated:</strong> {new Date(meter.updatedAt).toLocaleDateString()}</p>
            <p><strong>Readings:</strong> {meter.readings.length} (last 10 shown)</p>
          </CardContent>
        </Card>
      </div>

      {meter.readings.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Readings ({meter.readings.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Value</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meter.readings.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer hover:bg-muted" onClick={() => router.push(`/admin/readings/${r.id}`)}>
                    <TableCell className="font-medium">{r.value}</TableCell>
                    <TableCell>{r.unit}</TableCell>
                    <TableCell>{new Date(r.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{r.source}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

