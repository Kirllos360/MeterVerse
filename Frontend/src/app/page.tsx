"use client"

import SystemLayout from "@/admin/layout/SystemLayout"
import SystemDashboard from "@/admin/dashboard/SystemDashboard"
import AdminLayout from "@/admin/layout/AdminLayout"
import AdminSpaPage from "@/app/admin/page"
import { useAdminStore } from "@/stores/admin-store"
import dynamic from "next/dynamic"

const CustomersPage = dynamic(() => import("@/app/admin/customers/page"), { ssr: false })
const MetersPage = dynamic(() => import("@/app/admin/meters/page"), { ssr: false })
const InvoicesPage = dynamic(() => import("@/app/admin/invoices/page"), { ssr: false })
const AccountingPage = dynamic(() => import("@/app/accounting/page"), { ssr: false })
const WorkspacePage = dynamic(() => import("@/app/workspace/page"), { ssr: false })
const UploadPage = dynamic(() => import("@/app/upload/page"), { ssr: false })
const AddDataPage = dynamic(() => import("@/app/add-data/page"), { ssr: false })
const TrackingPage = dynamic(() => import("@/app/tracking/page"), { ssr: false })
const SimCardsPage = dynamic(() => import("@/app/sim-cards/page"), { ssr: false })
const TicketsPage = dynamic(() => import("@/app/tickets/page"), { ssr: false })
const InfoGuidePage = dynamic(() => import("@/app/info-guide/page"), { ssr: false })

const pageMap: Record<string, React.ComponentType<any>> = {
  home: () => <SystemDashboard brandColor="#059669" title="Dashboard" />,
  customers: CustomersPage,
  meters: MetersPage,
  invoices: InvoicesPage,
  accounting: AccountingPage,
  workspace: WorkspacePage,
  upload: UploadPage,
  "add-data": AddDataPage,
  tracking: TrackingPage,
  "sim-cards": SimCardsPage,
  tickets: TicketsPage,
  "info-guide": InfoGuidePage,
}

export default function RootPage() {
  // P54-standalone: the SAME app serves two standalone versions on separate
  // ports. Admin profile (:3535, PORTAL_MODE unset) renders the Admin console
  // directly at "/" (URL stays localhost:3535). Portal profile (:3030,
  // PORTAL_MODE=1) renders the user/dashboard version at "/".
  const activePage = useAdminStore((s) => s.activePage)
  const isPortal = process.env.PORTAL_MODE === "1"

  if (!isPortal) {
    // Admin profile: the Admin console at the root URL.
    return <AdminSpaPage />
  }

  const PageComponent = pageMap[activePage] || pageMap.home
  return (
    <SystemLayout theme="green" title="Dashboard">
      <PageComponent />
    </SystemLayout>
  )
}
