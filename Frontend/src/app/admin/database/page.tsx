"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

// â”€â”€â”€ Types â”€â”€â”€

type TableName =
  | "Customer" | "Meter" | "Reading" | "Invoice" | "Payment"
  | "User" | "Role" | "Account" | "JournalEntry" | "Tariff" | "SIMCard" | "CollectionCase"

interface ColumnDef {
  key: string
  label: string
  type?: "text" | "number" | "email" | "date" | "status" | "badge"
  width?: number
}

interface TableMeta {
  name: TableName
  icon: keyof typeof Icons
  description: string
  columns: ColumnDef[]
}

// â”€â”€â”€ Mock Data â”€â”€â”€
import { getHealthSummary } from "@/features/admin-settings/api/service"

const now = new Date().toISOString().split("T")[0]
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString().split("T")[0]

const mockData: Record<TableName, Record<string, any>[]> = {
  Customer: [
    { id: "1", name: "Ahmed Hassan", email: "ahmed@example.com", phone: "+20 100 000 0001", address: "New Cairo", status: "active", createdAt: daysAgo(120) },
    { id: "2", name: "Mona Said", email: "mona@example.com", phone: "+20 100 000 0002", address: "October", status: "active", createdAt: daysAgo(90) },
    { id: "3", name: "Karim Adel", email: "karim@example.com", phone: "+20 100 000 0003", address: "SODIC", status: "inactive", createdAt: daysAgo(60) },
    { id: "4", name: "Nadia Youssef", email: "nadia@example.com", phone: "+20 100 000 0004", address: "New Cairo", status: "active", createdAt: daysAgo(45) },
    { id: "5", name: "Tamer Nabil", email: "tamer@example.com", phone: "+20 100 000 0005", address: "October", status: "terminated", createdAt: daysAgo(30) },
    { id: "6", name: "Laila Ibrahim", email: "laila@example.com", phone: "+20 100 000 0006", address: "SODIC", status: "active", createdAt: daysAgo(20) },
    { id: "7", name: "Omar Farouk", email: "omar@example.com", phone: "+20 100 000 0007", address: "New Cairo", status: "active", createdAt: daysAgo(15) },
    { id: "8", name: "Dina Sherif", email: "dina@example.com", phone: "+20 100 000 0008", address: "October", status: "inactive", createdAt: daysAgo(10) },
    { id: "9", name: "Hossam Galal", email: "hossam@example.com", phone: "+20 100 000 0009", address: "SODIC", status: "active", createdAt: daysAgo(5) },
    { id: "10", name: "Rania Kamel", email: "rania@example.com", phone: "+20 100 000 0010", address: "New Cairo", status: "active", createdAt: now },
  ],
  Meter: [
    { id: "1", serial: "MTR-1001", type: "LP2", area: "October", status: "active", customerId: "1", createdAt: daysAgo(120) },
    { id: "2", serial: "MTR-1002", type: "LP2", area: "New Cairo", status: "active", customerId: "2", createdAt: daysAgo(90) },
    { id: "3", serial: "MTR-1003", type: "LP2", area: "SODIC", status: "maintenance", customerId: "3", createdAt: daysAgo(60) },
    { id: "4", serial: "MTR-1004", type: "Water", area: "October", status: "active", customerId: "4", createdAt: daysAgo(45) },
    { id: "5", serial: "MTR-1005", type: "LP2", area: "New Cairo", status: "inactive", customerId: "5", createdAt: daysAgo(30) },
    { id: "6", serial: "MTR-1006", type: "Water", area: "SODIC", status: "active", customerId: "6", createdAt: daysAgo(20) },
    { id: "7", serial: "MTR-1007", type: "LP2", area: "October", status: "active", customerId: "7", createdAt: daysAgo(15) },
    { id: "8", serial: "MTR-1008", type: "Gas", area: "New Cairo", status: "active", customerId: "8", createdAt: daysAgo(10) },
    { id: "9", serial: "MTR-1009", type: "LP2", area: "SODIC", status: "terminated", customerId: "9", createdAt: daysAgo(5) },
    { id: "10", serial: "MTR-1010", type: "LP2", area: "October", status: "active", customerId: "10", createdAt: now },
    { id: "11", serial: "MTR-1011", type: "Water", area: "New Cairo", status: "active", customerId: "1", createdAt: daysAgo(80) },
    { id: "12", serial: "MTR-1012", type: "LP2", area: "SODIC", status: "maintenance", customerId: "2", createdAt: daysAgo(70) },
  ],
  Reading: [
    { id: "1", meterId: "1", value: 1250.5, unit: "kWh", timestamp: daysAgo(10), source: "manual", status: "active" },
    { id: "2", meterId: "1", value: 1280.3, unit: "kWh", timestamp: daysAgo(5), source: "api", status: "active" },
    { id: "3", meterId: "2", value: 3400.0, unit: "kWh", timestamp: daysAgo(8), source: "manual", status: "active" },
    { id: "4", meterId: "3", value: 567.2, unit: "kWh", timestamp: daysAgo(7), source: "import", status: "active" },
    { id: "5", meterId: "4", value: 89.5, unit: "mÂ³", timestamp: daysAgo(6), source: "manual", status: "active" },
    { id: "6", meterId: "2", value: 3420.8, unit: "kWh", timestamp: daysAgo(3), source: "api", status: "active" },
    { id: "7", meterId: "5", value: 2100.0, unit: "kWh", timestamp: daysAgo(4), source: "manual", status: "inactive" },
    { id: "8", meterId: "6", value: 45.1, unit: "mÂ³", timestamp: daysAgo(2), source: "api", status: "active" },
    { id: "9", meterId: "7", value: 980.0, unit: "kWh", timestamp: daysAgo(1), source: "manual", status: "active" },
    { id: "10", meterId: "3", value: 580.4, unit: "kWh", timestamp: now, source: "api", status: "active" },
  ],
  Invoice: [
    { id: "1", customerId: "1", amount: 450.75, status: "paid", dueDate: daysAgo(15), createdAt: daysAgo(45) },
    { id: "2", customerId: "2", amount: 890.00, status: "pending", dueDate: daysAgo(5), createdAt: daysAgo(35) },
    { id: "3", customerId: "3", amount: 230.50, status: "overdue", dueDate: daysAgo(30), createdAt: daysAgo(60) },
    { id: "4", customerId: "4", amount: 1200.00, status: "paid", dueDate: now, createdAt: daysAgo(30) },
    { id: "5", customerId: "5", amount: 675.25, status: "cancelled", dueDate: daysAgo(10), createdAt: daysAgo(40) },
    { id: "6", customerId: "1", amount: 510.00, status: "pending", dueDate: daysAgo(2), createdAt: daysAgo(32) },
    { id: "7", customerId: "6", amount: 340.80, status: "paid", dueDate: daysAgo(20), createdAt: daysAgo(50) },
    { id: "8", customerId: "7", amount: 1010.00, status: "overdue", dueDate: daysAgo(45), createdAt: daysAgo(75) },
  ],
  Payment: [
    { id: "1", invoiceId: "1", customerId: "1", amount: 450.75, method: "credit_card", status: "completed", createdAt: daysAgo(14) },
    { id: "2", invoiceId: "4", customerId: "4", amount: 1200.00, method: "bank_transfer", status: "completed", createdAt: daysAgo(1) },
    { id: "3", invoiceId: "7", customerId: "6", amount: 340.80, method: "cash", status: "completed", createdAt: daysAgo(19) },
    { id: "4", invoiceId: "2", customerId: "2", amount: 400.00, method: "credit_card", status: "partial", createdAt: daysAgo(3) },
    { id: "5", invoiceId: "6", customerId: "1", amount: 510.00, method: "bank_transfer", status: "pending", createdAt: daysAgo(2) },
    { id: "6", invoiceId: "6", customerId: "1", amount: 12.50, method: "credit_card", status: "failed", createdAt: now },
  ],
  User: [
    { id: "1", name: "Admin User", email: "admin@meterverse.com", role: "admin", status: "active", createdAt: daysAgo(365) },
    { id: "2", name: "Sarah Johnson", email: "sarah@meterverse.com", role: "manager", status: "active", createdAt: daysAgo(200) },
    { id: "3", name: "Michael Chen", email: "michael@meterverse.com", role: "operator", status: "active", createdAt: daysAgo(150) },
    { id: "4", name: "Fatima Ali", email: "fatima@meterverse.com", role: "viewer", status: "active", createdAt: daysAgo(90) },
    { id: "5", name: "Peter Kovacs", email: "peter@meterverse.com", role: "operator", status: "inactive", createdAt: daysAgo(60) },
    { id: "6", name: "Lina Wagner", email: "lina@meterverse.com", role: "manager", status: "active", createdAt: daysAgo(30) },
    { id: "7", name: "Roberto Silva", email: "roberto@meterverse.com", role: "viewer", status: "inactive", createdAt: daysAgo(15) },
  ],
  Role: [
    { id: "1", name: "admin", description: "Full system access", isSystem: true, userCount: 3 },
    { id: "2", name: "manager", description: "Operational management", isSystem: true, userCount: 5 },
    { id: "3", name: "operator", description: "Daily operations", isSystem: true, userCount: 12 },
    { id: "4", name: "viewer", description: "Read-only access", isSystem: true, userCount: 8 },
    { id: "5", name: "billing_admin", description: "Billing department", isSystem: false, userCount: 4 },
    { id: "6", name: "field_tech", description: "Field technician", isSystem: false, userCount: 15 },
  ],
  Account: [
    { id: "1", name: "Operating Account", type: "asset", balance: 1250000.00, status: "active", createdAt: daysAgo(365) },
    { id: "2", name: "Revenue Account", type: "revenue", balance: 340000.00, status: "active", createdAt: daysAgo(365) },
    { id: "3", name: "Accounts Receivable", type: "asset", balance: 89000.50, status: "active", createdAt: daysAgo(365) },
    { id: "4", name: "Utility Payable", type: "liability", balance: 45000.00, status: "active", createdAt: daysAgo(365) },
    { id: "5", name: "Depreciation Fund", type: "equity", balance: 67000.00, status: "inactive", createdAt: daysAgo(300) },
    { id: "6", name: "Tax Holding", type: "liability", balance: 12000.75, status: "active", createdAt: daysAgo(180) },
  ],
  JournalEntry: [
    { id: "1", accountId: "1", type: "debit", amount: 450.75, description: "Invoice payment received", date: daysAgo(14) },
    { id: "2", accountId: "3", type: "credit", amount: 450.75, description: "Invoice payment received", date: daysAgo(14) },
    { id: "3", accountId: "2", type: "debit", amount: 1200.00, description: "Monthly billing cycle", date: daysAgo(5) },
    { id: "4", accountId: "4", type: "credit", amount: 1200.00, description: "Monthly billing cycle", date: daysAgo(5) },
    { id: "5", accountId: "1", type: "debit", amount: 340.80, description: "Cash payment", date: daysAgo(3) },
    { id: "6", accountId: "6", type: "credit", amount: 340.80, description: "Cash payment", date: daysAgo(3) },
    { id: "7", accountId: "5", type: "debit", amount: 2000.00, description: "Monthly depreciation", date: daysAgo(1) },
    { id: "8", accountId: "2", type: "credit", amount: 2000.00, description: "Monthly depreciation", date: daysAgo(1) },
  ],
  Tariff: [
    { id: "1", name: "Residential Standard", rate: 0.95, unit: "kWh", status: "active", createdAt: daysAgo(365) },
    { id: "2", name: "Commercial Tier 1", rate: 1.45, unit: "kWh", status: "active", createdAt: daysAgo(365) },
    { id: "3", name: "Industrial High", rate: 1.10, unit: "kWh", status: "active", createdAt: daysAgo(300) },
    { id: "4", name: "Water Standard", rate: 3.50, unit: "mÂ³", status: "active", createdAt: daysAgo(365) },
    { id: "5", name: "Solar Feed-In", rate: 2.80, unit: "kWh", status: "inactive", createdAt: daysAgo(180) },
    { id: "6", name: "Gas Residential", rate: 1.75, unit: "mÂ³", status: "active", createdAt: daysAgo(200) },
  ],
  SIMCard: [
    { id: "1", iccid: "898601208100000001", provider: "Vodafone", phone: "+20 110 000 0001", status: "active", meterId: "1", createdAt: daysAgo(120) },
    { id: "2", iccid: "898601208100000002", provider: "Orange", phone: "+20 110 000 0002", status: "active", meterId: "2", createdAt: daysAgo(90) },
    { id: "3", iccid: "898601208100000003", provider: "Etisalat", phone: "+20 110 000 0003", status: "maintenance", meterId: "3", createdAt: daysAgo(60) },
    { id: "4", iccid: "898601208100000004", provider: "Vodafone", phone: "+20 110 000 0004", status: "active", meterId: "4", createdAt: daysAgo(45) },
    { id: "5", iccid: "898601208100000005", provider: "Orange", phone: "+20 110 000 0005", status: "inactive", meterId: "5", createdAt: daysAgo(30) },
    { id: "6", iccid: "898601208100000006", provider: "Etisalat", phone: "+20 110 000 0006", status: "active", meterId: "6", createdAt: daysAgo(20) },
    { id: "7", iccid: "898601208100000007", provider: "Vodafone", phone: "+20 110 000 0007", status: "terminated", meterId: "9", createdAt: daysAgo(5) },
    { id: "8", iccid: "898601208100000008", provider: "Orange", phone: "+20 110 000 0008", status: "active", meterId: "7", createdAt: now },
  ],
  CollectionCase: [
    { id: "1", customerId: "1", amount: 510.00, status: "open", assignedTo: "Sarah Johnson", createdAt: daysAgo(2) },
    { id: "2", customerId: "3", amount: 230.50, status: "open", assignedTo: "Michael Chen", createdAt: daysAgo(15) },
    { id: "3", customerId: "7", amount: 1010.00, status: "escalated", assignedTo: "Sarah Johnson", createdAt: daysAgo(30) },
    { id: "4", customerId: "2", amount: 490.00, status: "resolved", assignedTo: "Michael Chen", createdAt: daysAgo(10) },
    { id: "5", customerId: "5", amount: 675.25, status: "closed", assignedTo: "Fatima Ali", createdAt: daysAgo(40) },
    { id: "6", customerId: "8", amount: 320.00, status: "open", assignedTo: "Lina Wagner", createdAt: daysAgo(1) },
  ],
}

