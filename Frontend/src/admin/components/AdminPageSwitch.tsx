"use client"

import { useAdminStore } from "@/stores/admin-store"
import { pageConfigs } from "@/admin/tables/page-configs"
import { GenericAdminPage } from "@/admin/tables/GenericAdminPage"
import { ConfigCenterPage } from "@/admin/pages/ConfigCenterPage"

export function AdminPageSwitch() {
  const activePage = useAdminStore((s) => s.activePage)

  if (activePage === "home") {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Admin Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>System administration and configuration</p>
      </div>
    )
  }

  if (activePage === "config-center") return <ConfigCenterPage />

  const config = pageConfigs[activePage]
  if (config) return <GenericAdminPage config={config} />

  return (
    <div className="p-6">
      <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{activePage}</h2>
      <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Page content not yet configured.</p>
    </div>
  )
}
