"use client"

export default function AdminUsersPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">User Management</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Manage administrators and system users</p>
        </div>
        <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: "var(--status-error)" }}>Add User</button>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-surface)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "var(--admin-surface)" }}>
              {["Name", "Email", "Role", "Status", "Last Active"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)", borderBottom: "1px solid var(--admin-border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Admin User", email: "admin@meterverse.com", role: "Super Admin", status: "Active", last: "Just now" },
              { name: "System Operator", email: "operator@meterverse.com", role: "Operator", status: "Active", last: "5m ago" },
              { name: "Viewer Account", email: "viewer@meterverse.com", role: "Viewer", status: "Inactive", last: "2d ago" },
            ].map((u) => (
              <tr key={u.email}>
                {[u.name, u.email, u.role, u.status, u.last].map((v, i) => (
                  <td key={i} className="px-4 py-3 text-sm" style={{ color: i === 3 && v === "Active" ? "#22C55E" : i === 3 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)", borderBottom: "1px solid var(--admin-border)" }}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
