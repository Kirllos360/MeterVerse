"use client"

import PageContainer from "@/components/layout/page-container"

export default function BillingPage() {
  return (
    <PageContainer pageTitle="Billing" pageDescription="Subscription and billing management">
      <div className="flex items-center justify-center h-64 rounded-xl border-2 border-dashed" style={{ borderColor: "var(--border-default, #E5E5E5)" }}>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary, #737373)" }}>Billing Management</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>Billing settings coming soon</p>
        </div>
      </div>
    </PageContainer>
  )
}