// â”€â”€â”€ Table Metadata â”€â”€â”€

const tables: TableMeta[] = [
  { name: "Customer", icon: "teams", description: "Customer records and contact information", columns: [
    { key: "id", label: "ID", type: "text", width: 60 }, { key: "name", label: "Name", width: 180 }, { key: "email", label: "Email", type: "email", width: 220 }, { key: "phone", label: "Phone", width: 160 }, { key: "address", label: "Address", width: 180 }, { key: "status", label: "Status", type: "status", width: 110 }, { key: "createdAt", label: "Created", type: "date", width: 110 },
  ]},
  { name: "Meter", icon: "settings", description: "Meter devices across all areas", columns: [
    { key: "id", label: "ID", type: "text", width: 60 }, { key: "serial", label: "Serial", width: 140 }, { key: "type", label: "Type", type: "badge", width: 100 }, { key: "area", label: "Area", width: 140 }, { key: "status", label: "Status", type: "status", width: 110 }, { key: "customerId", label: "Customer ID", width: 100 }, { key: "createdAt", label: "Created", type: "date", width: 110 },
  ]},
  { name: "Reading", icon: "post", description: "Meter consumption readings", columns: [
    { key: "id", label: "ID", type: "text", width: 60 }, { key: "meterId", label: "Meter ID", width: 100 }, { key: "value", label: "Value", type: "number", width: 110 }, { key: "unit", label: "Unit", type: "badge", width: 80 }, { key: "timestamp", label: "Timestamp", type: "date", width: 140 }, { key: "source", label: "Source", width: 110 }, { key: "status", label: "Status", type: "status", width: 110 },
  ]},
  { name: "Invoice", icon: "billing", description: "Customer invoices and billing records", columns: [
    { key: "id", label: "ID", type: "text", width: 60 }, { key: "customerId", label: "Customer", width: 100 }, { key: "amount", label: "Amount", type: "number", width: 130 }, { key: "status", label: "Status", type: "status", width: 110 }, { key: "dueDate", label: "Due Date", type: "date", width: 110 }, { key: "createdAt", label: "Created", type: "date", width: 110 },
  ]},
  { name: "Payment", icon: "creditCard", description: "Payment transactions", columns: [
    { key: "id", label: "ID", type: "text", width: 60 }, { key: "invoiceId", label: "Invoice", width: 100 }, { key: "customerId", label: "Customer", width: 100 }, { key: "amount", label: "Amount", type: "number", width: 130 }, { key: "method", label: "Method", type: "badge", width: 140 }, { key: "status", label: "Status", type: "status", width: 110 }, { key: "createdAt", label: "Created", type: "date", width: 110 },
  ]},
  { name: "User", icon: "user", description: "System users and administrators", columns: [
    { key: "id", label: "ID", type: "text", width: 60 }, { key: "name", label: "Name", width: 180 }, { key: "email", label: "Email", type: "email", width: 240 }, { key: "role", label: "Role", type: "badge", width: 110 }, { key: "status", label: "Status", type: "status", width: 110 }, { key: "createdAt", label: "Created", type: "date", width: 110 },
  ]},
  { name: "Role", icon: "lock", description: "RBAC roles and permissions", columns: [
    { key: "id", label: "ID", type: "text", width: 60 }, { key: "name", label: "Name", width: 160 }, { key: "description", label: "Description", width: 240 }, { key: "isSystem", label: "System", type: "badge", width: 90 }, { key: "userCount", label: "Users", type: "number", width: 80 },
  ]},
  { name: "Account", icon: "clipboard", description: "Financial accounts ledger", columns: [
    { key: "id", label: "ID", type: "text", width: 60 }, { key: "name", label: "Name", width: 200 }, { key: "type", label: "Type", type: "badge", width: 120 }, { key: "balance", label: "Balance", type: "number", width: 140 }, { key: "status", label: "Status", type: "status", width: 110 }, { key: "createdAt", label: "Created", type: "date", width: 110 },
  ]},
  { name: "JournalEntry", icon: "edit", description: "General journal entries", columns: [
    { key: "id", label: "ID", type: "text", width: 60 }, { key: "accountId", label: "Account", width: 100 }, { key: "type", label: "Type", type: "badge", width: 90 }, { key: "amount", label: "Amount", type: "number", width: 130 }, { key: "description", label: "Description", width: 280 }, { key: "date", label: "Date", type: "date", width: 110 },
  ]},
  { name: "Tariff", icon: "chart", description: "Tariff rate definitions", columns: [
    { key: "id", label: "ID", type: "text", width: 60 }, { key: "name", label: "Name", width: 200 }, { key: "rate", label: "Rate", type: "number", width: 100 }, { key: "unit", label: "Unit", type: "badge", width: 80 }, { key: "status", label: "Status", type: "status", width: 110 }, { key: "createdAt", label: "Created", type: "date", width: 110 },
  ]},
  { name: "SIMCard", icon: "phone", description: "SIM cards installed in meters", columns: [
    { key: "id", label: "ID", type: "text", width: 60 }, { key: "iccid", label: "ICCID", width: 200 }, { key: "provider", label: "Provider", type: "badge", width: 110 }, { key: "phone", label: "Phone", width: 160 }, { key: "status", label: "Status", type: "status", width: 110 }, { key: "meterId", label: "Meter ID", width: 100 }, { key: "createdAt", label: "Created", type: "date", width: 110 },
  ]},
  { name: "CollectionCase", icon: "warning", description: "Collection and debt recovery cases", columns: [
    { key: "id", label: "ID", type: "text", width: 60 }, { key: "customerId", label: "Customer", width: 100 }, { key: "amount", label: "Amount", type: "number", width: 130 }, { key: "status", label: "Status", type: "status", width: 110 }, { key: "assignedTo", label: "Assigned To", width: 170 }, { key: "createdAt", label: "Created", type: "date", width: 110 },
  ]},
]

