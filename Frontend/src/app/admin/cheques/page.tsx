"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { GenericAdminPage } from "@/admin/tables/GenericAdminPage"
import { pageConfigs } from "@/admin/tables/page-configs"
import { EnhancedListPage } from "@/features/grid/EnhancedListPage"
import { getAuthHeaders } from "@/lib/api-client"

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500",
  completed: "bg-green-500/10 text-green-500",
  rejected: "bg-red-500/10 text-red-500",
}

function ChequeActions({ data, filtered, invalidate }: { data: any[]; filtered: any[]; invalidate: (...args: any[]) => void }) {
  const [busy, setBusy] = useState<string | null>(null)

  const act = async (id: string, action: "clear" | "reject") => {
    setBusy(id)
    try {
      const res = await fetch(`/api/cheques/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(action === "reject" ? { reason: "rejected" } : {}),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `${action} failed (${res.status})`)
      }
      toast.success(action === "clear" ? "Cheque cleared" : "Cheque rejected")
      invalidate()
    } catch (e: any) {
      toast.error(e.message || "Action failed")
    } finally {
      setBusy(null)
    }
  }

  const rows = filtered || []
  if (rows.length === 0) {
    return <p className="text-sm py-8 text-center" style={{ color: "var(--text-tertiary)" }}>No cheques found</p>
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border-default)" }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Customer</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Cheque No.</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Bank</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Amount</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Status</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c: any) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--border-default)" }}>
                <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{c.customer}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{c.chequeNumber}</td>
                <td className="px-4 py-3"><Badge variant="secondary">{c.bank}</Badge></td>
                <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>EGP {(c.amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className={STATUS_STYLE[c.status] || ""}>{c.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-lg h-7 text-xs" disabled={busy === c.id || c.status !== "pending"} onClick={() => act(c.id, "clear")}>
                      {busy === c.id ? <Icons.spinner className="h-3 w-3 animate-spin mr-1" /> : <Icons.check className="h-3 w-3 mr-1" />}
                      Clear
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-lg h-7 text-xs text-red-500" disabled={busy === c.id || c.status !== "pending"} onClick={() => act(c.id, "reject")}>
                      {busy === c.id ? <Icons.spinner className="h-3 w-3 animate-spin mr-1" /> : <Icons.close className="h-3 w-3 mr-1" />}
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ChequesPage() {
  return (
    <EnhancedListPage
      title="Cheques"
      description="Cheque payments lifecycle (pending / cleared / rejected)"
      chartConfigs={{
        title: "Cheque Analytics",
        data1: [{name:"Pending",value:0},{name:"Cleared",value:0},{name:"Rejected",value:0}],
        data2: [{name:"Pending",value:0},{name:"Cleared",value:0}],
        data3: [{name:"Pending",value:0},{name:"Rejected",value:0}],
      }}
      toolbarConfig={{
        sortOptions: [{value:"date",label:"Date"},{value:"amount",label:"Amount"},{value:"status",label:"Status"}],
        filterOptions: [{value:"all",label:"All"},{value:"pending",label:"Pending"},{value:"completed",label:"Cleared"},{value:"rejected",label:"Rejected"}],
      }}
    >
      <GenericAdminPage
        config={pageConfigs.cheques}
        renderCustom={(data, filtered, invalidate) => <ChequeActions data={data} filtered={filtered} invalidate={invalidate} />}
      />
    </EnhancedListPage>
  )
}
