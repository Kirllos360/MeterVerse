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
  readings: ReadingsPage,
  "tariff-settings": TariffSettingsPage,
  "bill-cycle-settings": BillCycleSettingsPage,
  invoices: InvoicesPage,
  "payment-settings": PaymentSettingsPage,
  settings: SettingsPage,
  audit: AuditPage,
  "report-settings": ReportSettingsPage,
  "revenue-assurance": RevenueAssurancePage,
  "financial-ai": FinancialAiPage,
  "documents-governance": DocumentGovernancePage,
  // P46: sub-tabs resolve to their parent workspace page (no orphan screens)
  events: MonitoringPage,
  groups: CustomerSettingsPage,
}

export default function AdminSpaPage() {
  const activePage = useAdminStore((s) => s.activePage)
  const PageComponent = pageMap[activePage] || HomePage
  return <PageComponent />
}
