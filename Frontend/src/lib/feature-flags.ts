export type ModuleKey =
  | "customers"
  | "meters"
  | "readings"
  | "invoices"
  | "payments"
  | "tariffs"
  | "sim"
  | "projects"
  | "reports"
  | "documents"
  | "dashboard"
  | "users"

export type FeatureFlag = {
  enabled: boolean
  useMock: boolean
  description: string
}

const defaultFlags: Record<ModuleKey, FeatureFlag> = {
  customers: { enabled: true, useMock: false, description: "Customer management module" },
  meters: { enabled: true, useMock: false, description: "Meter management module" },
  readings: { enabled: true, useMock: false, description: "Reading management module" },
  invoices: { enabled: true, useMock: false, description: "Invoice module" },
  payments: { enabled: true, useMock: false, description: "Payments module" },
  tariffs: { enabled: true, useMock: false, description: "Tariff engine" },
  sim: { enabled: true, useMock: false, description: "SIM card module" },
  projects: { enabled: true, useMock: false, description: "Project configuration" },
  reports: { enabled: true, useMock: false, description: "Reporting module" },
  documents: { enabled: true, useMock: false, description: "Document management" },
  dashboard: { enabled: true, useMock: false, description: "Dashboard" },
  users: { enabled: true, useMock: false, description: "User management" },
}

const storageKey = "meterverse-feature-flags"

function loadFlags(): Record<ModuleKey, FeatureFlag> {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) return { ...defaultFlags, ...JSON.parse(stored) }
  } catch { /* ignore */ }
  return { ...defaultFlags }
}

function saveFlags(flags: Record<ModuleKey, FeatureFlag>) {
  try { localStorage.setItem(storageKey, JSON.stringify(flags)) } catch { /* ignore */ }
}

function getFlags(): Record<ModuleKey, FeatureFlag> {
  return loadFlags()
}

export function isModuleEnabled(module: ModuleKey): boolean {
  const flags = getFlags()
  return flags[module]?.enabled ?? true
}

export function useMockApi(module: ModuleKey): boolean {
  const flags = getFlags()
  return flags[module]?.useMock ?? false
}

export function setFeatureFlag(module: ModuleKey, updates: Partial<FeatureFlag>) {
  const flags = getFlags()
  if (flags[module]) {
    flags[module] = { ...flags[module], ...updates }
    saveFlags(flags)
  }
}

export function resetFeatureFlags() {
  saveFlags({ ...defaultFlags })
}

export function getAllFlags(): Record<ModuleKey, FeatureFlag> {
  return getFlags()
}
