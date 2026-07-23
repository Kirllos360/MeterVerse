"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb" from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  status: string
  area: string | null
  createdAt: string
  updatedAt: string
  meters: Meter[]
  invoices: Invoice[]
}

interface Meter {
  id: string
  serial: string
  type: string
  location: string | null
  status: string
}

interface Invoice {
  id: string
  number: string
  amount: number
  status: string
  dueDate: string | null
  issuedAt: string
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  maintenance: "bg-yellow-100 text-yellow-800",
  terminated: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  archived: "bg-gray-100 text-gray-800",
}

function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800"
  return <Badge className={color}>{status}</Badge>
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient<{ customer: Customer }>(`/api/customers/${params.id}`)
        setCustomer(res.customer)
      } catch (e) {
        console.error("Failed to load customer", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Customers", href: "/admin/customers" },
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

  if (!customer) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">Customer not found</h2>
        <Button onClick={() => router.back()} className="mt-4">Go back</Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="text-muted-foreground">ID: {customer.id.slice(0, 8)}...</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={customer.status} />
          <Button variant="outline" onClick={() => router.push(`/admin/customers`)}>Back to list</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Email:</strong> {customer.email || "—"}</p>
            <p><strong>Phone:</strong> {customer.phone || "—"}</p>
            <p><strong>Address:</strong> {customer.address || "—"}</p>
            <p><strong>Area:</strong> {customer.area || "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Created:</strong> {new Date(customer.createdAt).toLocaleDateString()}</p>
            <p><strong>Updated:</strong> {new Date(customer.updatedAt).toLocaleDateString()}</p>
            <p><strong>Meters:</strong> {customer.meters.length}</p>
            <p><strong>Invoices:</strong> {customer.invoices.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline" onClick={() => router.push(`/admin/meters?customerId=${customer.id}`)}>View Meters</Button>
            <Button className="w-full" variant="outline" onClick={() => router.push(`/admin/invoices?customerId=${customer.id}`)}>View Invoices</Button>
          </CardContent>
        </Card>
      </div>

      {customer.meters.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Meters ({customer.meters.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.meters.map((m) => (
                  <TableRow key={m.id} className="cursor-pointer hover:bg-muted" onClick={() => router.push(`/admin/meters/${m.id}`)}>
                    <TableCell className="font-medium">{m.serial}</TableCell>
                    <TableCell>{m.type}</TableCell>
                    <TableCell>{m.location || "—"}</TableCell>
                    <TableCell><StatusBadge status={m.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {customer.invoices.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Invoices ({customer.invoices.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Issued</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.invoices.map((inv) => (
                  <TableRow key={inv.id} className="cursor-pointer hover:bg-muted" onClick={() => router.push(`/admin/invoices/${inv.id}`)}>
                    <TableCell className="font-medium">{inv.number}</TableCell>
                    <TableCell>{inv.amount.toFixed(2)} EGP</TableCell>
                    <TableCell><StatusBadge status={inv.status} /></TableCell>
                    <TableCell>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>{new Date(inv.issuedAt).toLocaleDateString()}</TableCell>
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

