import type { ApplicationMeta } from "./application-registry"

export const seedApps: ApplicationMeta[] = [
  // Executive
  { id: "executive", title: "Executive", icon: "LayoutDashboard", description: "Executive dashboards and KPIs", category: "executive", route: "/app/executive", order: 1 },
  { id: "ceo-dashboard", title: "CEO Dashboard", icon: "TrendingUp", description: "CEO-level overview", category: "executive", route: "/app/executive/ceo", order: 2, tags: ["ceo", "executive", "overview"] },
  { id: "command-center", title: "Command Center", icon: "Terminal", description: "Central command and control", category: "executive", route: "/app/executive/command", order: 3, tags: ["command", "control"] },

  // CRM
  { id: "customers", title: "Customers", icon: "Users", description: "Customer management", category: "crm", route: "/app/crm/customers", order: 1 },
  { id: "customer-groups", title: "Customer Groups", icon: "FolderTree", description: "Customer segmentation", category: "crm", route: "/app/crm/groups", order: 2, experimental: true },
  { id: "contacts", title: "Contacts", icon: "Contact", description: "Contact directory", category: "crm", route: "/app/crm/contacts", order: 3 },
  { id: "contracts", title: "Contracts", icon: "FileSignature", description: "Contract management", category: "crm", route: "/app/crm/contracts", order: 4 },

  // Billing
  { id: "invoices", title: "Invoices", icon: "FileText", description: "Invoice management", category: "billing", route: "/app/billing/invoices", order: 1, badge: 12 },
  { id: "invoice-generator", title: "Invoice Generator", icon: "FilePlus", description: "Generate invoices", category: "billing", route: "/app/billing/generator", order: 2 },
  { id: "payments", title: "Payments", icon: "DollarSign", description: "Payment processing", category: "billing", route: "/app/billing/payments", order: 3 },
  { id: "credit-notes", title: "Credit Notes", icon: "FileMinus", description: "Credit note management", category: "billing", route: "/app/billing/credit-notes", order: 4 },

  // Meters
  { id: "meters", title: "Meters", icon: "Gauge", description: "Meter inventory", category: "meters", route: "/app/meters", order: 1 },
  { id: "meter-types", title: "Meter Types", icon: "Layers", description: "Meter type catalog", category: "meters", route: "/app/meters/types", order: 2 },
  { id: "meter-map", title: "Meter Map", icon: "Map", description: "Geographic meter view", category: "meters", route: "/app/meters/map", order: 3, beta: true },

  // Readings
  { id: "readings", title: "Readings", icon: "ClipboardList", description: "Meter reading center", category: "readings", route: "/app/readings", order: 1 },
  { id: "manual-reading", title: "Manual Reading", icon: "Edit3", description: "Enter manual readings", category: "readings", route: "/app/readings/manual", order: 2 },
  { id: "bulk-import", title: "Bulk Import", icon: "Upload", description: "Bulk reading import", category: "readings", route: "/app/readings/import", order: 3 },

  // Operations
  { id: "operations", title: "Operations", icon: "Settings", description: "Operations management", category: "operations", route: "/app/operations", order: 1 },
  { id: "work-orders", title: "Work Orders", icon: "ClipboardCheck", description: "Work order management", category: "operations", route: "/app/operations/work-orders", order: 2 },

  // Finance
  { id: "financial", title: "Financial", icon: "BarChart3", description: "Financial management", category: "finance", route: "/app/finance", order: 1 },
  { id: "revenue", title: "Revenue", icon: "TrendingUp", description: "Revenue tracking", category: "finance", route: "/app/finance/revenue", order: 2 },
  { id: "cash-flow", title: "Cash Flow", icon: "ArrowRightLeft", description: "Cash flow management", category: "finance", route: "/app/finance/cashflow", order: 3 },

  // Reports
  { id: "reports", title: "Reports", icon: "BarChart4", description: "Reporting center", category: "reports", route: "/app/reports", order: 1 },
  { id: "financial-reports", title: "Financial Reports", icon: "BarChart3", description: "Financial reporting", category: "reports", route: "/app/reports/financial", order: 2 },
  { id: "consumption-reports", title: "Consumption Reports", icon: "Activity", description: "Consumption analytics", category: "reports", route: "/app/reports/consumption", order: 3 },

  // Monitoring
  { id: "monitoring", title: "Monitoring", icon: "Activity", description: "System monitoring", category: "monitoring", route: "/app/monitoring", order: 1 },
  { id: "alerts", title: "Alerts", icon: "Bell", description: "Alert management", category: "monitoring", route: "/app/monitoring/alerts", order: 2, badge: 7 },

  // IoT
  { id: "iot", title: "IoT Devices", icon: "Radio", description: "IoT device management", category: "iot", route: "/app/iot", order: 1, experimental: true },

  // Admin
  { id: "admin", title: "Administration", icon: "Shield", description: "System administration", category: "admin", route: "/app/admin", order: 1 },
  { id: "users", title: "Users", icon: "Users", description: "User management", category: "admin", route: "/app/admin/users", order: 2 },
  { id: "roles", title: "Roles & Permissions", icon: "Key", description: "Role-based access control", category: "admin", route: "/app/admin/roles", order: 3 },
  { id: "audit-logs", title: "Audit Logs", icon: "FileSearch", description: "System audit trail", category: "admin", route: "/app/admin/audit", order: 4 },

  // Security
  { id: "security", title: "Security", icon: "Lock", description: "Security settings", category: "security", route: "/app/security", order: 1 },
  { id: "authentication", title: "Authentication", icon: "LogIn", description: "Auth configuration", category: "security", route: "/app/security/auth", order: 2 },
  { id: "api-tokens", title: "API Tokens", icon: "Key", description: "API token management", category: "security", route: "/app/security/tokens", order: 3 },

  // AI
  { id: "ai-center", title: "AI Center", icon: "Bot", description: "AI-powered insights", category: "ai", route: "/app/ai", order: 1, badge: 3 },
  { id: "ai-assistant", title: "AI Assistant", icon: "Bot", description: "AI chat assistant", category: "ai", route: "/app/ai/assistant", order: 2 },
  { id: "ai-insights", title: "AI Insights", icon: "Lightbulb", description: "AI-generated insights", category: "ai", route: "/app/ai/insights", order: 3, beta: true },

  // Settings
  { id: "settings", title: "Settings", icon: "Settings", description: "System settings", category: "settings", route: "/app/settings", order: 1 },
  { id: "system-config", title: "System Configuration", icon: "Settings", description: "System configuration", category: "settings", route: "/app/settings/config", order: 2 },
  { id: "backups", title: "Backups", icon: "HardDrive", description: "Backup management", category: "settings", route: "/app/settings/backups", order: 3 },

  // Developer
  { id: "developer", title: "Developer", icon: "Terminal", description: "Developer tools", category: "developer", route: "/app/developer", order: 1 },
  { id: "api-explorer", title: "API Explorer", icon: "Search", description: "Interactive API explorer", category: "developer", route: "/app/developer/api", order: 2 },
  { id: "runtime-inspector", title: "Runtime Inspector", icon: "Monitor", description: "Runtime component inspector", category: "developer", route: "/app/developer/runtime", order: 3 },
  { id: "logs", title: "Logs", icon: "FileText", description: "System logs", category: "developer", route: "/app/developer/logs", order: 4 },
]
