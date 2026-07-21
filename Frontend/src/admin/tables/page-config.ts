import { Icons } from "@/components/icons"

export interface ColumnConfig {
  id: string
  header: string
  accessor: (row: any) => any
  type?: "text" | "badge" | "date" | "avatar" | "status" | "email" | "number"
  width?: number
  sortable?: boolean
  filterable?: boolean
  badgeVariant?: (val: string) => "default" | "secondary" | "outline" | "destructive"
}

export interface FieldConfig {
  name: string
  label: string
  type: "text" | "email" | "select" | "textarea" | "switch" | "date" | "number" | "phone"
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
}

export interface StatCard {
  label: string
  icon: any
  value: (rows: any[]) => number | string
  filter?: (row: any) => boolean
}

export type EntityAction = "view" | "add" | "edit" | "delete" | "activate" | "deactivate" | "maintain" | "terminate"

export interface PageConfig {
  id: string
  title: string
  description: string
  apiEndpoint: string
  apiMethod?: "GET" | "POST" | "PUT" | "DELETE"
  columns: ColumnConfig[]
  fields: FieldConfig[]
  statsCards?: StatCard[]
  statusField?: string
  tabs?: { value: string; label: string; filter?: (row: any) => boolean }[]
  transform?: (data: any) => any[]
  rowKey?: string
}

export const defaultTabs = [
  { value: "all", label: "All" },
  { value: "active", label: "Active", filter: (r: any) => r.status === "active" },
  { value: "inactive", label: "Inactive", filter: (r: any) => r.status === "inactive" },
  { value: "maintenance", label: "Maintenance", filter: (r: any) => r.status === "maintenance" },
  { value: "terminated", label: "Terminated", filter: (r: any) => r.status === "terminated" },
]
