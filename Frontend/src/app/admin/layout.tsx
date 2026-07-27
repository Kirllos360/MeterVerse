"use client"

import AdminLayout from "@/admin/layout/AdminLayout"

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout title="Administration">
      {children}
    </AdminLayout>
  )
}
