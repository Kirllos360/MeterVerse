"use client"

import { useAdminStore } from "@/stores/admin-store"
import dynamic from "next/dynamic"

const HomePage = dynamic(() => import("./home/page"), { ssr: false })
const CustomersPage = dynamic(() => import("./customers/page"), { ssr: false })
const MetersPage = dynamic(() => import("./meters/page"), { ssr: false })
const InvoicesPage = dynamic(() => import("./invoices/page"), { ssr: false })
const PaymentsPage = dynamic(() => import("../admin/payments/page"), { ssr: false })
const UsersPage = dynamic(() => import("../admin/users/page"), { ssr: false })
const SettingsPage = dynamic(() => import("../admin/settings/page"), { ssr: false })
const ReportsPage = dynamic(() => import("../admin/reports/page"), { ssr: false })
const MonitoringPage = dynamic(() => import("../admin/monitoring/page"), { ssr: false })
const ProjectsPage = dynamic(() => import("../admin/projects/page"), { ssr: false })
const ZonesPage = dynamic(() => import("../admin/zones/page"), { ssr: false })
const UnitsPage = dynamic(() => import("../admin/units/page"), { ssr: false })
const TariffsPage = dynamic(() => import("../admin/tariffs/page"), { ssr: false })

const pageMap: Record<string, React.ComponentType<any>> = {
  home: HomePage,
  customers: CustomersPage,
  meters: MetersPage,
  invoices: InvoicesPage,
  payments: PaymentsPage,
  users: UsersPage,
  settings: SettingsPage,
  reports: ReportsPage,
  monitoring: MonitoringPage,
  projects: ProjectsPage,
  zones: ZonesPage,
  units: UnitsPage,
  tariffs: TariffsPage,
}

export default function UserSpaPage() {
  const activePage = useAdminStore((s) => s.activePage)
  const PageComponent = pageMap[activePage] || HomePage
  return <PageComponent />
}
