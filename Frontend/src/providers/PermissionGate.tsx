"use client"

import { usePermission, type PermissionAction, type PermissionResource } from "./permission-context"

interface PermissionGateProps {
  action: PermissionAction
  resource: PermissionResource
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGate({ action, resource, fallback = null, children }: PermissionGateProps) {
  const { hasPermission } = usePermission()

  if (!hasPermission(action, resource)) return <>{fallback}</>
  return <>{children}</>
}

interface RoleGateProps {
  role: "super_admin" | "admin" | "manager" | "operator" | "viewer"
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function RoleGate({ role: minimumRole, fallback = null, children }: RoleGateProps) {
  const { hasRole } = usePermission()

  if (!hasRole(minimumRole)) return <>{fallback}</>
  return <>{children}</>
}
