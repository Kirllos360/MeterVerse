export type RuntimeProfile = "admin" | "portal"

export interface ServicePorts {
  adminFrontend: number
  adminBackend: number
  portalFrontend: number
  portalBackend: number
}

/** MeterVerse OS canonical port registry — single source of truth. */
export const SERVICE_PORTS: ServicePorts = {
  adminFrontend: 3030,
  adminBackend: 3131,
  portalFrontend: 3535,
  portalBackend: 3003,
}

export const BRAND_NAME = "MeterVerse OS"

/** Current runtime profile, from PORTAL_MODE env. */
export function currentProfile(env: NodeJS.ProcessEnv = process.env): RuntimeProfile {
  return env.PORTAL_MODE === "1" ? "portal" : "admin"
}

export type Role = "super_admin" | "admin" | "manager" | "operator" | "viewer" | "customer"
