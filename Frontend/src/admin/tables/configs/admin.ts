import { Icons } from "@/components/icons"
import type { PageConfig } from "../page-config"
import { statusField, defFields, sc } from "./_helpers"

export const adminConfigs: Record<string, PageConfig> = {
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
  projects: {
    id: "projects", title: "Projects", description: "Manage projects and workspaces",
    apiEndpoint: "/api/admin/projects",
    serverSide: true, statusField,
    transform: (d: any) => (d.projects || []).map((p: any) => ({
      id: p.id, name: p.name, org: p.organization?.name || p.org || "—",
      zoneCount: p._count?.zones ?? 0,
      status: p.status || "active", createdAt: p.createdAt || "",
    })),
    columns: [
      { id: "name", header: "Project", accessor: r => r.name, type: "avatar", width: 220 },
      { id: "org", header: "Organization", accessor: r => r.org, width: 180 },
      { id: "zoneCount", header: "Zones", accessor: r => r.zoneCount, width: 80 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
      { id: "createdAt", header: "Created", accessor: r => r.createdAt, type: "date", width: 110 },
    ],
    fields: defFields([
      { name: "name", label: "Project Name", type: "text", required: true, placeholder: "e.g. Palm Hills Phase 1" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "organizationId", label: "Organization ID", type: "text", required: true, placeholder: "uuid..." },
      { name: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }] },
      { name: "taxEnabled", label: "Tax Enabled", type: "switch" },
      { name: "taxRate", label: "Tax Rate", type: "number" },
      { name: "waterDifferenceMode", label: "Water Difference Mode", type: "select", options: [{ value: "billable", label: "Billable" }, { value: "report_only", label: "Report Only" }] },
      { name: "paymentTermsDays", label: "Payment Terms (days)", type: "number" },
    ]),
    statsCards: [sc("Total", Icons.workspace, r=>r.length), sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length)],
  },
  "ai-command-center": {
    id: "ai-command-center", title: "AI Command Center", description: "Enterprise AI Command Center — agents, RCA, knowledge graph",
    apiEndpoint: "/api/ai/models",
    serverSide: false, statusField,
    transform: (d: any) => (d.models || []).map((m: any) => ({
      id: m.id || m.name, name: m.name || m.model || "AI Agent",
      status: m.status || "active", type: m.type || "model",
    })),
    columns: [
      { id: "name", header: "Agent", accessor: r => r.name, type: "avatar", width: 220 },
      { id: "type", header: "Type", accessor: r => r.type, type: "badge", width: 100 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
    ],
    fields: defFields([]),
    statsCards: [sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length)],
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
  areas: {
    id: "areas", title: "Service Areas", description: "Geographic service areas and regions",
    apiEndpoint: "/api/locations/areas", statusField,
    transform: (d: any) => (Array.isArray(d) ? d : d.areas || []),
    columns: [
      { id: "name", header: "Area", accessor: r => r.name, type: "avatar", width: 220 },
      { id: "code", header: "Code", accessor: r => r.code, width: 100 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
    ],
    fields: defFields([
      { name: "name", label: "Area Name", type: "text", required: true },
      { name: "code", label: "Area Code", type: "text", required: true },
    ]),
    statsCards: [sc("Total", Icons.teams, r=>r.length)],
  },
  ai: {
    id: "ai", title: "AI Layer", description: "AI agents and automation",
    apiEndpoint: "/api/admin/ai-diagnostics",
    statusField,
    transform: (d: any) => (d.checks || []).map((a: any) => ({
      id: a.name || a.id, name: a.name || a.check || "Agent",
      status: a.status === "pass" || a.status === "healthy" ? "active" : "terminated",
      lastActive: "",
    })),
    columns: [
      { id: "name", header: "Agent", accessor: r => r.name, type: "avatar", width: 220 },
      { id: "status", header: "Status", accessor: r => r.status, type: "status", width: 120 },
      { id: "lastActive", header: "Last Active", accessor: r => r.lastActive, type: "date", width: 120 },
    ],
    fields: defFields([]),
    statsCards: [sc("Total Agents", Icons.sparkles, r=>r.length), sc("Active", Icons.circleCheck, r=>r.filter(x=>x.status==="active").length)],
  },
}
