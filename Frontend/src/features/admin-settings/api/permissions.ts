// Permission-aware UI utilities
// Reads the current user's role from localStorage and provides check functions

export function getUserRole(): string | null {
  if (typeof window === "undefined") return null
  const devToken = localStorage.getItem("mv-dev-token")
  if (devToken) return "super_admin"
  const stored = localStorage.getItem("mv-identity")
  if (!stored) return null
  try {
    const { state } = JSON.parse(stored)
    return state?.user?.role || null
  } catch { return null }
}

export function hasPermission(required: string[]): boolean {
  const role = getUserRole()
  if (!role) return false
  if (role === "super_admin") return true
  const rolePermissions: Record<string, string[]> = {
    admin: ["read", "write", "delete", "export"],
    operator: ["read", "write"],
    viewer: ["read"],
    billing: ["read", "export"],
    finance: ["read", "write", "export"],
  }
  const userPerms = rolePermissions[role] || ["read"]
  return required.some(r => userPerms.includes(r))
}

export function can(permission: string): boolean {
  return hasPermission([permission])
}
