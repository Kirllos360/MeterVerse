import { SERVICE_PORTS } from "@meterverse/shared-types"

export interface ApiConfig {
  profile: "admin" | "portal"
}

/** Resolve the backend base URL for the given profile. */
export function backendBaseUrl(config: ApiConfig, env: Record<string, string | undefined> = process.env): string {
  const explicit = env.NEXT_PUBLIC_API_URL
  if (explicit) return explicit
  const port = config.profile === "portal" ? SERVICE_PORTS.portalBackend : SERVICE_PORTS.adminBackend
  return `http://localhost:${port}`
}

/** Resolve the frontend base URL for the given profile. */
export function frontendBaseUrl(config: ApiConfig): string {
  return config.profile === "portal"
    ? `http://localhost:${SERVICE_PORTS.portalFrontend}`
    : `http://localhost:${SERVICE_PORTS.adminFrontend}`
}
