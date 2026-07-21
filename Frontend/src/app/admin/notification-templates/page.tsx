"use client"

import { GenericAdminPage } from "@/admin/tables/GenericAdminPage"
import { pageConfigs } from "@/admin/tables/page-configs"

export default function AdminNotificationTemplatesPage() {
  return <GenericAdminPage config={pageConfigs["notification-templates"]} />
}
