/* ── Domain Models — no `any`, no `unknown`, no `object` ── */

export interface Customer {
  id: string; name: string; code: string; phone: string; email: string;
  type: string; status: string; balance: number; meters: number;
  area: string; project: string; contract: string; contractEnd: string;
  plan: string; sla: string; address: string; avgConsumption: string;
}

export interface Meter {
  id: string; code: string; customer: string; type: string; status: string;
  consumption: string; model: string; area: string; installDate: string;
  connectivity: string; signal: number; battery: number;
  lastReadingVal: string; lastReadingUnit: string; lastReadingDate: string;
  firmware: string; manufacturer: string; fwRelease: string;
  imei: string; iccid: string; mac: string; ip: string;
}

export interface Invoice {
  id: string; number: string; customerId: string; customer: string;
  amount: number; dueDate: string; status: string; items: number;
}

export interface Payment {
  id: string; ref: string; invoice: string; customer: string;
  amount: number; date: string; method: string; status: string;
}

export interface Reading {
  id: string; meter: string; customer: string; value: string;
  unit: string; date: string; status: string; source: string;
}

export interface Alert {
  id: string; title: string; description: string; severity: "danger" | "warning" | "info";
  date: string; entityId: string; entityType: string;
}

export interface Activity {
  id: string; action: string; detail: string; time: string; type: string;
}

export interface Case {
  id: string; title: string; status: string; priority: string; date: string;
}

export interface Communication {
  from: string; message: string; date: string;
}

export interface WorkOrder {
  id: string; title: string; status: string; priority: string; date: string; assignee: string;
}

export interface Maintenance {
  action: string; by: string; date: string; notes: string;
}

export interface Command {
  command: string; status: string; date: string; by: string;
}

export interface Audit {
  action: string; by: string; date: string;
}

export interface PaymentPlan {
  amount: number; frequency: string; nextDue: string; method: string; status: string;
}

export interface CustomerMeter {
  code: string; type: string; status: string; consumption: string;
}

export interface CustomerInvoice {
  number: string; amount: number; dueDate: string; status: string;
}

export interface CustomerPayment {
  ref: string; amount: number; date: string; status: string;
}

export interface SystemHealth {
  label: string; status: "healthy" | "warning" | "critical"; value: string; uptime: string;
}

export interface AreaMetric {
  area: string; customers: number; meters: number; revenue: string; collection: string;
}

export interface UpcomingEvent {
  label: string; date: string; tag: string;
}

export interface DashboardKPI {
  label: string; value: string; change: string; up: boolean;
}

export interface DashboardData {
  kpis: DashboardKPI[]; alerts: Alert[]; activities: Activity[];
  areaMetrics: AreaMetric[]; systemHealth: SystemHealth[];
  upcoming: UpcomingEvent[];
}
