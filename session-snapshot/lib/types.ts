/* ── Normalized Entity Types ── */
export interface Customer {
  id: string; name: string; code: string; phone?: string; email?: string;
  type: string; status: string; balance: number; meters: number;
  area?: string; project?: string; contract?: string; contractEnd?: string;
  plan?: string; sla?: string; address?: string;
  avgConsumption?: string;
  invoices?: any[]; payments?: any[]; alerts?: any[]; cases?: any[];
  communications?: any[]; meterList?: any[]; paymentPlan?: any;
  audit?: any[];
}

export interface Meter {
  id: string; code: string; customer: string; type: string; status: string;
  consumption: string; model?: string; area?: string; installDate?: string;
  connectivity?: string; signal?: number; battery?: number;
  lastReadingVal?: string; lastReadingUnit?: string; lastReadingDate?: string;
  firmware?: string; manufacturer?: string;
  imei?: string; iccid?: string; mac?: string; ip?: string;
  readings?: any[]; alarms?: any[]; commands?: any[]; comms?: any[];
  workOrders?: any[]; maintenance?: any[]; audit?: any[];
}

export interface Invoice {
  id: string; number: string; customer: string; amount: number;
  dueDate: string; status: string; items?: number;
}

export interface Payment {
  id: string; ref: string; invoice: string; customer: string;
  amount: number; date: string; method: string; status: string;
}

export interface Reading {
  id: string; meter: string; customer: string; value: string;
  unit: string; date: string; status: string; source: string;
}

/* ── Safe access helpers ── */
export function str(v: unknown, fallback = "—"): string {
  if (v === null || v === undefined) return fallback;
  return String(v);
}

export function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
}

export function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? v : [];
}

export function safeStr(v: unknown, fallback = "—"): string {
  if (v === null || v === undefined || v === "") return fallback;
  return String(v);
}
