"use client"

import { createContext, useContext, type ReactNode } from "react"
import { usePermissionRuntime, type PermissionAction, type PermissionResource, type Role } from "@/identity/permission/PermissionRuntime"

export { type PermissionAction, type PermissionResource, type Role } from "@/identity/permission/PermissionRuntime"

export interface Permission {
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

// P57 unification: the mock always-true provider was a dual-permission source of
// truth. `usePermission` now reads from the REAL PermissionRuntime zustand store so
// authorization can never silently pass under a mock. PermissionProvider is kept as
// a thin identity wrapper for compatibility (root layout no longer needs to mount it).
const PermissionContext = createContext<PermissionContextType | null>(null)

export function PermissionProvider({ children }: { children: ReactNode }) {
  const runtime = usePermissionRuntime()
  const hasPermission = (action: PermissionAction, resource: PermissionResource) => runtime.hasPermission(action, resource)
  const hasRole = (role: Role) => runtime.hasRole(role)
  const value: PermissionContextType = {
    role: runtime.role,
    permissions: runtime.permissions,
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

export function usePermission(): PermissionContextType {
  const ctx = useContext(PermissionContext)
  if (ctx) return ctx
  // Fallback outside provider: delegate to the real store (never mock-allowed).
  const runtime = usePermissionRuntime()
  return {
    role: runtime.role,
    permissions: runtime.permissions,
    hasPermission: (a, r) => runtime.hasPermission(a, r),
    hasRole: (r) => runtime.hasRole(r),
    canCreate: (r) => runtime.hasPermission("create", r),
    canRead: (r) => runtime.hasPermission("read", r),
    canUpdate: (r) => runtime.hasPermission("update", r),
    canDelete: (r) => runtime.hasPermission("delete", r),
    canExport: (r) => runtime.hasPermission("export", r),
    canApprove: (r) => runtime.hasPermission("approve", r),
  }
}
