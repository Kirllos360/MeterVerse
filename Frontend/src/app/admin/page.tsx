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
const DatabasePage = dynamic(() => import("./database/page"), { ssr: false })
const AreasPage = dynamic(() => import("./areas/page"), { ssr: false })
const PromotionsPage = dynamic(() => import("./promotions/page"), { ssr: false })
const ApiManagementPage = dynamic(() => import("./api-management/page"), { ssr: false })
const AdminHomePage = dynamic(() => import("./home/page"), { ssr: false })
const DatabaseMgmtPage = dynamic(() => import("./database-management/page"), { ssr: false })
const ConnectionSettingsPage = dynamic(() => import("./connection-settings/page"), { ssr: false })
const MonitoringViewPage = dynamic(() => import("./monitoring-view/page"), { ssr: false })
const CustomerSettingsPage = dynamic(() => import("./customer-settings/page"), { ssr: false })
const MeterSettingsPage = dynamic(() => import("./meter-settings/page"), { ssr: false })
const LocationSettingsPage = dynamic(() => import("./location-settings/page"), { ssr: false })
const PaymentSettingsPage = dynamic(() => import("./payment-settings/page"), { ssr: false })
const UsersPermissionsPage = dynamic(() => import("./users-permissions/page"), { ssr: false })
const TariffSettingsPage = dynamic(() => import("./tariff-settings/page"), { ssr: false })
const ReportSettingsPage = dynamic(() => import("./report-settings/page"), { ssr: false })
const UploadSettingsPage = dynamic(() => import("./upload-settings/page"), { ssr: false })
const BillCycleSettingsPage = dynamic(() => import("./bill-cycle-settings/page"), { ssr: false })
const BillCyclePage = dynamic(() => import("./bill-cycle/page"), { ssr: false })

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
  database: DatabasePage,
  areas: AreasPage,
  promotions: PromotionsPage,
  "api-management": ApiManagementPage,
  "admin-home": AdminHomePage,
  "database-management": DatabaseMgmtPage,
  "connection-settings": ConnectionSettingsPage,
  "monitoring-view": MonitoringViewPage,
  "customer-settings": CustomerSettingsPage,
  "meter-settings": MeterSettingsPage,
  "location-settings": LocationSettingsPage,
  "payment-settings": PaymentSettingsPage,
  "users-permissions": UsersPermissionsPage,
  "tariff-settings": TariffSettingsPage,
  "report-settings": ReportSettingsPage,
  "upload-settings": UploadSettingsPage,
  "bill-cycle-settings": BillCycleSettingsPage,
  "bill-cycle": BillCyclePage,
}

export default function AdminSpaPage() {
  const activePage = useAdminStore((s) => s.activePage)
  const PageComponent = pageMap[activePage] || HomePage
  return <PageComponent />
}
