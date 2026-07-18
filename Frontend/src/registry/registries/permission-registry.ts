import { BaseRegistry } from "./base-registry"
import type { Registrable } from "../contracts/base"

export type PermissionAction = "create" | "read" | "write" | "delete" | "export" | "approve" | "admin"

export interface PermissionRegistration extends Registrable {
  key: string
  resource: string
  action: PermissionAction
  defaultRoles?: string[]
  grantedByDefault?: boolean
  group?: string
  dependsOn?: string[]
}

export class PermissionRegistry extends BaseRegistry<PermissionRegistration> {
  constructor() { super("permission-registry", "Permission Registry") }

  getByRole(role: string): PermissionRegistration[] {
    return this.getAll().filter((p) => p.defaultRoles?.includes(role))
  }

  getByResource(resource: string): PermissionRegistration[] {
    return this.getAll().filter((p) => p.resource === resource)
  }

  hasPermission(_userId: string, permission: string): boolean {
    return this.getAll().some((p) => p.key === permission && p.grantedByDefault !== false)
  }
}

export const BUILTIN_PERMISSIONS: PermissionRegistration[] = [
  { id: "perm:customers:read", key: "customers:read", resource: "customers", action: "read", defaultRoles: ["admin", "operator", "finance", "support"], grantedByDefault: true },
  { id: "perm:customers:write", key: "customers:write", resource: "customers", action: "write", defaultRoles: ["admin", "operator"] },
  { id: "perm:customers:delete", key: "customers:delete", resource: "customers", action: "delete", defaultRoles: ["admin"] },
  { id: "perm:meters:read", key: "meters:read", resource: "meters", action: "read", defaultRoles: ["admin", "operator", "technician", "support"], grantedByDefault: true },
  { id: "perm:meters:write", key: "meters:write", resource: "meters", action: "write", defaultRoles: ["admin", "operator", "technician"] },
  { id: "perm:meters:delete", key: "meters:delete", resource: "meters", action: "delete", defaultRoles: ["admin"] },
  { id: "perm:readings:create", key: "readings:create", resource: "readings", action: "create", defaultRoles: ["admin", "operator", "technician"] },
  { id: "perm:readings:approve", key: "readings:approve", resource: "readings", action: "approve", defaultRoles: ["admin"] },
  { id: "perm:invoices:generate", key: "invoices:generate", resource: "invoices", action: "create", defaultRoles: ["admin", "finance"] },
  { id: "perm:invoices:approve", key: "invoices:approve", resource: "invoices", action: "approve", defaultRoles: ["admin"] },
  { id: "perm:payments:process", key: "payments:process", resource: "payments", action: "write", defaultRoles: ["admin", "finance"] },
  { id: "perm:reports:export", key: "reports:export", resource: "reports", action: "export", defaultRoles: ["admin", "finance", "operator"] },
  { id: "perm:admin:users", key: "admin:users", resource: "admin", action: "admin", defaultRoles: ["super_admin"] },
  { id: "perm:admin:settings", key: "admin:settings", resource: "admin", action: "write", defaultRoles: ["super_admin", "admin"] },
]
