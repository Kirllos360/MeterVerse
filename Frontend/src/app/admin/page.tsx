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

// ─── P52: wire remaining secondary feature pages (no unreachable screens)
const ActiveDevicesPage = dynamic(() => import("./active-devices/page"), { ssr: false })
const AiPage = dynamic(() => import("./ai/page"), { ssr: false })
const AiCommandCenterPage = dynamic(() => import("./ai-command-center/page"), { ssr: false })
const AiDiagnosticsPage = dynamic(() => import("./ai-diagnostics/page"), { ssr: false })
const AiOperationsPage = dynamic(() => import("./ai-operations/page"), { ssr: false })
const ApiPage = dynamic(() => import("./api/page"), { ssr: false })
const ApiManagementPage = dynamic(() => import("./api-management/page"), { ssr: false })
const BalancesPage = dynamic(() => import("./balances/page"), { ssr: false })
const BillCyclePage = dynamic(() => import("./bill-cycle/page"), { ssr: false })
const BrandingPage = dynamic(() => import("./branding/page"), { ssr: false })
const CrudPage = dynamic(() => import("./crud/page"), { ssr: false })
const DatabasePage = dynamic(() => import("./database/page"), { ssr: false })
const DatabaseConnectionsPage = dynamic(() => import("./database-connections/page"), { ssr: false })
const DocumentsPage = dynamic(() => import("./documents/page"), { ssr: false })
const DomainsPage = dynamic(() => import("./domains/page"), { ssr: false })
const FeatureFlagsPage = dynamic(() => import("./feature-flags/page"), { ssr: false })
const LicensePage = dynamic(() => import("./license/page"), { ssr: false })
const LocalizationPage = dynamic(() => import("./localization/page"), { ssr: false })
const LogsPage = dynamic(() => import("./logs/page"), { ssr: false })
const MonitoringViewPage = dynamic(() => import("./monitoring-view/page"), { ssr: false })
const NotificationTemplatesPage = dynamic(() => import("./notification-templates/page"), { ssr: false })
const OrganizationsPage = dynamic(() => import("./organizations/page"), { ssr: false })
const PluginsPage = dynamic(() => import("./plugins/page"), { ssr: false })
const PromotionsPage = dynamic(() => import("./promotions/page"), { ssr: false })
const QueuePage = dynamic(() => import("./queue/page"), { ssr: false })
const RcaWorkspacePage = dynamic(() => import("./rca-workspace/page"), { ssr: false })
const ReportingPage = dynamic(() => import("./reporting/page"), { ssr: false })
const ServicesPage = dynamic(() => import("./services/page"), { ssr: false })
const SessionsPage = dynamic(() => import("./sessions/page"), { ssr: false })
const SmsPage = dynamic(() => import("./sms/page"), { ssr: false })
const SmtpPage = dynamic(() => import("./smtp/page"), { ssr: false })
const StoragePage = dynamic(() => import("./storage/page"), { ssr: false })
const SyncPage = dynamic(() => import("./sync/page"), { ssr: false })
const TablesPage = dynamic(() => import("./tables/page"), { ssr: false })
const ThemesPage = dynamic(() => import("./themes/page"), { ssr: false })
const TranslationsPage = dynamic(() => import("./translations/page"), { ssr: false })
const UploadPage = dynamic(() => import("./upload/page"), { ssr: false })
const UploadSettingsPage = dynamic(() => import("./upload-settings/page"), { ssr: false })
const WorkflowsPage = dynamic(() => import("./workflows/page"), { ssr: false })

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
  // P52: secondary feature pages (all reachable)
  "active-devices": ActiveDevicesPage,
  ai: AiPage,
  "ai-command-center": AiCommandCenterPage,
  "ai-diagnostics": AiDiagnosticsPage,
  "ai-operations": AiOperationsPage,
  api: ApiPage,
  "api-management": ApiManagementPage,
  balances: BalancesPage,
  "bill-cycle": BillCyclePage,
  branding: BrandingPage,
  crud: CrudPage,
  database: DatabasePage,
  "database-connections": DatabaseConnectionsPage,
  documents: DocumentsPage,
  domains: DomainsPage,
  "feature-flags": FeatureFlagsPage,
  license: LicensePage,
  localization: LocalizationPage,
  logs: LogsPage,
  "monitoring-view": MonitoringViewPage,
  "notification-templates": NotificationTemplatesPage,
  organizations: OrganizationsPage,
  plugins: PluginsPage,
  promotions: PromotionsPage,
  queue: QueuePage,
  "rca-workspace": RcaWorkspacePage,
  reporting: ReportingPage,
  services: ServicesPage,
  sessions: SessionsPage,
  sms: SmsPage,
  smtp: SmtpPage,
  storage: StoragePage,
  sync: SyncPage,
  tables: TablesPage,
  themes: ThemesPage,
  translations: TranslationsPage,
  upload: UploadPage,
  "upload-settings": UploadSettingsPage,
  workflows: WorkflowsPage,
  // P46: sub-tabs resolve to their parent workspace page (no orphan screens)
  events: MonitoringPage,
  groups: CustomerSettingsPage,
}

export default function AdminSpaPage() {
  const activePage = useAdminStore((s) => s.activePage)
  const PageComponent = pageMap[activePage] || HomePage
  return <PageComponent />
}
