"use client"

import SystemLayout from "@/admin/layout/SystemLayout"
import SystemDashboard from "@/admin/dashboard/SystemDashboard"
import { useAdminStore } from "@/stores/admin-store"
import dynamic from "next/dynamic"

const CustomersPage = dynamic(() => import("@/app/admin/customers/page"), { ssr: false })
const MetersPage = dynamic(() => import("@/app/admin/meters/page"), { ssr: false })
const InvoicesPage = dynamic(() => import("@/app/admin/invoices/page"), { ssr: false })

const pageMap: Record<string, React.ComponentType<any>> = {
  home: () => <SystemDashboard brandColor="#059669" title="Dashboard" />,
  customers: CustomersPage,
  meters: MetersPage,
  invoices: InvoicesPage,
}

export default function RootPage() {
  const activePage = useAdminStore((s) => s.activePage)
  const PageComponent = pageMap[activePage] || pageMap.home

  return (
    <SystemLayout theme="green" title="Dashboard">
      <PageComponent />
    </SystemLayout>
  )
}
