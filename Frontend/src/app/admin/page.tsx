"use client"

import { useAdminStore } from "@/stores/admin-store"
import dynamic from "next/dynamic"

const HomePage = dynamic(() => import("./home/page"), { ssr: false })
const MonitoringPage = dynamic(() => import("./monitoring-view/page"), { ssr: false })
const ConnectionSettingsPage = dynamic(() => import("./connection-settings/page"), { ssr: false })
const DatabaseMgmtPage = dynamic(() => import("./database-management/page"), { ssr: false })
const MigrationUploadsPage = dynamic(() => import("./migration-uploads/page"), { ssr: false })
const LocationSettingsPage = dynamic(() => import("./location-settings/page"), { ssr: false })
const UsersPermissionsPage = dynamic(() => import("./users-permissions/page"), { ssr: false })
const CustomerSettingsPage = dynamic(() => import("./customer-settings/page"), { ssr: false })
const MeterSettingsPage = dynamic(() => import("./meter-settings/page"), { ssr: false })
const ReadingsPage = dynamic(() => import("./readings/page"), { ssr: false })
const TariffSettingsPage = dynamic(() => import("./tariff-settings/page"), { ssr: false })
const BillCycleSettingsPage = dynamic(() => import("./bill-cycle-settings/page"), { ssr: false })
const InvoicesPage = dynamic(() => import("./invoices/page"), { ssr: false })
const PaymentSettingsPage = dynamic(() => import("./payment-settings/page"), { ssr: false })
const SettingsPage = dynamic(() => import("./settings/page"), { ssr: false })
const AuditPage = dynamic(() => import("./audit/page"), { ssr: false })
const ReportSettingsPage = dynamic(() => import("./report-settings/page"), { ssr: false })
const RevenueAssurancePage = dynamic(() => import("./revenue-assurance/page"), { ssr: false })
const FinancialAiPage = dynamic(() => import("./financial-ai/page"), { ssr: false })
const DocumentGovernancePage = dynamic(() => import("./documents-governance/page"), { ssr: false })
const CommunicationPage = dynamic(() => import("./communication/page"), { ssr: false })
const UsersPage = dynamic(() => import("./users/page"), { ssr: false })
const CustomersPage = dynamic(() => import("./customers/page"), { ssr: false })
const MetersPage = dynamic(() => import("./meters/page"), { ssr: false })
const ProjectsPage = dynamic(() => import("./projects/page"), { ssr: false })
const AreasPage = dynamic(() => import("./areas/page"), { ssr: false })
const PaymentsPage = dynamic(() => import("./payments/page"), { ssr: false })
const TariffsPage = dynamic(() => import("./tariffs/page"), { ssr: false })

// ─── P1b: recovery — wire previously-orphaned operational screens into the SPA
const AccountingPage = dynamic(() => import("./accounting/page"), { ssr: false })
const CollectionsPage = dynamic(() => import("./collections/page"), { ssr: false })
const AlertsPage = dynamic(() => import("./alerts/page"), { ssr: false })
const SimPage = dynamic(() => import("./sim/page"), { ssr: false })
const ZonesPage = dynamic(() => import("./zones/page"), { ssr: false })
const UnitsPage = dynamic(() => import("./units/page"), { ssr: false })
const ServiceConnectionsPage = dynamic(() => import("./service-connections/page"), { ssr: false })
const MeterAssignmentsPage = dynamic(() => import("./meter-assignments/page"), { ssr: false })
const NotificationsPage = dynamic(() => import("./notifications/page"), { ssr: false })
const SecurityPage = dynamic(() => import("./security/page"), { ssr: false })
const RolesPage = dynamic(() => import("./roles/page"), { ssr: false })
const PermissionsPage = dynamic(() => import("./permissions/page"), { ssr: false })
const ApiKeysPage = dynamic(() => import("./api-keys/page"), { ssr: false })
const IntegrationsPage = dynamic(() => import("./integrations/page"), { ssr: false })
const WebhooksPage = dynamic(() => import("./webhooks/page"), { ssr: false })
const TasksPage = dynamic(() => import("./tasks/page"), { ssr: false })
const SchedulerPage = dynamic(() => import("./scheduler/page"), { ssr: false })
const CachePage = dynamic(() => import("./cache/page"), { ssr: false })
const BackupPage = dynamic(() => import("./backup/page"), { ssr: false })
const HealthPage = dynamic(() => import("./health/page"), { ssr: false })
const RuntimePage = dynamic(() => import("./runtime/page"), { ssr: false })
const OperationsPage = dynamic(() => import("./operations/page"), { ssr: false })
const ConnectivityCenterPage = dynamic(() => import("./connectivity-center/page"), { ssr: false })
const BusinessPage = dynamic(() => import("./business/page"), { ssr: false })
const ReportsPage = dynamic(() => import("./reports/page"), { ssr: false })

const pageMap: Record<string, React.ComponentType<any>> = {
  home: HomePage,
  monitoring: MonitoringPage,
  "connection-settings": ConnectionSettingsPage,
  "database-management": DatabaseMgmtPage,
  "migration-uploads": MigrationUploadsPage,
  "location-settings": LocationSettingsPage,
  "users-permissions": UsersPermissionsPage,
  "customer-settings": CustomerSettingsPage,
  "meter-settings": MeterSettingsPage,
  users: UsersPage,
  customers: CustomersPage,
  meters: MetersPage,
  projects: ProjectsPage,
  areas: AreasPage,
  readings: ReadingsPage,
  tariffs: TariffsPage,
  "tariff-settings": TariffSettingsPage,
  "bill-cycle-settings": BillCycleSettingsPage,
  invoices: InvoicesPage,
  payments: PaymentsPage,
  "payment-settings": PaymentSettingsPage,
  settings: SettingsPage,
  audit: AuditPage,
  "report-settings": ReportSettingsPage,
  "revenue-assurance": RevenueAssurancePage,
  "financial-ai": FinancialAiPage,
  "documents-governance": DocumentGovernancePage,
  communication: CommunicationPage,
  // P1b: wired operational screens
  accounting: AccountingPage,
  collections: CollectionsPage,
  alerts: AlertsPage,
  sim: SimPage,
  zones: ZonesPage,
  units: UnitsPage,
  "service-connections": ServiceConnectionsPage,
  "meter-assignments": MeterAssignmentsPage,
  notifications: NotificationsPage,
  security: SecurityPage,
  roles: RolesPage,
  permissions: PermissionsPage,
  "api-keys": ApiKeysPage,
  integrations: IntegrationsPage,
  webhooks: WebhooksPage,
  tasks: TasksPage,
  scheduler: SchedulerPage,
  cache: CachePage,
  backup: BackupPage,
  health: HealthPage,
  runtime: RuntimePage,
  operations: OperationsPage,
  "connectivity-center": ConnectivityCenterPage,
  business: BusinessPage,
  reports: ReportsPage,
  // P46: sub-tabs resolve to their parent workspace page (no orphan screens)
  events: MonitoringPage,
  groups: CustomerSettingsPage,
}

export default function AdminSpaPage() {
  const activePage = useAdminStore((s) => s.activePage)
  const PageComponent = pageMap[activePage] || HomePage
  return <PageComponent />
}
