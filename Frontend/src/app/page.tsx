"use client"

import { useState, useEffect } from "react"
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
  // ports. Admin profile (:3535) renders the Admin console at "/". Portal
  // profile (:3030) renders the user/dashboard version at "/".
  const activePage = useAdminStore((s) => s.activePage)
  // P57-FIX (permanent): profile is derived from BOTH the browser-visible env
  // AND the runtime port (window.location.port). Port detection makes the
  // separation bulletproof — even if a server is mis-started without the env,
  // the browser port (3030 = portal, 3535 = admin) enforces the correct profile.
  const [isPortal, setIsPortal] = useState<boolean>(() => {
    if (process.env.NEXT_PUBLIC_PORTAL_MODE === "1" || process.env.NEXT_PUBLIC_PORTAL_MODE === "true") return true
    return false
  })
  useEffect(() => {
    const port = window.location.port
    // 3030 => portal; 3535 (or anything else) => admin. Overrides env as the
    // authoritative runtime signal so both ports can never show the same profile.
    setIsPortal(port === "3030")
  }, [])

  if (!isPortal) {
    // Admin profile: the Admin console at the root URL. AdminSpaPage renders
    // the page-map content; AdminLayout provides the full admin shell (nav).
    return (
      <AdminLayout title="Administration">
        <AdminSpaPage />
      </AdminLayout>
    )
  }

  const PageComponent = pageMap[activePage] || pageMap.home
  return (
    <SystemLayout theme="green" title="Dashboard">
      <PageComponent />
    </SystemLayout>
  )
}
