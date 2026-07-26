"use client"

import { useAdminStore } from "@/stores/admin-store"
import dynamic from "next/dynamic"

const HomePage = dynamic(() => import("./home/page"), { ssr: false })
const CustomersPage = dynamic(() => import("./customers/page"), { ssr: false })
const MetersPage = dynamic(() => import("./meters/page"), { ssr: false })
const MetersRelayPage = dynamic(() => import("./meters/relay/page"), { ssr: false })
const MeterAssignmentsPage = dynamic(() => import("./meter-assignments/page"), { ssr: false })
const SimPage = dynamic(() => import("./sim/page"), { ssr: false })
const ReadingsPage = dynamic(() => import("./readings/page"), { ssr: false })
const InvoicesPage = dynamic(() => import("./invoices/page"), { ssr: false })
const PaymentsPage = dynamic(() => import("./payments/page"), { ssr: false })
const TariffsPage = dynamic(() => import("./tariffs/page"), { ssr: false })
const UsersPage = dynamic(() => import("./users/page"), { ssr: false })
const RolesPage = dynamic(() => import("./roles/page"), { ssr: false })
const AuditPage = dynamic(() => import("./audit/page"), { ssr: false })
const ProjectsPage = dynamic(() => import("./projects/page"), { ssr: false })
const ZonesPage = dynamic(() => import("./zones/page"), { ssr: false })
const UnitsPage = dynamic(() => import("./units/page"), { ssr: false })
const ReportsPage = dynamic(() => import("./reports/page"), { ssr: false })
const MonitoringPage = dynamic(() => import("./monitoring/page"), { ssr: false })
const SettingsPage = dynamic(() => import("./settings/page"), { ssr: false })
const RcaWorkspacePage = dynamic(() => import("./rca-workspace/page"), { ssr: false })
const AiCommandCenterPage = dynamic(() => import("./ai-command-center/page"), { ssr: false })
const AiOperationsPage = dynamic(() => import("./ai-operations/page"), { ssr: false })

const pageMap: Record<string, React.ComponentType<any>> = {
  home: HomePage,
  customers: CustomersPage,
  meters: MetersPage,
  "meters-relay": MetersRelayPage,
  "meter-assignments": MeterAssignmentsPage,
  sim: SimPage,
  readings: ReadingsPage,
  invoices: InvoicesPage,
  payments: PaymentsPage,
  tariffs: TariffsPage,
  users: UsersPage,
  roles: RolesPage,
  audit: AuditPage,
  projects: ProjectsPage,
  zones: ZonesPage,
  units: UnitsPage,
  reports: ReportsPage,
  monitoring: MonitoringPage,
  settings: SettingsPage,
  "rca-workspace": RcaWorkspacePage,
  "ai-command-center": AiCommandCenterPage,
  "ai-operations": AiOperationsPage,
}

export default function AdminSpaPage() {
  const activePage = useAdminStore((s) => s.activePage)
  const PageComponent = pageMap[activePage] || HomePage
  return <PageComponent />
}
