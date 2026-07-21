"use client"

import { GenericAdminPage } from "@/admin/tables/GenericAdminPage"
import { pageConfigs } from "@/admin/tables/page-configs"

export default function DashboardCustomersPage() {
  return <GenericAdminPage config={pageConfigs.customers} />
}
