"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Invoice { id: string; number: string }
interface PaymentTransaction { id: string; amount: number; status: string; gatewayId: string }

interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: string
  status: string
  paidAt: string
  createdAt: string
  invoice?: Invoice
  paymentTransactions?: PaymentTransaction[]
}

const statusColors: Record<string, string> = { completed: "bg-green-100 text-green-800", pending: "bg-yellow-100 text-yellow-800", failed: "bg-red-100 text-red-800" }

function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800"
  return <Badge className={color}>{status}</Badge>
}

export default function PaymentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient<{ payment: Payment }>(`/api/payments/${params.id}`)
        setPayment(res.payment)
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    load()
  }, [params.id])

  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" /></div>
  if (!payment) return <div className="p-6 text-center"><h2 className="text-xl font-semibold">Payment not found</h2><Button onClick={() => router.back()} className="mt-4">Go back</Button></div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Payment</h1><p className="text-muted-foreground">ID: {payment.id.slice(0, 8)}...</p></div>
        <div className="flex gap-2"><StatusBadge status={payment.status} /><Button variant="outline" onClick={() => router.push("/admin/payments")}>Back to list</Button></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle>Payment Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Amount:</strong> {payment.amount.toFixed(2)} EGP</p>
            <p><strong>Method:</strong> {payment.method}</p>
            <p><strong>Paid At:</strong> {new Date(payment.paidAt).toLocaleDateString()}</p>
            <p><strong>Created:</strong> {new Date(payment.createdAt).toLocaleDateString()}</p>
          </CardContent></Card>
        <Card><CardHeader><CardTitle>Invoice</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Invoice ID:</strong> {payment.invoiceId}</p>
            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/invoices/${payment.invoiceId}`)}>View Invoice</Button>
          </CardContent></Card>
      </div>
    </div>
  )
}
