"use client"

export default function AdminRolesPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-semibold text-white">Role Management</h1>
      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>RBAC matrix and permission management</p>
      <div className="grid grid-cols-3 gap-3">
        {["Super Admin", "Admin", "Manager", "Operator", "Viewer", "Custom"].map((role) => (
          <div key={role} className="p-4 rounded-xl border" style={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">{role}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: "rgba(var(--status-error-rgb), 0.15)", color: "var(--status-error)" }}>{role === "Super Admin" ? "Full Access" : "Limited"}</span>
            </div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              {role === "Super Admin" ? "All resources, all actions" :
               role === "Admin" ? "All resources, no delete" :
               role === "Manager" ? "Read + write, department scope" :
               role === "Operator" ? "Read + create, own scope" :
               role === "Viewer" ? "Read only, own scope" :
               "Custom permissions"}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
