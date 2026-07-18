import { create } from "zustand"

export type PermissionAction = "create" | "read" | "update" | "delete" | "export" | "approve" | "admin"
export type PermissionResource =
  | "customers" | "meters" | "readings" | "invoices" | "payments" | "tariffs"
  | "reports" | "users" | "settings" | "admin" | "billing" | "financial"
  | "monitoring" | "security" | "ai" | "developer" | "documents"

export type Role = "super_admin" | "admin" | "manager" | "operator" | "viewer"

export interface Permission {
  action: PermissionAction
  resource: PermissionResource
  scope: "own" | "department" | "all"
}

interface PermissionState {
  role: Role
  permissions: Permission[]
  setRole: (role: Role) => void
  setPermissions: (perms: Permission[]) => void
  hasPermission: (action: PermissionAction, resource: PermissionResource) => boolean
  hasRole: (role: Role) => boolean
  can: (action: PermissionAction, resource: PermissionResource) => boolean
}

const FULL_ACCESS: Permission[] = [
  { action: "create", resource: "customers", scope: "all" },
  { action: "read", resource: "customers", scope: "all" },
  { action: "update", resource: "customers", scope: "all" },
  { action: "delete", resource: "customers", scope: "all" },
  { action: "create", resource: "meters", scope: "all" },
  { action: "read", resource: "meters", scope: "all" },
  { action: "update", resource: "meters", scope: "all" },
  { action: "delete", resource: "meters", scope: "all" },
  { action: "read", resource: "readings", scope: "all" },
  { action: "create", resource: "readings", scope: "all" },
  { action: "read", resource: "invoices", scope: "all" },
  { action: "create", resource: "invoices", scope: "all" },
  { action: "update", resource: "invoices", scope: "all" },
  { action: "read", resource: "payments", scope: "all" },
  { action: "read", resource: "tariffs", scope: "all" },
  { action: "read", resource: "reports", scope: "all" },
  { action: "export", resource: "reports", scope: "all" },
  { action: "admin", resource: "users", scope: "all" },
  { action: "admin", resource: "settings", scope: "all" },
  { action: "read", resource: "monitoring", scope: "all" },
  { action: "read", resource: "security", scope: "all" },
  { action: "read", resource: "ai", scope: "all" },
  { action: "read", resource: "developer", scope: "all" },
  { action: "admin", resource: "admin", scope: "all" },
]

const VIEWER_ACCESS: Permission[] = [
  { action: "read", resource: "customers", scope: "own" },
  { action: "read", resource: "meters", scope: "own" },
  { action: "read", resource: "readings", scope: "own" },
  { action: "read", resource: "invoices", scope: "own" },
  { action: "read", resource: "payments", scope: "own" },
  { action: "read", resource: "reports", scope: "own" },
]

export const rolePermissions: Record<Role, Permission[]> = {
  super_admin: FULL_ACCESS,
  admin: FULL_ACCESS,
  manager: FULL_ACCESS.filter((p) => p.action !== "admin" && p.action !== "delete"),
  operator: FULL_ACCESS.filter((p) => p.action === "read" || p.action === "create" || p.action === "update").map((p) => ({ ...p, scope: "own" as const })),
  viewer: VIEWER_ACCESS,
}

export const usePermissionRuntime = create<PermissionState>((set, get) => ({
  role: "admin",
  permissions: FULL_ACCESS,

  setRole: (role) => set({ role, permissions: rolePermissions[role] || [] }),

  setPermissions: (permissions) => set({ permissions }),

  hasPermission: (action, resource) => {
    const { role, permissions } = get()
    if (role === "super_admin" || role === "admin") return true
    return permissions.some((p) => p.action === action && p.resource === resource)
  },

  hasRole: (role) => {
    const hierarchy: Role[] = ["super_admin", "admin", "manager", "operator", "viewer"]
    return hierarchy.indexOf(get().role) <= hierarchy.indexOf(role)
  },

  can: (action, resource) => get().hasPermission(action, resource),
}))
