import PageContainer from "@/components/layout/page-container"

export default function SettingsPage() {
  return (
    <PageContainer pageTitle="Settings" pageDescription="System settings and preferences">
      <div className="flex items-center justify-center h-64 rounded-xl border-2 border-dashed" style={{ borderColor: "var(--border-default, #E5E5E5)" }}>
        <p className="text-sm" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>Settings will appear here</p>
      </div>
    </PageContainer>
  )
}
