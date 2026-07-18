"use client"

import dynamic from "next/dynamic"

const AuditViewer = dynamic(() => import("@/admin/audit/AuditViewer").then((m) => ({ default: m.AuditViewer })), { ssr: false })

export default function AdminAuditPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-white">Audit Logs</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>System audit trail with search</p>
      </div>
      <AuditViewer />
    </div>
  )
}
