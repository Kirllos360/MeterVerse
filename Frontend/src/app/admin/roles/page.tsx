"use client"

import { useState, useEffect } from "react"

interface Permission { id: string; name: string; description: string; module: string }
interface Role { id: string; name: string; description: string; isSystem: boolean; permissions: { permission: Permission }[]; _count: { users: number } }

const MODULES = ["Users", "Roles", "Settings", "Audit", "Customers", "Meters", "Readings", "Invoices", "Payments", "System"]

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/roles").then((r) => r.json()),
      fetch("/api/admin/permissions").then((r) => r.json()),
    ]).then(([rData, pData]) => {
      setRoles(rData.roles || [])
      setPermissions(pData.permissions || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const getRolePermission = (roleId: string, permName: string) => {
    const role = roles.find((r) => r.id === roleId)
    if (!role) return false
    return role.permissions.some((p) => p.permission.name === permName)
  }

  if (loading) return <div className="p-6 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Loading...</div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Role & Permission Matrix</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{roles.length} roles · {permissions.length} permissions — RBAC management</p>
        </div>
        <button className="px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: "var(--status-error)" }}>Create Role</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {roles.map((role) => (
          <div key={role.id} className="p-4 rounded-xl border" style={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-medium text-white">{role.name}</span>
                {role.isSystem && <span className="ml-2 text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>system</span>}
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{role.description}</p>
              </div>
              <span className="px-2 py-1 rounded text-[10px] font-medium" style={{ backgroundColor: "rgba(var(--status-error-rgb), 0.15)", color: "var(--status-error)" }}>
                {role._count.users} users
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-surface)" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--admin-border)" }}>
          <h2 className="text-sm font-semibold text-white">Permission Matrix</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: "var(--admin-surface)" }}>
                <th className="text-left px-4 py-2 font-medium sticky left-0 z-10" style={{ color: "rgba(255,255,255,0.4)", borderBottom: "1px solid var(--admin-border)", backgroundColor: "var(--admin-surface)" }}>Permission</th>
                {roles.map((r) => <th key={r.id} className="text-center px-3 py-2 font-medium" style={{ color: "rgba(255,255,255,0.4)", borderBottom: "1px solid var(--admin-border)" }}>{r.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((mod) => (
                <>
                  <tr key={mod}>
                    <td className="px-4 py-2 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.5)", borderBottom: "1px solid var(--admin-border)", backgroundColor: "rgba(255,255,255,0.03)" }} colSpan={roles.length + 1}>{mod}</td>
                  </tr>
                  {permissions.filter((p) => p.module === mod).map((perm) => (
                    <tr key={perm.id}>
                      <td className="px-4 py-2 text-xs" style={{ color: "rgba(255,255,255,0.6)", borderBottom: "1px solid var(--admin-border)", backgroundColor: "var(--admin-surface)" }}>{perm.name}</td>
                      {roles.map((r) => (
                        <td key={r.id} className="text-center px-3 py-2" style={{ borderBottom: "1px solid var(--admin-border)" }}>
                          {getRolePermission(r.id, perm.name) ? <span style={{ color: "#22C55E" }}>✓</span> : <span style={{ color: "rgba(255,255,255,0.15)" }}>—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
