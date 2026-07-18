import type { NavItem } from "./NavigationRegistry"

export const seedNavigation: NavItem[] = [
  {
    id: "workspace", title: "Workspace", icon: "LayoutDashboard", type: "group", order: 1,
    children: [
      { id: "home", title: "Home", icon: "Home", type: "app", route: "/workspace", order: 1, searchTerms: ["home", "dashboard"] },
      { id: "dashboard", title: "Dashboard", icon: "BarChart3", type: "app", route: "/dashboard/overview", order: 2, searchTerms: ["dashboard", "overview"] },
    ],
  },
  {
    id: "customers", title: "Customers", icon: "Users", type: "group", order: 2,
    permissions: ["read:customers"],
    children: [
      { id: "customer-list", title: "All Customers", icon: "Users", type: "app", route: "/app/crm/customers", order: 1, searchTerms: ["customers", "clients"] },
    ],
  },
  {
    id: "meters", title: "Meters", icon: "Gauge", type: "group", order: 3,
    permissions: ["read:meters"],
    children: [
      { id: "meter-list", title: "All Meters", icon: "Gauge", type: "app", route: "/app/meters", order: 1, searchTerms: ["meters", "devices"] },
    ],
  },
  {
    id: "billing", title: "Billing", icon: "FileText", type: "group", order: 4,
    permissions: ["read:invoices"],
    children: [
      { id: "invoices", title: "Invoices", icon: "FileText", type: "app", route: "/app/billing/invoices", order: 1, badge: 12, badgeVariant: "count", searchTerms: ["invoices", "bills"] },
    ],
  },
  {
    id: "executive", title: "Executive", icon: "TrendingUp", type: "group", order: 5,
    permissions: ["read:admin"],
    children: [
      { id: "exec-dashboard", title: "Executive Dashboard", icon: "LayoutDashboard", type: "app", route: "/app/executive", order: 1, searchTerms: ["executive", "ceo"] },
    ],
  },
  {
    id: "admin", title: "Administration", icon: "Shield", type: "group", order: 6,
    permissions: ["read:users"],
    children: [
      { id: "admin-users", title: "Users", icon: "Users", type: "app", route: "/app/admin", order: 1, searchTerms: ["users", "admin"] },
      { id: "admin-settings", title: "Settings", icon: "Settings", type: "app", route: "/app/settings", order: 2, searchTerms: ["settings", "config"] },
    ],
  },
  {
    id: "ai", title: "AI Center", icon: "Bot", type: "group", order: 7,
    children: [
      { id: "ai-center", title: "AI Dashboard", icon: "Bot", type: "app", route: "/app/ai", order: 1, badge: 3, badgeVariant: "warning", searchTerms: ["ai", "artificial", "intelligence"] },
    ],
  },
]
