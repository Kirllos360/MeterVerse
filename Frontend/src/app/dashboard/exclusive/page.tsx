"use client"

import PageContainer from "@/components/layout/page-container"

export default function ExclusivePage() {
  return (
    <PageContainer pageTitle="Exclusive" pageDescription="Premium features">
      <div className="flex items-center justify-center h-64 rounded-xl border-2 border-dashed" style={{ borderColor: "var(--border-default)" }}>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Premium Features</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>Premium features coming soon</p>
        </div>
      </div>
    </PageContainer>
  )
}
