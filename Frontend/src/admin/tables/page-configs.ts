import { Icons } from "@/components/icons"
import type { PageConfig } from "./page-config"

const statusField: PageConfig["statusField"] = "status"

const defaultFields = (extra: PageConfig["fields"] = []): PageConfig["fields"] => [
  ...extra,
  { name: "status", label: "Status", type: "select", options: [
    { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" },
    { value: "maintenance", label: "Maintenance" }, { value: "terminated", label: "Terminated" },
  ]},
]

export const pageConfigs: Record<string, PageConfig> = {
  customers: {
    id: "customers", title: "Customers", description: "Manage your customer base",
    apiEndpoint: "/api/admin/users",
    statusField,
    transform: (d: any) => (d.users || []).map((u: any) => ({
      id: u.id, name: u.name, email: u.email, phone: u.phone || "",
      status: u.status || "active", area: u.area || "", createdAt: u.createdAt || "",
    })),
    columns: [
      { id: "name", header: "Name", accessor: r => r.name, type: "avatar", width: 220 },
      { id: "email", header: "Email", accessor: r => r.email, type: "email" },
      { id: "phone", header: "Phone", accessor: r => r.phone || "—", width: 140 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
      { id: "area", header: "Area", accessor: r => r.area || "—", width: 120 },
      { id: "createdAt", header: "Created", accessor: r => r.createdAt, type: "date", width: 110 },
    ],
    fields: defaultFields([
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "John Doe" },
      { name: "email", label: "Email", type: "email", required: true, placeholder: "john@example.com" },
      { name: "phone", label: "Phone", type: "phone", placeholder: "+1 555 0123" },
      { name: "area", label: "Area", type: "text", placeholder: "New Cairo" },
    ]),
    statsCards: [
      { label: "Total Customers", icon: Icons.teams, value: rows => rows.length },
      { label: "Active", icon: Icons.circleCheck, value: rows => rows.filter(r => r.status === "active").length },
      { label: "Inactive", icon: Icons.circleX, value: rows => rows.filter(r => r.status === "inactive").length },
      { label: "Maintenance", icon: Icons.settings, value: rows => rows.filter(r => r.status === "maintenance").length },
    ],
  },

  users: {
    id: "users", title: "User Management", description: "Manage administrators and system users",
    apiEndpoint: "/api/admin/users",
    statusField,
    transform: (d: any) => (d.users || []).map((u: any) => ({
      id: u.id, name: u.name, email: u.email, role: u.role || "user",
      phone: u.phone || "", status: u.status || "active",
      lastActiveAt: u.lastActiveAt, createdAt: u.createdAt || "",
    })),
    columns: [
      { id: "name", header: "Name", accessor: r => r.name, type: "avatar", width: 220 },
      { id: "email", header: "Email", accessor: r => r.email, type: "email" },
      { id: "role", header: "Role", accessor: r => r.role, type: "badge", badgeVariant: () => "outline", width: 120 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
      { id: "lastActiveAt", header: "Last Active", accessor: r => r.lastActiveAt || "Never", type: "date", width: 120 },
    ],
    fields: defaultFields([
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "John Doe" },
      { name: "email", label: "Email", type: "email", required: true, placeholder: "john@example.com" },
      { name: "phone", label: "Phone", type: "phone", placeholder: "+1 555 0123" },
      { name: "role", label: "Role", type: "select", options: [
        { value: "admin", label: "Admin" }, { value: "manager", label: "Manager" },
        { value: "operator", label: "Operator" }, { value: "viewer", label: "Viewer" },
      ]},
    ]),
    statsCards: [
      { label: "Total Users", icon: Icons.teams, value: rows => rows.length },
      { label: "Active", icon: Icons.circleCheck, value: rows => rows.filter(r => r.status === "active").length },
      { label: "Inactive", icon: Icons.circleX, value: rows => rows.filter(r => r.status === "inactive").length },
    ],
  },

  roles: {
    id: "roles", title: "Role & Permission Matrix", description: "RBAC management — roles and permissions",
    apiEndpoint: "/api/admin/roles",
    statusField,
    transform: (d: any) => (d.roles || []).map((r: any) => ({
      id: r.id, name: r.name, description: r.description || "",
      isSystem: r.isSystem || false, userCount: r._count?.users || 0, status: r.status || "active",
    })),
    columns: [
      { id: "name", header: "Role", accessor: r => r.name, type: "avatar", width: 200 },
      { id: "description", header: "Description", accessor: r => r.description },
      { id: "userCount", header: "Users", accessor: r => r.userCount, type: "number", width: 80 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
    ],
    fields: defaultFields([
      { name: "name", label: "Role Name", type: "text", required: true, placeholder: "e.g., Manager" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Describe this role..." },
    ]),
    statsCards: [
      { label: "Total Roles", icon: Icons.lock, value: rows => rows.length },
      { label: "Active", icon: Icons.circleCheck, value: rows => rows.filter(r => r.status === "active").length },
    ],
  },

  audit: {
    id: "audit", title: "Audit Logs", description: "System audit trail",
    apiEndpoint: "/api/admin/audit",
    statusField,
    transform: (d: any) => (d.entries || []).map((e: any) => ({
      id: e.id, actor: e.actor || "system", action: e.action,
      resource: e.resource || "—", status: e.status === "success" ? "active" : "terminated",
      timestamp: e.timestamp || "",
    })),
    columns: [
      { id: "timestamp", header: "Time", accessor: r => r.timestamp, type: "date", width: 110 },
      { id: "actor", header: "Actor", accessor: r => r.actor, width: 140 },
      { id: "action", header: "Action", accessor: r => r.action },
      { id: "resource", header: "Resource", accessor: r => r.resource },
      { id: "status", header: "Status", accessor: r => r.status === "active" ? "success" : "failure", type: "badge", badgeVariant: (v:string) => v === "success" ? "default" : "destructive", width: 100 },
    ],
    fields: defaultFields([]),
    statsCards: [
      { label: "Total Entries", icon: Icons.clock, value: rows => rows.length },
      { label: "Success", icon: Icons.circleCheck, value: rows => rows.filter(r => r.status === "active").length },
      { label: "Failures", icon: Icons.circleX, value: rows => rows.filter(r => r.status !== "active").length },
    ],
  },

  "api-keys": {
    id: "api-keys", title: "API Keys", description: "Manage API access keys",
    apiEndpoint: "/api/admin/api-keys",
    statusField,
    transform: (d: any) => (d.keys || d.apiKeys || []).map((k: any) => ({
      id: k.id, name: k.name || k.key?.substring(0, 16), key: k.key || k.id,
      status: k.status || "active", createdAt: k.createdAt || "",
      lastUsed: k.lastUsed || "",
    })),
    columns: [
      { id: "name", header: "Name", accessor: r => r.name, type: "avatar", width: 200 },
      { id: "key", header: "Key", accessor: r => r.key?.substring(0, 24) + "..." },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
      { id: "lastUsed", header: "Last Used", accessor: r => r.lastUsed, type: "date", width: 120 },
      { id: "createdAt", header: "Created", accessor: r => r.createdAt, type: "date", width: 110 },
    ],
    fields: defaultFields([
      { name: "name", label: "Key Name", type: "text", required: true, placeholder: "My API Key" },
    ]),
    statsCards: [
      { label: "Total Keys", icon: Icons.lock, value: rows => rows.length },
      { label: "Active", icon: Icons.circleCheck, value: rows => rows.filter(r => r.status === "active").length },
    ],
  },

  backup: {
    id: "backup", title: "Backup Management", description: "Database and system backups",
    apiEndpoint: "/api/admin/backups",
    statusField,
    transform: (d: any) => (d.backups || []).map((b: any) => ({
      id: b.id, name: b.name || b.filename || `Backup ${b.id?.substring(0,8)}`,
      size: b.size || "—", status: b.status || "completed",
      createdAt: b.createdAt || "",
    })),
    columns: [
      { id: "name", header: "Backup", accessor: r => r.name, width: 220 },
      { id: "size", header: "Size", accessor: r => r.size, width: 100 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
      { id: "createdAt", header: "Created", accessor: r => r.createdAt, type: "date", width: 110 },
    ],
    fields: defaultFields([]),
    statsCards: [
      { label: "Total Backups", icon: Icons.fileTypeDoc, value: rows => rows.length },
      { label: "Completed", icon: Icons.circleCheck, value: rows => rows.filter(r => r.status === "completed" || r.status === "active").length },
    ],
  },

  sessions: {
    id: "sessions", title: "User Sessions", description: "Active and recent user sessions",
    apiEndpoint: "/api/admin/sessions",
    statusField,
    transform: (d: any) => (d.sessions || []).map((s: any) => ({
      id: s.id, user: s.userName || s.user || s.userId || "—",
      ip: s.ip || "—", device: s.device || s.userAgent?.substring(0,30) || "—",
      status: s.status || "active", createdAt: s.createdAt || "",
    })),
    columns: [
      { id: "user", header: "User", accessor: r => r.user, width: 160 },
      { id: "ip", header: "IP Address", accessor: r => r.ip, width: 140 },
      { id: "device", header: "Device", accessor: r => r.device },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
      { id: "createdAt", header: "Started", accessor: r => r.createdAt, type: "date", width: 110 },
    ],
    fields: defaultFields([]),
    statsCards: [
      { label: "Total Sessions", icon: Icons.user, value: rows => rows.length },
      { label: "Active", icon: Icons.circleCheck, value: rows => rows.filter(r => r.status === "active").length },
    ],
  },

  webhooks: {
    id: "webhooks", title: "Webhooks", description: "Manage webhook endpoints",
    apiEndpoint: "/api/admin/webhooks",
    statusField,
    transform: (d: any) => (d.webhooks || []).map((w: any) => ({
      id: w.id, name: w.name || w.label || w.url?.substring(0,20),
      url: w.url || "—", event: w.event || w.events?.join(",") || "—",
      status: w.status || "active", createdAt: w.createdAt || "",
    })),
    columns: [
      { id: "name", header: "Name", accessor: r => r.name, type: "avatar", width: 180 },
      { id: "url", header: "URL", accessor: r => r.url },
      { id: "event", header: "Event", accessor: r => r.event, type: "badge", width: 140 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
      { id: "createdAt", header: "Created", accessor: r => r.createdAt, type: "date", width: 110 },
    ],
    fields: defaultFields([
      { name: "name", label: "Webhook Name", type: "text", required: true, placeholder: "My Webhook" },
      { name: "url", label: "Endpoint URL", type: "text", required: true, placeholder: "https://example.com/webhook" },
      { name: "event", label: "Event Type", type: "select", options: [
        { value: "reading.created", label: "Reading Created" },
        { value: "invoice.generated", label: "Invoice Generated" },
        { value: "payment.received", label: "Payment Received" },
        { value: "customer.created", label: "Customer Created" },
        { value: "all", label: "All Events" },
      ]},
    ]),
    statsCards: [
      { label: "Total Webhooks", icon: Icons.code, value: rows => rows.length },
      { label: "Active", icon: Icons.circleCheck, value: rows => rows.filter(r => r.status === "active").length },
    ],
  },
}
