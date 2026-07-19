import PageContainer from "@/components/layout/page-container"

export default function WorkspacePage() {
  return (
    <PageContainer pageTitle="Workspace" pageDescription="Current workspace overview">
      <div className="flex items-center justify-center h-64 rounded-xl border-2 border-dashed" style={{ borderColor: "var(--border-default)" }}>
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Workspace content will appear here</p>
      </div>
    </PageContainer>
  )
}