// â”€â”€â”€ Helpers â”€â”€â”€

function formatCellValue(val: any, type?: string): string {
  if (val === null || val === undefined || val === "") return "â€”"
  if (type === "number" && typeof val === "number") return val.toLocaleString()
  if (type === "date") return val
  return String(val)
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    active: "#DC2626", completed: "#DC2626", paid: "#DC2626",
    inactive: "#A1A1AA", pending: "#EAB308", partial: "#EAB308",
    maintenance: "#F97316", overdue: "#EF4444", escalated: "#EF4444",
    terminated: "#EF4444", cancelled: "#EF4444", failed: "#EF4444",
    closed: "#6B7280", resolved: "#DC2626",
    open: "#3B82F6", debit: "#EF4444", credit: "#DC2626",
    true: "#DC2626", false: "#A1A1AA",
  }
  return map[status] || "#A1A1AA"
}

function badgeVariant(status: string): string {
  const map: Record<string, string> = {
    LP2: "default", Water: "secondary", Gas: "outline",
    admin: "destructive", manager: "default", operator: "secondary", viewer: "outline", billing_admin: "default", field_tech: "secondary",
    kWh: "default", "mÂ³": "secondary", L: "outline",
    Vodafone: "default", Orange: "secondary", Etisalat: "outline",
    asset: "default", revenue: "secondary", liability: "outline", equity: "outline",
    debit: "destructive", credit: "default",
    credit_card: "default", bank_transfer: "secondary", cash: "outline",
    true: "default", false: "outline",
  }
  return map[status] || "default"
}

