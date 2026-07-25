"use client"

import { useDashboardStore } from "@/stores/dashboard-store"
import dynamic from "next/dynamic"

const OverviewPage = dynamic(() => import("@/app/dashboard/overview/page"), { ssr: false })
const CustomersPage = dynamic(() => import("@/app/dashboard/customers/page"), { ssr: false })
const MetersPage = dynamic(() => import("@/app/dashboard/meters/page"), { ssr: false })
const ReadingsPage = dynamic(() => import("@/app/dashboard/readings/page"), { ssr: false })
const InvoicesPage = dynamic(() => import("@/app/dashboard/invoices/page"), { ssr: false })
const PaymentsPage = dynamic(() => import("@/app/dashboard/billing/page"), { ssr: false })
const UsersPage = dynamic(() => import("@/app/dashboard/users/page").then(m => ({ default: () => m.default({} as any) })), { ssr: false })
const SettingsPage = dynamic(() => import("@/app/dashboard/settings/page"), { ssr: false })
const NotificationsPage = dynamic(() => import("@/app/dashboard/notifications/page"), { ssr: false })
const KanbanPage = dynamic(() => import("@/app/dashboard/kanban/page"), { ssr: false })
const ChatPage = dynamic(() => import("@/app/dashboard/chat/page"), { ssr: false })
const ProductPage = dynamic(() => import("@/app/dashboard/product/page").then(m => ({ default: () => m.default({} as any) })), { ssr: false })
const WorkspacesPage = dynamic(() => import("@/app/dashboard/workspaces/page"), { ssr: false })
const ExclusivePage = dynamic(() => import("@/app/dashboard/exclusive/page"), { ssr: false })
const FormsBasicPage = dynamic(() => import("@/app/dashboard/forms/basic/page"), { ssr: false })
const ReactQueryPage = dynamic(() => import("@/app/dashboard/react-query/page"), { ssr: false })
const IconsPage = dynamic(() => import("@/app/dashboard/elements/icons/page"), { ssr: false })
const ProfilePage = dynamic(() => import("@/app/dashboard/profile/[[...profile]]/page"), { ssr: false })

const pages: Record<string, React.ComponentType | null> = {
  overview: OverviewPage,
  customers: CustomersPage,
  meters: MetersPage,
  readings: ReadingsPage,
  invoices: InvoicesPage,
  payments: PaymentsPage,
  billing: PaymentsPage,
  users: UsersPage,
  settings: SettingsPage,
  profile: ProfilePage,
  notifications: NotificationsPage,
  kanban: KanbanPage,
  chat: ChatPage,
  product: ProductPage,
  workspaces: WorkspacesPage,
  exclusive: ExclusivePage,
  "forms-basic": FormsBasicPage,
  "react-query": ReactQueryPage,
  icons: IconsPage,
}

export function DashboardPageSwitch() {
  const activePage = useDashboardStore((s) => s.activePage)
  const PageComponent = pages[activePage]
  if (!PageComponent) return <OverviewPage />
  return <PageComponent />
}
