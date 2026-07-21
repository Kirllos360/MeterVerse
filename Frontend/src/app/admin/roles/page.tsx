"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

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

  if (loading) return <div className="space-y-4 animate-pulse p-6"><div className="bg-muted h-8 w-48 rounded" /><div className="bg-muted h-80 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role &amp; Permission Matrix</h1>
          <p className="text-sm text-muted-foreground mt-1">{roles.length} roles · {permissions.length} permissions — RBAC management</p>
        </div>
        <Button><Icons.add className="mr-2 h-4 w-4" />Create Role</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">{role.name}</CardTitle>
                  {role.isSystem && <Badge variant="outline" className="ml-2">system</Badge>}
                  <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                </div>
                <Badge>{role._count.users} users</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Icons.edit className="h-3 w-3 mr-1" />Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive"><Icons.trash className="h-3 w-3 mr-1" />Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold">Permission Matrix</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground sticky left-0 z-10 bg-muted/50">Permission</th>
                  {roles.map((r) => <th key={r.id} className="text-center px-3 py-2 font-medium text-muted-foreground">{r.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {MODULES.map((mod) => (
                  <>
                    <tr key={mod}>
                      <td className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/20" colSpan={roles.length + 1}>{mod}</td>
                    </tr>
                    {permissions.filter((p) => p.module === mod).map((perm) => (
                      <tr key={perm.id}>
                        <td className="px-4 py-2 text-sm border-b text-muted-foreground bg-card">{perm.name}</td>
                        {roles.map((r) => (
                          <td key={r.id} className="text-center px-3 py-2 border-b">
                            {getRolePermission(r.id, perm.name)
                              ? <span className="text-primary font-bold">✓</span>
                              : <span className="text-muted-foreground/30">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
