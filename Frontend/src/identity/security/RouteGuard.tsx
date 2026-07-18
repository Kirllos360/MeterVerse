"use client"

import { useRouter } from "next/navigation"
import { useAuthRuntime } from "../auth/AuthRuntime"
import { usePermissionRuntime, type PermissionAction, type PermissionResource } from "../permission/PermissionRuntime"

interface RouteGuardProps {
  children: React.ReactNode
  permission?: { action: PermissionAction; resource: PermissionResource }
  role?: "super_admin" | "admin" | "manager" | "operator" | "viewer"
  feature?: string
  fallback?: React.ReactNode
}

export function RouteGuard({ children, permission, role, feature, fallback }: RouteGuardProps) {
  const { isAuthenticated } = useAuthRuntime()
  const { hasPermission, hasRole } = usePermissionRuntime()

  if (!isAuthenticated) return null
  if (permission && !hasPermission(permission.action, permission.resource)) return <>{fallback ?? <AccessDenied />}</>
  if (role && !hasRole(role)) return <>{fallback ?? <AccessDenied />}</>

  return <>{children}</>
}

function AccessDenied() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" className="mx-auto mb-3">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <p className="text-sm font-medium" style={{ color: "var(--text-secondary, #737373)" }}>Access Denied</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>You don't have permission to view this page.</p>
      </div>
    </div>
  )
}
