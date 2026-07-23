"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb" from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Payment {
  id: string
  amount: number
  method: string
  status: string
  paidAt: string
}

interface Customer {
  id: string
  name: string
}

interface Invoice {
  id: string
  number: string
  amount: number
  status: string
  dueDate: string | null
  issuedAt: string
  paidAt: string | null
  createdAt: string
  customerId: string
  customer: Customer
  payments: Payment[]
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  completed: "bg-green-100 text-green-800",
}

function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800"
  return <Badge className={color}>{status}</Badge>
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient<{ invoice: Invoice }>(`/api/invoices/${params.id}`)
        setInvoice(res.invoice)
      } catch (e) {
        console.error("Failed to load invoice", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Invoices", href: "/admin/invoices" },
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

  if (!invoice) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">Invoice not found</h2>
        <Button onClick={() => router.back()} className="mt-4">Go back</Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoice #{invoice.number}</h1>
          <p className="text-muted-foreground">ID: {invoice.id.slice(0, 8)}...</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={invoice.status} />
          <Button variant="outline" onClick={() => router.push(`/admin/invoices`)}>Back to list</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Invoice Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Amount:</strong> {invoice.amount.toFixed(2)} EGP</p>
            <p><strong>Issued:</strong> {new Date(invoice.issuedAt).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}</p>
            <p><strong>Paid At:</strong> {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Name:</strong> {invoice.customer.name}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push(`/admin/customers/${invoice.customerId}`)}>
              View Customer
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Total Payments:</strong> {invoice.payments.length}</p>
            <p><strong>Total Paid:</strong> {invoice.payments.reduce((s, p) => s + p.amount, 0).toFixed(2)} EGP</p>
          </CardContent>
        </Card>
      </div>

      {invoice.payments.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Payments ({invoice.payments.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.amount.toFixed(2)} EGP</TableCell>
                    <TableCell>{p.method}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell>{new Date(p.paidAt).toLocaleDateString()}</TableCell>
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

