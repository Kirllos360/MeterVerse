"use client"

import { GenericAdminPage } from "@/admin/tables/GenericAdminPage"
import { pageConfigs } from "@/admin/tables/page-configs"

export default function AdminActiveDevicesPage() {
  return <GenericAdminPage config={pageConfigs["active-devices"]} />
}
