"use client"

import type { ReactNode } from "react"
import { usePermissionRuntime, type PermissionAction, type PermissionResource } from "../permission/PermissionRuntime"

interface PermissionGuardProps {
  action: PermissionAction
  resource: PermissionResource
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGuard({ action, resource, fallback = null, children }: PermissionGuardProps) {
  const { hasPermission } = usePermissionRuntime()
  if (!hasPermission(action, resource)) return <>{fallback}</>
  return <>{children}</>
}

interface RoleGuardProps {
  role: "super_admin" | "admin" | "manager" | "operator" | "viewer"
  fallback?: ReactNode
  children: ReactNode
}

export function RoleGuard({ role: minRole, fallback = null, children }: RoleGuardProps) {
  const { hasRole } = usePermissionRuntime()
  if (!hasRole(minRole)) return <>{fallback}</>
  return <>{children}</>
}

export function usePermission() {
  const { hasPermission, hasRole, role, can } = usePermissionRuntime()
  return { hasPermission, hasRole, role, can }
}
