"use client"

import { createContext, useContext, type ReactNode } from "react"

export type PermissionAction = "create" | "read" | "update" | "delete" | "export" | "approve" | "admin"
export type PermissionResource =
  | "customers"
  | "meters"
  | "readings"
  | "invoices"
  | "payments"
  | "tariffs"
  | "reports"
  | "users"
  | "settings"
  | "admin"
  | "billing"
  | "financial"

export type Role = "super_admin" | "admin" | "manager" | "operator" | "viewer"

interface Permission {
  action: PermissionAction
  resource: PermissionResource
  scope: "own" | "department" | "all"
}

interface PermissionContextType {
  role: Role
  permissions: Permission[]
  hasPermission: (action: PermissionAction, resource: PermissionResource) => boolean
  hasRole: (role: Role) => boolean
  canCreate: (resource: PermissionResource) => boolean
  canRead: (resource: PermissionResource) => boolean
  canUpdate: (resource: PermissionResource) => boolean
  canDelete: (resource: PermissionResource) => boolean
  canExport: (resource: PermissionResource) => boolean
  canApprove: (resource: PermissionResource) => boolean
}

const defaultPermissions: Permission[] = [
  { action: "read", resource: "customers", scope: "all" },
  { action: "read", resource: "meters", scope: "all" },
  { action: "read", resource: "readings", scope: "all" },
  { action: "read", resource: "invoices", scope: "all" },
  { action: "read", resource: "payments", scope: "all" },
  { action: "read", resource: "tariffs", scope: "all" },
  { action: "read", resource: "reports", scope: "all" },
]

const defaultContext: PermissionContextType = {
  role: "admin",
  permissions: defaultPermissions,
  hasPermission: () => true,
  hasRole: () => true,
  canCreate: () => true,
  canRead: () => true,
  canUpdate: () => true,
  canDelete: () => true,
  canExport: () => true,
  canApprove: () => true,
}

const PermissionContext = createContext<PermissionContextType>(defaultContext)

export function PermissionProvider({
  children,
  role = "admin",
  permissions = defaultPermissions,
}: {
  children: ReactNode
  role?: Role
  permissions?: Permission[]
}) {
  const hasPermission = (action: PermissionAction, resource: PermissionResource) => {
    if (role === "super_admin" || role === "admin") return true
    return permissions.some((p) => p.action === action && p.resource === resource)
  }

  const hasRole = (r: Role) => {
    const hierarchy: Role[] = ["super_admin", "admin", "manager", "operator", "viewer"]
    return hierarchy.indexOf(role) <= hierarchy.indexOf(r)
  }

  const value: PermissionContextType = {
    role,
    permissions,
    hasPermission,
    hasRole,
    canCreate: (r) => hasPermission("create", r),
    canRead: (r) => hasPermission("read", r),
    canUpdate: (r) => hasPermission("update", r),
    canDelete: (r) => hasPermission("delete", r),
    canExport: (r) => hasPermission("export", r),
    canApprove: (r) => hasPermission("approve", r),
  }

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
}

export const usePermission = () => useContext(PermissionContext)
