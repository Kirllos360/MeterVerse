"use client"

import { GenericAdminPage } from "@/admin/tables/GenericAdminPage"
import { pageConfigs } from "@/admin/tables/page-configs"

export default function DashboardInvoicesPage() {
  return <GenericAdminPage config={pageConfigs.invoices} />
}
