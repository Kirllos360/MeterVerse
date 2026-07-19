"use client"

import { useEffect } from "react"
import { useWorkspaceStore } from "@/workspace/stores"
import { useAuthRuntime } from "@/identity/auth/AuthRuntime"
import { WorkspaceLayout } from "@/workspace/components/WorkspaceLayout"
import { WorkspaceTabs } from "@/workspace/components/WorkspaceTabs"
import { SidebarContent } from "@/workspace/components/SidebarContent"
import { ToolbarContent } from "@/workspace/components/ToolbarContent"
import { StatusBarContent } from "@/workspace/components/StatusBarContent"
import { ContextPanel } from "@/workspace/components/ContextPanel"
import { WorkspaceContent } from "@/workspace/components/WorkspaceContent"
import AdminLoginPage from "@/app/login/page"
import { AmbientBackground } from "@/components/effects/AmbientBackground"
export default function HomePage() {
  const { isAuthenticated } = useAuthRuntime()
  const { inspectorOpen, setInspectorOpen } = useWorkspaceStore()

  useEffect(() => { setInspectorOpen(true) }, [])

  if (!isAuthenticated) {
    return <AdminLoginPage />
  }

  return (
    <>
      <AmbientBackground />
            <WorkspaceLayout
      sidebarContent={<SidebarContent />}
      toolbarContent={<ToolbarContent onToggleInspector={() => setInspectorOpen(!inspectorOpen)} />}
      tabBar={<WorkspaceTabs />}
      statusBar={<StatusBarContent />}
      inspectorContent={<ContextPanel />}
    >
      <WorkspaceContent />
    </WorkspaceLayout>
    </>
  )
}

