"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb" from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Contract {
  id: string
  contractNumber: string
  customerId: string
  type: string
  status: string
  startDate: string
  endDate: string | null
  terms: string | null
  autoRenew: boolean
  createdAt: string
}

const statusColors: Record<string, string> = { active: "bg-green-100 text-green-800", expired: "bg-gray-100 text-gray-800", terminated: "bg-red-100 text-red-800", pending: "bg-yellow-100 text-yellow-800" }

function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800"
  return <Badge className={color}>{status}</Badge>
}

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient<{ contract: Contract }>(`/api/domain/contracts/${params.id}`)
        setContract(res.contract)
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    load()
  }, [params.id])

  
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Contracts", href: "/admin/contracts" },
      ]} />
      if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" /></div>
  if (!contract) return <div className="p-6 text-center"><h2 className="text-xl font-semibold">Contract not found</h2><Button onClick={() => router.back()} className="mt-4">Go back</Button></div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Contract {contract.contractNumber}</h1><p className="text-muted-foreground">ID: {contract.id.slice(0, 8)}...</p></div>
        <div className="flex gap-2"><StatusBadge status={contract.status} />          <Button variant="outline" onClick={() => setShowEdit(true)}>Edit</Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>Delete</Button>
          <Button variant="outline" onClick={() => router.push(`/admin/crud?entity=contracts`)}>Back to list</Button></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle>Contract Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Type:</strong> {contract.type}</p>
            <p><strong>Start:</strong> {new Date(contract.startDate).toLocaleDateString()}</p>
            <p><strong>End:</strong> {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "—"}</p>
            <p><strong>Auto Renew:</strong> {contract.autoRenew ? "Yes" : "No"}</p>
          </CardContent></Card>
        <Card><CardHeader><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Customer ID:</strong> {contract.customerId}</p>
            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/customers/${contract.customerId}`)}>View Customer</Button>
          </CardContent></Card>
      </div>
    </div>
  )
}

