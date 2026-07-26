"use client"

import SystemLayout from "@/admin/layout/SystemLayout"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SystemLayout theme="red" title="Administration">
      {children}
    </SystemLayout>
  )
}
