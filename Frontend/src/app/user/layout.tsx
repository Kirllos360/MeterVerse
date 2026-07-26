"use client"

import SystemLayout from "@/admin/layout/SystemLayout"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <SystemLayout theme="green" title="Dashboard">
      {children}
    </SystemLayout>
  )
}
