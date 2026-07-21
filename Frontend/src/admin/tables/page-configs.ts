import { Icons } from "@/components/icons"
import type { PageConfig } from "./page-config"

const statusField: PageConfig["statusField"] = "status"

const defFields = (extra: PageConfig["fields"] = []): PageConfig["fields"] => [
  ...extra,
  { name: "status", label: "Status", type: "select", options: [
    { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" },
    { value: "maintenance", label: "Maintenance" }, { value: "terminated", label: "Terminated" },
  ]},
]

const sc = (label: string, icon: any, value: (r: any[]) => number | string) => ({ label, icon, value })

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
    fields: defFields([
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "John Doe" },
      { name: "email", label: "Email", type: "email", required: true, placeholder: "john@example.com" },
      { name: "phone", label: "Phone", type: "phone", placeholder: "+1 555 0123" },
      { name: "area", label: "Area", type: "text", placeholder: "New Cairo" },
    ]),
    statsCards: [sc("Total", Icons.teams, r=>r.length), sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length), sc("Inactive", Icons.circleX, r=>r.filter(x=>x.status==="inactive").length), sc("Maintenance", Icons.settings, r=>r.filter(x=>x.status==="maintenance").length)],
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
    fields: defFields([
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "John Doe" },
      { name: "email", label: "Email", type: "email", required: true, placeholder: "john@example.com" },
      { name: "phone", label: "Phone", type: "phone", placeholder: "+1 555 0123" },
      { name: "role", label: "Role", type: "select", options: [ { value: "admin", label: "Admin" }, { value: "manager", label: "Manager" }, { value: "operator", label: "Operator" }, { value: "viewer", label: "Viewer" } ] },
    ]),
    statsCards: [sc("Total", Icons.teams, r=>r.length), sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length), sc("Inactive", Icons.circleX, r=>r.filter(x=>x.status==="inactive").length)],
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
    fields: defFields([
      { name: "name", label: "Role Name", type: "text", required: true, placeholder: "e.g., Manager" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Describe this role..." },
    ]),
    statsCards: [sc("Total", Icons.lock, r=>r.length), sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length)],
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
    fields: defFields([]),
    statsCards: [sc("Total", Icons.clock, r=>r.length), sc("Success", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length), sc("Failures", Icons.circleX, r=>r.filter(x=>x.status!=="active").length)],
  },
  "api-keys": {
    id: "api-keys", title: "API Keys", description: "Manage API access keys",
    apiEndpoint: "/api/admin/api-keys",
    statusField,
    transform: (d: any) => (d.keys || d.apiKeys || []).map((k: any) => ({
      id: k.id, name: k.name || k.key?.substring(0,16), key: k.key || k.id,
      status: k.status || "active", createdAt: k.createdAt || "", lastUsed: k.lastUsed || "",
    })),
    columns: [
      { id: "name", header: "Name", accessor: r => r.name, type: "avatar", width: 200 },
      { id: "key", header: "Key", accessor: r => r.key?.substring(0,24)+"..." },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
      { id: "lastUsed", header: "Last Used", accessor: r => r.lastUsed, type: "date", width: 120 },
      { id: "createdAt", header: "Created", accessor: r => r.createdAt, type: "date", width: 110 },
    ],
    fields: defFields([{ name: "name", label: "Key Name", type: "text", required: true, placeholder: "My API Key" }]),
    statsCards: [sc("Total", Icons.lock, r=>r.length), sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length)],
  },
  backup: {
    id: "backup", title: "Backup Management", description: "Database and system backups",
    apiEndpoint: "/api/admin/backups",
    statusField,
    transform: (d: any) => (d.backups || []).map((b: any) => ({
      id: b.id, name: b.name || b.filename || `Backup ${b.id?.substring(0,8)}`,
      size: b.size || "—", status: b.status || "completed", createdAt: b.createdAt || "",
    })),
    columns: [
      { id: "name", header: "Backup", accessor: r => r.name, width: 220 },
      { id: "size", header: "Size", accessor: r => r.size, width: 100 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
      { id: "createdAt", header: "Created", accessor: r => r.createdAt, type: "date", width: 110 },
    ],
    fields: defFields([]),
    statsCards: [sc("Total", Icons.fileTypeDoc, r=>r.length), sc("Completed", Icons.circleCheck, r=>r.filter(x=>x.status==="completed"||x.status==="active").length)],
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
      { id: "ip", header: "IP", accessor: r => r.ip, width: 140 },
      { id: "device", header: "Device", accessor: r => r.device },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
      { id: "createdAt", header: "Started", accessor: r => r.createdAt, type: "date", width: 110 },
    ],
    fields: defFields([]),
    statsCards: [sc("Total", Icons.user, r=>r.length), sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length)],
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
    fields: defFields([
      { name: "name", label: "Webhook Name", type: "text", required: true, placeholder: "My Webhook" },
      { name: "url", label: "Endpoint URL", type: "text", required: true, placeholder: "https://example.com/webhook" },
      { name: "event", label: "Event Type", type: "select", options: [ { value: "reading.created", label: "Reading Created" }, { value: "invoice.generated", label: "Invoice Generated" }, { value: "payment.received", label: "Payment Received" }, { value: "customer.created", label: "Customer Created" }, { value: "all", label: "All Events" } ] },
    ]),
    statsCards: [sc("Total", Icons.code, r=>r.length), sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length)],
  },

  // ─── Table-based pages (use generic template directly) ───
  "active-devices": {
    id: "active-devices", title: "Active Devices", description: "Currently active devices and sessions",
    apiEndpoint: "/api/admin/sessions",
    statusField,
    transform: (d: any) => (d.sessions || []).filter((s: any) => s.isActive || s.status === "active").map((s: any) => ({
      id: s.id, user: s.userName || s.user || s.userId || "—",
      device: s.device || s.userAgent?.substring(0,30) || "—",
      location: s.location || s.ip || "—", status: "active",
      lastActive: s.lastActiveAt || s.createdAt || "",
    })),
    columns: [
      { id: "user", header: "User", accessor: r => r.user, width: 160 },
      { id: "device", header: "Device", accessor: r => r.device },
      { id: "location", header: "Location", accessor: r => r.location, width: 140 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 100 },
      { id: "lastActive", header: "Last Active", accessor: r => r.lastActive, type: "date", width: 120 },
    ],
    fields: defFields([]),
    statsCards: [sc("Active Devices", Icons.teams, r=>r.length)],
  },
  cache: {
    id: "cache", title: "Cache Management", description: "View and manage system cache entries",
    apiEndpoint: "/api/admin/cache",
    statusField,
    transform: (d: any) => (d.entries || []).map((c: any) => ({
      id: c.id || c.key, key: c.key, value: typeof c.value === "string" ? c.value.substring(0,40) : JSON.stringify(c.value).substring(0,40),
      hits: c.hits || 0, ttl: c.ttl || "—", status: "active",
    })),
    columns: [
      { id: "key", header: "Key", accessor: r => r.key, type: "avatar", width: 200 },
      { id: "value", header: "Value", accessor: r => r.value },
      { id: "hits", header: "Hits", accessor: r => r.hits, type: "number", width: 80 },
      { id: "ttl", header: "TTL", accessor: r => r.ttl, width: 100 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 100 },
    ],
    fields: defFields([]),
    statsCards: [sc("Total Entries", Icons.settings, r=>r.length)],
  },
  health: {
    id: "health", title: "System Health", description: "Health checks and service status monitoring",
    apiEndpoint: "/api/admin/health",
    statusField,
    transform: (d: any) => (d.services || d.checks || []).map((s: any) => ({
      id: s.name || s.id, name: s.name || s.check,
      status: s.status === "healthy" || s.status === "ok" || s.status === "pass" ? "active" : s.status === "degraded" || s.status === "warn" ? "maintenance" : "terminated",
      latency: s.latency || s.duration || "—",
    })),
    columns: [
      { id: "name", header: "Service", accessor: r => r.name, type: "avatar", width: 220 },
      { id: "latency", header: "Latency", accessor: r => r.latency, width: 100 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
    ],
    fields: defFields([]),
    statsCards: [sc("Total Services", Icons.teams, r=>r.length), sc("Healthy", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length)],
  },
  license: {
    id: "license", title: "License Management", description: "System license and activation details",
    apiEndpoint: "/api/admin/license",
    statusField,
    transform: (d: any) => {
      const l = d.license || d
      return [{ id: "1", key: l.key || l.licenseKey || "—", type: l.type || "enterprise", seats: l.seats || l.maxUsers || 0, status: l.status || "active", expires: l.expiresAt || l.expiry || "—", createdAt: l.createdAt || "" }]
    },
    columns: [
      { id: "key", header: "License Key", accessor: r => r.key, width: 280 },
      { id: "type", header: "Type", accessor: r => r.type, type: "badge", width: 120 },
      { id: "seats", header: "Seats", accessor: r => r.seats, type: "number", width: 80 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 100 },
      { id: "expires", header: "Expires", accessor: r => r.expires, type: "date", width: 120 },
    ],
    fields: defFields([
      { name: "key", label: "License Key", type: "text", required: true },
      { name: "type", label: "Type", type: "select", options: [ { value: "enterprise", label: "Enterprise" }, { value: "professional", label: "Professional" }, { value: "community", label: "Community" } ] },
    ]),
    statsCards: [sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length)],
  },
  "notification-templates": {
    id: "notification-templates", title: "Notification Templates", description: "Manage email, SMS and push notification templates",
    apiEndpoint: "/api/admin/notification-templates",
    statusField,
    transform: (d: any) => (d.templates || []).map((t: any) => ({
      id: t.id, name: t.name, key: t.key || t.type || "—",
      subject: t.subject || t.title || "—", status: t.status || "active",
      createdAt: t.createdAt || "",
    })),
    columns: [
      { id: "name", header: "Name", accessor: r => r.name, type: "avatar", width: 200 },
      { id: "key", header: "Key", accessor: r => r.key, type: "email" },
      { id: "subject", header: "Subject", accessor: r => r.subject },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 100 },
      { id: "createdAt", header: "Created", accessor: r => r.createdAt, type: "date", width: 110 },
    ],
    fields: defFields([
      { name: "name", label: "Template Name", type: "text", required: true },
      { name: "subject", label: "Subject Line", type: "text", required: true },
    ]),
    statsCards: [sc("Total", Icons.post, r=>r.length), sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length)],
  },
  organizations: {
    id: "organizations", title: "Organizations", description: "Multi-tenant organization management",
    apiEndpoint: "/api/admin/organizations",
    statusField,
    transform: (d: any) => (d.organizations || []).map((o: any) => ({
      id: o.id, name: o.name, slug: o.slug || "—", plan: o.plan || o.tier || "—",
      projects: o._count?.projects || o.projectCount || 0, status: o.status || "active",
      createdAt: o.createdAt || "",
    })),
    columns: [
      { id: "name", header: "Organization", accessor: r => r.name, type: "avatar", width: 200 },
      { id: "slug", header: "Slug", accessor: r => r.slug, type: "email" },
      { id: "plan", header: "Plan", accessor: r => r.plan, type: "badge", width: 120 },
      { id: "projects", header: "Projects", accessor: r => r.projects, type: "number", width: 80 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 100 },
      { id: "createdAt", header: "Created", accessor: r => r.createdAt, type: "date", width: 110 },
    ],
    fields: defFields([
      { name: "name", label: "Organization Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "plan", label: "Plan", type: "select", options: [ { value: "enterprise", label: "Enterprise" }, { value: "professional", label: "Professional" }, { value: "starter", label: "Starter" } ] },
    ]),
    statsCards: [sc("Total", Icons.teams, r=>r.length), sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length)],
  },
  permissions: {
    id: "permissions", title: "Permissions", description: "System-wide permission definitions",
    apiEndpoint: "/api/admin/permissions",
    statusField,
    transform: (d: any) => (d.permissions || []).map((p: any) => ({
      id: p.id, name: p.name, module: p.module || "—", description: p.description || "", status: "active",
    })),
    columns: [
      { id: "name", header: "Permission", accessor: r => r.name, type: "avatar", width: 220 },
      { id: "module", header: "Module", accessor: r => r.module, type: "badge", width: 140 },
      { id: "description", header: "Description", accessor: r => r.description },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 100 },
    ],
    fields: defFields([
      { name: "name", label: "Permission Name", type: "text", required: true },
      { name: "module", label: "Module", type: "select", options: [ { value: "Users", label: "Users" }, { value: "Roles", label: "Roles" }, { value: "Settings", label: "Settings" }, { value: "Audit", label: "Audit" }, { value: "Customers", label: "Customers" }, { value: "System", label: "System" } ] },
      { name: "description", label: "Description", type: "textarea" },
    ]),
    statsCards: [sc("Total", Icons.lock, r=>r.length)],
  },
  projects: {
    id: "projects", title: "Projects", description: "Manage projects and workspaces",
    apiEndpoint: "/api/admin/projects",
    statusField,
    transform: (d: any) => (d.projects || []).map((p: any) => ({
      id: p.id, name: p.name, org: p.organization?.name || p.org || "—",
      status: p.status || "active", createdAt: p.createdAt || "",
    })),
    columns: [
      { id: "name", header: "Project", accessor: r => r.name, type: "avatar", width: 220 },
      { id: "org", header: "Organization", accessor: r => r.org },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
      { id: "createdAt", header: "Created", accessor: r => r.createdAt, type: "date", width: 110 },
    ],
    fields: defFields([
      { name: "name", label: "Project Name", type: "text", required: true },
      { name: "org", label: "Organization", type: "text", required: true },
    ]),
    statsCards: [sc("Total", Icons.workspace, r=>r.length), sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length)],
  },
  queue: {
    id: "queue", title: "Job Queue", description: "Background job queue management",
    apiEndpoint: "/api/admin/queue",
    statusField,
    transform: (d: any) => (d.jobs || []).map((j: any) => ({
      id: j.id, type: j.type || j.name || "job", status: j.status || "pending",
      priority: j.priority || 0, attempts: j.attempts || 0, error: j.error || "",
      createdAt: j.createdAt || "",
    })),
    columns: [
      { id: "type", header: "Type", accessor: r => r.type, type: "badge", width: 160 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
      { id: "priority", header: "Priority", accessor: r => r.priority, type: "number", width: 80 },
      { id: "attempts", header: "Attempts", accessor: r => r.attempts, type: "number", width: 80 },
      { id: "error", header: "Error", accessor: r => r.error || "—" },
      { id: "createdAt", header: "Created", accessor: r => r.createdAt, type: "date", width: 110 },
    ],
    fields: defFields([]),
    statsCards: [sc("Pending", Icons.clock, r=>r.filter(x=>x.status==="pending").length), sc("Running", Icons.spinner, r=>r.filter(x=>x.status==="running"||x.status==="active").length), sc("Completed", Icons.circleCheck, r=>r.filter(x=>x.status==="completed").length), sc("Failed", Icons.circleX, r=>r.filter(x=>x.status==="failed"||x.status==="terminated").length)],
  },
  scheduler: {
    id: "scheduler", title: "Scheduled Tasks", description: "Manage cron jobs and scheduled tasks",
    apiEndpoint: "/api/admin/scheduler",
    statusField,
    transform: (d: any) => (d.tasks || []).map((t: any) => ({
      id: t.id, name: t.name, cron: t.cron || t.schedule || "—",
      type: t.taskType || t.type || "—", status: t.active ? "active" : (t.status || "inactive"),
      lastRun: t.lastRun || t.lastRunAt || "", nextRun: t.nextRun || t.nextRunAt || "",
    })),
    columns: [
      { id: "name", header: "Task", accessor: r => r.name, type: "avatar", width: 200 },
      { id: "cron", header: "Schedule", accessor: r => r.cron, type: "email" },
      { id: "type", header: "Type", accessor: r => r.type, type: "badge", width: 120 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 100 },
      { id: "lastRun", header: "Last Run", accessor: r => r.lastRun, type: "date", width: 110 },
      { id: "nextRun", header: "Next Run", accessor: r => r.nextRun, type: "date", width: 110 },
    ],
    fields: defFields([
      { name: "name", label: "Task Name", type: "text", required: true },
      { name: "cron", label: "Cron Expression", type: "text", required: true, placeholder: "0 */6 * * *" },
      { name: "type", label: "Task Type", type: "select", options: [ { value: "report", label: "Report" }, { value: "backup", label: "Backup" }, { value: "sync", label: "Sync" }, { value: "cleanup", label: "Cleanup" }, { value: "notification", label: "Notification" } ] },
    ]),
    statsCards: [sc("Total", Icons.clock, r=>r.length), sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length), sc("Inactive", Icons.circleX, r=>r.filter(x=>x.status==="inactive").length)],
  },
  storage: {
    id: "storage", title: "File Storage", description: "Uploaded files and storage management",
    apiEndpoint: "/api/admin/storage",
    statusField,
    transform: (d: any) => (d.files || []).map((f: any) => ({
      id: f.id, name: f.originalName || f.name || f.filename, type: f.mimeType || f.type || "—",
      size: f.size ? (f.size > 1024*1024 ? `${(f.size/1024/1024).toFixed(1)} MB` : f.size > 1024 ? `${(f.size/1024).toFixed(1)} KB` : `${f.size} B`) : "—",
      status: "active", createdAt: f.createdAt || f.uploadedAt || "",
    })),
    columns: [
      { id: "name", header: "File", accessor: r => r.name, type: "avatar", width: 240 },
      { id: "type", header: "Type", accessor: r => r.type, type: "badge", width: 120 },
      { id: "size", header: "Size", accessor: r => r.size, width: 100 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 100 },
      { id: "createdAt", header: "Uploaded", accessor: r => r.createdAt, type: "date", width: 110 },
    ],
    fields: defFields([]),
    statsCards: [sc("Total Files", Icons.fileTypeDoc, r=>r.length)],
  },

  // ─── Pages with custom render (use GenericAdminPage shell) ───
  dashboard: {
    id: "dashboard", title: "System Dashboard", description: "Live system metrics and service status",
    apiEndpoint: "/api/admin/health",
    statusField,
    transform: (d: any) => (d.services || d.checks || []).map((s: any) => ({
      id: s.name || s.id, name: s.name || s.check,
      status: s.status === "healthy" || s.status === "ok" ? "active" : "terminated",
      latency: s.latency || s.duration || "—",
    })),
    columns: [{ id: "name", header: "Service", accessor: r => r.name, width: 220 }, { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 }],
    fields: defFields([]),
    statsCards: [],
  },
  "ai-diagnostics": {
    id: "ai-diagnostics", title: "AI Diagnostics", description: "AI agent health checks and diagnostics",
    apiEndpoint: "/api/admin/ai-diagnostics",
    statusField,
    transform: (d: any) => (d.checks || []).map((c: any) => ({
      id: c.name || c.id, name: c.name || c.check,
      duration: c.duration || c.latency || "—", details: c.details || c.message || "—",
      status: c.status === "pass" || c.status === "healthy" ? "active" : "terminated",
    })),
    columns: [
      { id: "name", header: "Check", accessor: r => r.name, type: "avatar", width: 220 },
      { id: "duration", header: "Duration", accessor: r => r.duration, width: 100 },
      { id: "details", header: "Details", accessor: r => r.details },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
    ],
    fields: defFields([]),
    statsCards: [sc("Total Checks", Icons.circleCheck, r=>r.length), sc("Passed", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length)],
  },
  logs: {
    id: "logs", title: "System Logs", description: "Application and service logs",
    apiEndpoint: "/api/services/email",
    statusField,
    transform: (d: any) => (d.logs || d.entries || []).map((l: any) => ({
      id: l.id, level: l.level || l.status || "info", message: l.message || l.subject || l.body || "—",
      source: l.source || l.service || "—", status: l.level === "error" ? "terminated" : l.level === "warn" ? "maintenance" : "active",
      timestamp: l.createdAt || l.timestamp || "",
    })),
    columns: [
      { id: "timestamp", header: "Time", accessor: r => r.timestamp, type: "date", width: 110 },
      { id: "level", header: "Level", accessor: r => r.level, type: "badge", badgeVariant: (v:string) => v==="error"?"destructive":v==="warn"?"outline":"default", width: 100 },
      { id: "message", header: "Message", accessor: r => r.message },
      { id: "source", header: "Source", accessor: r => r.source, width: 140 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 100 },
    ],
    fields: defFields([]),
    statsCards: [sc("Total", Icons.clock, r=>r.length), sc("Errors", Icons.circleX, r=>r.filter(x=>x.status==="terminated").length)],
  },
  areas: {
    id: "areas", title: "Service Areas", description: "Geographic service areas and regions",
    apiEndpoint: "", statusField,
    columns: [
      { id: "name", header: "Area", accessor: r => r.name, type: "avatar", width: 220 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
    ],
    fields: defFields([{ name: "name", label: "Area Name", type: "text", required: true }]),
    statsCards: [sc("Total", Icons.teams, r=>r.length)],
  },
  database: {
    id: "database", title: "Database Management", description: "Database configuration and connection status",
    apiEndpoint: "", statusField,
    columns: [
      { id: "property", header: "Property", accessor: r => r.property, type: "avatar", width: 220 },
      { id: "value", header: "Value", accessor: r => r.value },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
    ],
    fields: defFields([]), statsCards: [],
  },
  integrations: {
    id: "integrations", title: "Integrations", description: "Third-party service integrations",
    apiEndpoint: "", statusField,
    columns: [
      { id: "name", header: "Integration", accessor: r => r.name, type: "avatar", width: 220 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
    ],
    fields: defFields([{ name: "name", label: "Integration Name", type: "text", required: true }]),
    statsCards: [sc("Total", Icons.code, r=>r.length)],
  },
  localization: {
    id: "localization", title: "Localization", description: "Language and locale settings",
    apiEndpoint: "", statusField,
    columns: [
      { id: "key", header: "Setting", accessor: r => r.key, type: "avatar", width: 220 },
      { id: "value", header: "Value", accessor: r => r.value },
    ],
    fields: defFields([]), statsCards: [],
  },
  notifications: {
    id: "notifications", title: "Notifications", description: "Notification channel configuration",
    apiEndpoint: "", statusField,
    columns: [
      { id: "name", header: "Channel", accessor: r => r.name, type: "avatar", width: 220 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
    ],
    fields: defFields([]), statsCards: [sc("Total", Icons.notification, r=>r.length)],
  },
  plugins: {
    id: "plugins", title: "Plugin Marketplace", description: "Extend MeterVerse with plugins",
    apiEndpoint: "", statusField,
    columns: [
      { id: "name", header: "Plugin", accessor: r => r.name, width: 220 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
    ],
    fields: defFields([]), statsCards: [],
  },
  sms: {
    id: "sms", title: "SMS Configuration", description: "SMS gateway settings",
    apiEndpoint: "", statusField,
    columns: [
      { id: "provider", header: "Provider", accessor: r => r.provider, type: "avatar", width: 220 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
    ],
    fields: defFields([]), statsCards: [sc("Total", Icons.phone, r=>r.length)],
  },
  smtp: {
    id: "smtp", title: "SMTP Configuration", description: "Email server settings",
    apiEndpoint: "", statusField,
    columns: [
      { id: "setting", header: "Setting", accessor: r => r.setting, type: "avatar", width: 220 },
      { id: "value", header: "Value", accessor: r => r.value },
    ],
    fields: defFields([]), statsCards: [],
  },
  themes: {
    id: "themes", title: "Theme Manager", description: "Manage system appearance themes",
    apiEndpoint: "", statusField,
    columns: [
      { id: "name", header: "Theme", accessor: r => r.name, type: "avatar", width: 220 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
    ],
    fields: defFields([]), statsCards: [sc("Total", Icons.palette, r=>r.length)],
  },
  translations: {
    id: "translations", title: "Translation Manager", description: "Manage multilingual translations",
    apiEndpoint: "", statusField,
    columns: [
      { id: "locale", header: "Locale", accessor: r => r.locale, type: "avatar", width: 120 },
      { id: "name", header: "Language", accessor: r => r.name, width: 160 },
      { id: "progress", header: "Progress", accessor: r => r.progress },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 100 },
    ],
    fields: defFields([]), statsCards: [sc("Total", Icons.text, r=>r.length)],
  },
  api: {
    id: "api", title: "API Overview", description: "API endpoint documentation and status",
    apiEndpoint: "", statusField, columns: [], fields: defFields([]), statsCards: [],
  },
  branding: {
    id: "branding", title: "Branding", description: "System branding and visual identity",
    apiEndpoint: "/api/admin/branding",
    statusField,
    transform: (d: any) => (d.configs || d.branding || []).map((b: any) => ({
      id: b.key || b.id, name: b.key || b.name, value: b.value || "—",
      category: b.category || "general", status: "active",
    })),
    columns: [
      { id: "name", header: "Setting", accessor: r => r.name, width: 200 },
      { id: "value", header: "Value", accessor: r => r.value },
      { id: "category", header: "Category", accessor: r => r.category, type: "badge", width: 120 },
    ],
    fields: defFields([]), statsCards: [],
  },
  business: {
    id: "business", title: "Business Pipeline", description: "Meter reading and billing pipeline status",
    apiEndpoint: "/api/business/pipeline-status",
    statusField,
    transform: (d: any) => (d.recentRuns || []).map((r: any) => ({
      id: r.id || r.cycle, name: r.cycle || r.name || "Run",
      period: r.period || "—", status: r.status || "active",
      count: r.count || r.readings || 0, amount: r.amount || 0,
      date: r.createdAt || r.date || "",
    })),
    columns: [
      { id: "name", header: "Cycle", accessor: r => r.name, width: 140 },
      { id: "period", header: "Period", accessor: r => r.period, width: 120 },
      { id: "count", header: "Count", accessor: r => r.count, type: "number", width: 80 },
      { id: "amount", header: "Amount", accessor: r => `EGP ${(r.amount||0).toLocaleString()}`, width: 120 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 100 },
      { id: "date", header: "Date", accessor: r => r.date, type: "date", width: 110 },
    ],
    fields: defFields([]),
    statsCards: [sc("Total Runs", Icons.clock, r=>r.length), sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length)],
  },
  "feature-flags": {
    id: "feature-flags", title: "Feature Flags", description: "Toggle system features on/off",
    apiEndpoint: "/api/admin/feature-flags",
    statusField,
    transform: (d: any) => (d.flags || []).map((f: any) => ({
      id: f.id || f.key, name: f.name || f.key, key: f.key || f.name,
      scope: f.scope || f.environment || "global",
      status: f.enabled ? "active" : "inactive",
    })),
    columns: [
      { id: "name", header: "Feature", accessor: r => r.name, type: "avatar", width: 220 },
      { id: "key", header: "Key", accessor: r => r.key, type: "email" },
      { id: "scope", header: "Scope", accessor: r => r.scope, type: "badge", width: 120 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 100 },
    ],
    fields: defFields([
      { name: "name", label: "Feature Name", type: "text", required: true },
      { name: "key", label: "Flag Key", type: "text", required: true },
      { name: "scope", label: "Scope", type: "select", options: [ { value: "global", label: "Global" }, { value: "beta", label: "Beta" }, { value: "internal", label: "Internal" } ] },
    ]),
    statsCards: [sc("Total", Icons.settings, r=>r.length), sc("Enabled", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length), sc("Disabled", Icons.circleX, r=>r.filter(x=>x.status==="inactive").length)],
  },
  crud: {
    id: "crud", title: "Enterprise CRUD", description: "Soft Delete · Bulk · Import · Export · Undo · Archive · Approval · Version History",
    apiEndpoint: "", statusField, columns: [], fields: defFields([]), statsCards: [],
  },
  runtime: {
    id: "runtime", title: "Runtime Engine", description: "Metadata-driven app generation — define entities in JSON, get full CRUD automatically",
    apiEndpoint: "", statusField, columns: [], fields: defFields([]), statsCards: [],
  },
  tables: {
    id: "tables", title: "Enterprise Tables", description: "Column presets · Resize · Reorder · Pin · Inline Edit · Grouping · Aggregation · Filters · Saved Views · Bulk Actions · Export · Keyboard Shortcuts",
    apiEndpoint: "", statusField, columns: [], fields: defFields([]), statsCards: [],
  },
  domains: {
    id: "domains", title: "Domain Data", description: "Browse all domain entities",
    apiEndpoint: "/api/domain/contracts",
    statusField,
    transform: (d: any) => (d.items || d.results || d.data || []).map((item: any) => ({
      id: item.id, name: item.name || item.id?.substring(0,8) || "—",
      status: item.status || "active",
    })),
    columns: [
      { id: "name", header: "Name", accessor: r => r.name, width: 220 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
    ],
    fields: defFields([]), statsCards: [],
  },
}