function getNextId(rows: Record<string, any>[]): string {
  const nums = rows.map(r => parseInt(r.id)).filter(n => !isNaN(n))
  return String(Math.max(0, ...nums) + 1)
}

// â”€â”€â”€ Components â”€â”€â”€

function SortIcon({ dir }: { dir: "asc" | "desc" | null }) {
  return (
    <span className="inline-flex flex-col leading-none opacity-40 group-hover:opacity-100 transition-opacity">
      <svg width="8" height="4" viewBox="0 0 8 4" fill="currentColor" className={dir === "asc" ? "text-[var(--brand)]" : ""}><path d="M4 0L8 4H0z" /></svg>
      <svg width="8" height="4" viewBox="0 0 8 4" fill="currentColor" className={dir === "desc" ? "text-[var(--brand)]" : ""}><path d="M4 4L0 0h8z" /></svg>
    </span>
  )
}

function StatusBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor(value) }} />
      {value}
    </span>
  )
}

function BadgeCell({ value }: { value: string }) {
  const variants: Record<string, string> = {
    default: "bg-[var(--brand)]/10 text-[var(--brand)]",
    secondary: "bg-[var(--text-secondary)]/10 text-[var(--text-secondary)]",
    destructive: "bg-red-500/10 text-red-500",
    outline: "border border-[var(--border-default)] text-[var(--text-secondary)]",
  }
  const v = badgeVariant(value)
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md ${variants[v] || variants.default}`}>
      {value}
    </span>
  )
}

function CellEditor({ value, type, onSave, onCancel }: {
  value: any; type?: string; onSave: (v: any) => void; onCancel: () => void
}) {
  const [editValue, setEditValue] = useState(value ?? "")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { onSave(type === "number" ? parseFloat(editValue) || 0 : editValue) }
    if (e.key === "Escape") { onCancel() }
  }

  return (
    <input
      ref={inputRef}
      className="w-full h-full px-2 py-1 bg-[var(--brand)]/5 border border-[var(--brand)] rounded text-xs font-mono outline-none"
      style={{ color: "var(--text-primary)" }}
      value={editValue}
      onChange={e => setEditValue(e.target.value)}
      onBlur={() => onSave(type === "number" ? parseFloat(editValue) || 0 : editValue)}
      onKeyDown={handleKey}
    />
  )
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

// â”€â”€â”€ Main Page â”€â”€â”€

export default function AdminDatabasePage() {
  const [healthData, setHealthData] = useState<any>(null)
  useEffect(() => { getHealthSummary().then(setHealthData).catch(() => {}) }, [])
  const [selectedTable, setSelectedTable] = useState<TableName>("Customer")
  const [data, setData] = useState<Record<string, any>[]>(() => mockData["Customer"])
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [editingCell, setEditingCell] = useState<{ rowId: string; key: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const meta = tables.find(t => t.name === selectedTable)!

  const handleSelectTable = (name: TableName) => {
    setSelectedTable(name)
    setData(mockData[name])
    setSelectedRows(new Set())
    setSearchQuery("")
    setSortKey(null)
    setSortDir("asc")
    setEditingCell(null)
    setCurrentPage(1)
  }

  // â”€â”€ Filter & Sort â”€â”€
  const filtered = useMemo(() => {
    let result = [...data]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const cols = meta.columns
      result = result.filter(row =>
        cols.some(col => String(row[col.key] ?? "").toLowerCase().includes(q))
      )
    }
    if (sortKey) {
      result.sort((a, b) => {
        const va = a[sortKey], vb = b[sortKey]
        if (va == null) return 1; if (vb == null) return -1
        const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb))
        return sortDir === "asc" ? cmp : -cmp
      })
    }
    return result
  }, [data, searchQuery, sortKey, sortDir, meta.columns])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filtered.slice(start, start + rowsPerPage)
  }, [filtered, currentPage, rowsPerPage])

  // â”€â”€ Sort Toggle â”€â”€
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") { setSortDir("desc") }
      else { setSortKey(null); setSortDir("asc") }
    } else {
      setSortKey(key); setSortDir("asc")
    }
  }

  // â”€â”€ Row Selection â”€â”€
  const toggleRow = (id: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedRows.size === paginated.length) { setSelectedRows(new Set()) }
    else { setSelectedRows(new Set(paginated.map(r => r.id))) }
  }

  // â”€â”€ Cell Edit â”€â”€
  const handleCellSave = useCallback((rowId: string, key: string, value: any) => {
    setData(prev => prev.map(row => row.id === rowId ? { ...row, [key]: value } : row))
    setEditingCell(null)
  }, [])

  // â”€â”€ Row Operations â”€â”€
  const handleAddRow = () => {
    const newRow: Record<string, any> = { id: getNextId(data) }
    meta.columns.forEach(col => {
      if (col.type === "number") newRow[col.key] = 0
      else if (col.type === "date") newRow[col.key] = now
      else newRow[col.key] = col.key === "status" ? "active" : ""
    })
    setData(prev => [...prev, newRow])
    setCurrentPage(totalPages)
    toast.success("Row added")
  }

  const handleDeleteSelected = () => {
    if (selectedRows.size === 0) { toast.error("No rows selected"); return }
    setData(prev => prev.filter(r => !selectedRows.has(r.id)))
    setSelectedRows(new Set())
    toast.success(`${selectedRows.size} row(s) deleted`)
  }

  // â”€â”€ Export CSV â”€â”€
  const handleExportCSV = () => {
    const cols = meta.columns
    const header = cols.map(c => c.label).join(",")
    const rows = filtered.map(row =>
      cols.map(c => {
        const v = row[c.key]
        const s = v == null ? "" : String(v)
        return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
      }).join(",")
    )
    const csv = [header, ...rows].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `${selectedTable}_${now}.csv`; a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV exported")
  }

  // â”€â”€ Pagination â”€â”€
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // â”€â”€ Render â”€â”€
  const MetaIcon = Icons[meta.icon] || Icons.settings

  return (
    <div className="space-y-3">
      {healthData && (
        <div className="flex gap-2 text-xs">
          {[
            { label: "Meters", value: healthData.meters },
            { label: "Customers", value: healthData.customers },
            { label: "Invoices", value: healthData.invoices },
            { label: "Payments", value: healthData.payments },
          ].map(s => (
            <div key={s.label} className="rounded-xl border px-3 py-1.5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{s.value}</span>
              <span className="ml-1.5" style={{ color: "var(--text-secondary)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    <div className="flex h-full gap-3">
      {/* â”€â”€ Left Sidebar â”€â”€ */}
      <motion.div
        animate={{ width: sidebarCollapsed ? 48 : 220 }}
        className="shrink-0 rounded-xl border overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--sidebar-background)", borderColor: "var(--border-default)" }}
      >
        <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: "var(--border-default)" }}>
          {!sidebarCollapsed && (
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Tables</span>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-lg hover:bg-black/[.04] dark:hover:bg-white/[.04] transition-colors"
            style={{ color: "var(--text-tertiary)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points={sidebarCollapsed ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-1.5 px-1.5 space-y-0.5">
          {tables.map(t => {
            const IconComp = Icons[t.icon] || Icons.settings
            const isActive = selectedTable === t.name
            return (
              <motion.button
                key={t.name}
                onClick={() => handleSelectTable(t.name)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2.5 w-full rounded-lg text-xs font-semibold transition-all relative overflow-hidden"
                style={{
                  padding: sidebarCollapsed ? "8px" : "7px 10px",
                  color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                }}
              >
                {isActive && (
                  <motion.div layoutId="dbTableBg" className="absolute inset-0 rounded-lg" style={{ backgroundColor: "var(--brand)" }} />
                )}
                <span className="relative z-10 flex items-center gap-2.5 w-full">
                  <IconComp className="shrink-0" size={14} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="truncate">{t.name}</span>
                      <span className="ml-auto text-[9px] opacity-50">{mockData[t.name].length}</span>
                    </>
                  )}
                </span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* â”€â”€ Main Area â”€â”€ */}
      <div className="flex-1 flex flex-col min-w-0 gap-3">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--brand)/10" }}>
              <MetaIcon size={16} style={{ color: "var(--brand)" }} />
            </div>
            <div>
              <h1 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{selectedTable}</h1>
              <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{meta.description} Â· {filtered.length} records</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Icons.search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
              <input
                className="h-8 pl-7 pr-3 rounded-lg border text-xs outline-none w-48 transition-all focus:w-64"
                style={{ backgroundColor: "var(--surface-base)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                placeholder="Search..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-1.5 shrink-0">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleAddRow}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-bold transition-colors"
            style={{ backgroundColor: "var(--brand)", color: "#FFFFFF" }}
          >
            <Icons.add size={13} />
            <span>Add Row</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleDeleteSelected}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-bold transition-colors border"
            style={{ borderColor: "var(--border-default)", color: selectedRows.size > 0 ? "#EF4444" : "var(--text-tertiary)" }}
          >
            <Icons.trash size={13} />
            <span>Delete ({selectedRows.size})</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-bold transition-colors border"
            style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
          >
            <Icons.download size={13} />
            <span>Export CSV</span>
          </motion.button>
        </div>

        {/* Data Grid */}
        <div className="flex-1 overflow-auto rounded-xl border" style={{ borderColor: "var(--border-default)" }}>
          <table className="w-full border-collapse text-xs" style={{ minWidth: meta.columns.reduce((s, c) => s + (c.width || 140), 60) }}>
            {/* Header */}
            <thead>
              <tr style={{ backgroundColor: "var(--surface-base)" }}>
                <th className="sticky top-0 z-10 border-b px-2 py-2.5 w-10 text-center" style={{ borderColor: "var(--border-default)" }}>
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selectedRows.size === paginated.length}
                    ref={el => { if (el) el.indeterminate = selectedRows.size > 0 && selectedRows.size < paginated.length }}
                    onChange={toggleAll}
                    className="rounded border-gray-400 accent-[var(--brand)]"
                  />
                </th>
                {meta.columns.map(col => (
                  <th
                    key={col.key}
                    className="sticky top-0 z-10 border-b px-2 py-2.5 text-left font-bold text-[10px] uppercase tracking-wider cursor-pointer select-none group"
                    style={{ width: col.width, minWidth: col.width, borderColor: "var(--border-default)", color: "var(--text-tertiary)" }}
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      <SortIcon dir={sortKey === col.key ? sortDir : null} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {paginated.map((row, idx) => (
                  <motion.tr
                    key={row.id}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="group transition-colors"
                    style={{
                      backgroundColor: selectedRows.has(row.id)
                        ? "var(--brand)"
                        : idx % 2 === 0
                          ? "transparent"
                          : "var(--surface-base)",
                      color: selectedRows.has(row.id) ? "#FFFFFF" : "var(--text-primary)",
                    }}
                  >
                    <td className="px-2 py-1.5 text-center border-b" style={{ borderColor: "var(--border-default)" }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        className="rounded border-gray-400 accent-white"
                      />
                    </td>
                    {meta.columns.map(col => {
                      const isEditing = editingCell?.rowId === row.id && editingCell?.key === col.key
                      const raw = row[col.key]
                      const display = formatCellValue(raw, col.type)

                      return (
                        <td
                          key={col.key}
                          className="px-2 py-1.5 border-b align-middle relative cursor-default"
                          style={{
                            borderColor: "var(--border-default)",
                            minWidth: col.width,
                            maxWidth: col.width,
                            width: col.width,
                          }}
                          onDoubleClick={() => {
                            if (col.key !== "id") setEditingCell({ rowId: row.id, key: col.key })
                          }}
                        >
                          {isEditing ? (
                            <CellEditor
                              value={raw}
                              type={col.type}
                              onSave={v => handleCellSave(row.id, col.key, v)}
                              onCancel={() => setEditingCell(null)}
                            />
                          ) : col.type === "status" ? (
                            <StatusBadge value={display} />
                          ) : col.type === "badge" ? (
                            <BadgeCell value={display} />
                          ) : (
                            <span className="block truncate text-[11px] font-mono">{display}</span>
                          )}
                        </td>
                      )
                    })}
                  </motion.tr>
                ))}
              </AnimatePresence>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={meta.columns.length + 1} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
                      <Icons.search size={24} className="opacity-30" />
                      <span className="text-xs font-medium">No records found</span>
                      {searchQuery && <button onClick={() => setSearchQuery("")} className="text-[10px] underline">Clear search</button>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1) }}
              className="h-7 px-2 rounded-md border text-xs outline-none bg-transparent"
              style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}
            >
              {ROWS_PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>
              {filtered.length === 0 ? "0 records" : `${(currentPage - 1) * rowsPerPage + 1}â€“${Math.min(currentPage * rowsPerPage, filtered.length)} of ${filtered.length}`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => goToPage(1)} disabled={currentPage <= 1}
              className="p-1.5 rounded-md transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.04] disabled:opacity-20"
              style={{ color: "var(--text-secondary)" }}
            >
              <Icons.chevronsLeft size={14} />
            </button>
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}
              className="p-1.5 rounded-md transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.04] disabled:opacity-20"
              style={{ color: "var(--text-secondary)" }}
            >
              <Icons.chevronLeft size={14} />
            </button>
            <div className="flex items-center gap-0.5 px-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 7) { pageNum = i + 1 }
                else if (currentPage <= 4) { pageNum = i + 1 }
                else if (currentPage >= totalPages - 3) { pageNum = totalPages - 6 + i }
                else { pageNum = currentPage - 3 + i }
                return (
                  <button key={pageNum} onClick={() => goToPage(pageNum)}
                    className="w-7 h-7 rounded-md text-[11px] font-bold transition-colors"
                    style={{
                      backgroundColor: pageNum === currentPage ? "var(--brand)" : "transparent",
                      color: pageNum === currentPage ? "#FFFFFF" : "var(--text-secondary)",
                    }}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}
              className="p-1.5 rounded-md transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.04] disabled:opacity-20"
              style={{ color: "var(--text-secondary)" }}
            >
              <Icons.chevronRight size={14} />
            </button>
            <button onClick={() => goToPage(totalPages)} disabled={currentPage >= totalPages}
              className="p-1.5 rounded-md transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.04] disabled:opacity-20"
              style={{ color: "var(--text-secondary)" }}
            >
              <Icons.chevronsRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
