"use client"

import { GenericAdminPage } from "@/admin/tables/GenericAdminPage"
import { pageConfigs } from "@/admin/tables/page-configs"

export default function AdminWebhooksPage() {
  return <GenericAdminPage config={pageConfigs["webhooks"]} />
}
