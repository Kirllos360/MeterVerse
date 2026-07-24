const fs = require('fs');
const path = require('path');

const configs = {
  contracts: { title: 'Contract', entity: 'contract', label: 'Contracts', apiPath: '/api/domain/contracts/' },
  customers: { title: 'Customer', entity: 'customer', label: 'Customers', apiPath: '/api/customers/' },
  invoices: { title: 'Invoice', entity: 'invoice', label: 'Invoices', apiPath: '/api/invoices/' },
  'meter-assignments': { title: 'Meter Assignment', entity: 'meterAssignment', label: 'Meter Assignments', apiPath: '/api/meter-assignments/' },
  meters: { title: 'Meter', entity: 'meter', label: 'Meters', apiPath: '/api/meters/' },
  payments: { title: 'Payment', entity: 'payment', label: 'Payments', apiPath: '/api/payments/' },
  readings: { title: 'Reading', entity: 'reading', label: 'Readings', apiPath: '/api/readings/' },
};

for (const [dir, cfg] of Object.entries(configs)) {
  const filePath = `D:/meter/Frontend/src/app/admin/${dir}/[id]/page.tsx`;
  const content = `"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorBoundary } from "@/components/effects/ErrorBoundary"

interface DetailData {
  id: string
  [key: string]: unknown
}

export default function ${cfg.title.replace(/ /g, '')}DetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient<Record<string, unknown>>(\`${cfg.apiPath}\${params.id}\`)
        setData(res.${cfg.entity} as DetailData)
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    load()
  }, [params.id])

  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" /></div>
  if (!data) return <div className="p-6 text-center"><h2 className="text-xl font-semibold">${cfg.title} not found</h2><Button onClick={() => router.back()} className="mt-4">Go back</Button></div>

  return (
    <ErrorBoundary>
    <div className="p-6 space-y-6">
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "${cfg.label}", href: "/admin/${dir}" },
        { label: "Detail", href: "" },
      ]} />
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">${cfg.title} {data.id?.toString().slice(0, 8)}</h1></div>
        <Button variant="outline" onClick={() => router.push(\`/admin/${dir}\`)}>Back to list</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>${cfg.title} Details</CardTitle></CardHeader>
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
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`REWRITTEN: ${dir}/[id]/page.tsx`);
}

console.log('All 7 detail pages rewritten');
