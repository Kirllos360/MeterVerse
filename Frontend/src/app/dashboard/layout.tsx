import type { ReactNode } from "react"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import KBar from "@/components/kbar"
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/layout/app-sidebar"
import { TopHeader } from "@/components/shell/header/TopHeader"
import { Breadcrumbs } from "@/components/shell/header/Breadcrumbs"
import { StatusBar } from "@/components/shell/statusbar/StatusBar"

export const metadata: Metadata = {
  title: "Dashboard - MeterVerse",
  description: "MeterVerse Enterprise Operating System",
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const sidebarState = cookieStore.get("sidebar:state")?.value ?? "true"

  return (
    <SidebarProvider defaultOpen={sidebarState === "true"}>
      <KBar>
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--surface-base)" }}>
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <TopHeader
              leftSlot={<Breadcrumbs items={[{ label: "Dashboard" }]} />}
            />
            <div className="flex-1 overflow-y-auto" style={{ padding: "var(--space-6, 24px) var(--space-8, 32px)" }}>
              {children}
            </div>
            <StatusBar />
          </div>
        </div>
      </KBar>
    </SidebarProvider>
  )
}
