import { Icons } from "@/components/icons"
import type { PageConfig } from "../page-config"
import { statusField, defFields, sc } from "./_helpers"

export const customersConfigs: Record<string, PageConfig> = {
  customers: {
    id: "customers", title: "Customers", description: "Manage your customer base",
    apiEndpoint: "/api/customers",
    serverSide: true,
    statusField,
    transform: (d: any) => (d.customers || []).map((c: any) => ({
      id: c.id, name: c.name, email: c.email || "", phone: c.phone || "",
      status: c.status || "active", area: c.area || "", address: c.address || "", createdAt: c.createdAt || "",
    })),
    columns: [
      { id: "name", header: "Name", accessor: r => r.name, type: "avatar", width: 220 },
      { id: "email", header: "Email", accessor: r => r.email, type: "email" },
      { id: "phone", header: "Phone", accessor: r => r.phone || "—", width: 140 },
      { id: "area", header: "Area", accessor: r => r.area || "—", width: 120 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
      { id: "createdAt", header: "Created", accessor: r => r.createdAt, type: "date", width: 110 },
    ],
    fields: defFields([
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "John Doe" },
      { name: "email", label: "Email", type: "email", required: true, placeholder: "john@example.com" },
      { name: "phone", label: "Phone", type: "phone", placeholder: "+1 555 0123" },
      { name: "area", label: "Area", type: "text", placeholder: "New Cairo" },
      { name: "address", label: "Address", type: "textarea" },
    ]),
    statsCards: [sc("Total", Icons.teams, r=>r.length), sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length)],
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
  "customers-cards": {
    id: "customers-cards", title: "Customer Cards", description: "Customer business cards — 3-column card view",
    apiEndpoint: "/api/customers",
    serverSide: false, statusField,
    transform: (d: any) => (d.customers || []).map((c: any) => ({
      id: c.id, name: c.name, email: c.email || "", phone: c.phone || "",
      area: c.area || "", address: c.address || "", status: c.status || "active",
      meters: c._count?.meters ?? c.meters ?? 0, createdAt: c.createdAt || "",
    })),
    columns: [
      { id: "name", header: "Name", accessor: r => r.name, type: "avatar", width: 200 },
      { id: "email", header: "Email", accessor: r => r.email, width: 180 },
      { id: "phone", header: "Phone", accessor: r => r.phone || "—", width: 120 },
      { id: "area", header: "Area", accessor: r => r.area || "—", width: 120 },
      { id: "meters", header: "Meters", accessor: r => r.meters, type: "number", width: 80 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 100 },
    ],
    fields: defFields([]),
    statsCards: [sc("Total", Icons.teams, r=>r.length), sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length)],
  },
}
