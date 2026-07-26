"use client"

import SystemLayout from "@/admin/layout/SystemLayout"

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SystemLayout theme="green" title="Accounting">
      {children}
    </SystemLayout>
  )
}
