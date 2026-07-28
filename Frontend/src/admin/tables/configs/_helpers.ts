import type { PageConfig } from "../page-config"

export const statusField: PageConfig["statusField"] = "status"

export const defFields = (extra: PageConfig["fields"] = []): PageConfig["fields"] => [
  ...extra,
  { name: "status", label: "Status", type: "select", options: [
    { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" },
    { value: "maintenance", label: "Maintenance" }, { value: "terminated", label: "Terminated" },
  ]},
]

export const sc = (label: string, icon: any, value: (r: any[]) => number | string) => ({ label, icon, value })
