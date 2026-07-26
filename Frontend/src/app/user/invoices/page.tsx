"use client"

import { ListGridPage } from "@/features/grid/ListGridPage"
import { pageConfigs } from "@/admin/tables/page-configs"

export default function AdminInvoicesPage() {
  return <ListGridPage config={pageConfigs["invoices"]} />
}
