export interface HealthSummary {
  meters: number
  customers: number
  invoices: number
  payments: number
  users: number
  openEvents: number
}

export interface HealthCounters {
  areas: { area: string; _count: number }[]
  projects: { id: string; name: string; _count: { zones: number } }[]
}

export interface SystemSetting {
  id: string
  key: string
  value: string
  category: string
  type: string
  createdAt: string
  updatedAt: string
}

export interface AuditEntry {
  id: string
  timestamp: string
  actor: string | null
  actorId: string | null
  action: string
  resource: string | null
  resourceId: string | null
  details: string | null
  user: { name: string; email: string } | null
}

export interface MeterType {
  id: string
  name: string
  category: string
  unit: string
  manufacturer: string | null
  _count: { meters: number }
}

export interface CustomerGroup {
  id: string
  name: string
  description: string | null
  _count: { members: number }
}

export interface Tariff {
  id: string
  name: string
  code: string
  type: string
  unit: string
  effectiveFrom: string
  effectiveTo: string | null
  rates: { id: string; name: string; rate: number }[]
  tiers: { id: string; name: string }[]
}

export interface PaymentGateway {
  id: string
  name: string
  provider: string
  active: boolean
  testMode: boolean
}

export interface UserEntry {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastLoginAt: string | null
  createdAt: string
  roleRel: { name: string } | null
}

export interface Role {
  id: string
  name: string
  description: string | null
  _count: { users: number }
  permissions: { permission: { name: string } }[]
}

export interface BillCycle {
  id: string
  name: string
  code: string
  frequency: string
  billingDay: number
  dueDay: number
  cutOffDay: number
  billRuns: { id: string; status: string; periodStart: string; periodEnd: string }[]
}

export interface ActivityEvent {
  id: string
  actor: string | null
  action: string
  resource: string | null
  severity: string
  createdAt: string
}
