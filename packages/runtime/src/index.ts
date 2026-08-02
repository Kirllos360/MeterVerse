import { SERVICE_PORTS } from "@meterverse/shared-types"

export interface HealthResult {
  name: string
  url: string
  status: "ok" | "down"
}

/** Health-check a single service. */
export async function checkHealth(url: string, timeoutMs = 4000): Promise<HealthResult> {
  const name = url
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(t)
    return { name, url, status: res.ok ? "ok" : "down" }
  } catch {
    return { name, url, status: "down" }
  }
}

/** Health-check all four MeterVerse OS services. */
export async function checkAllServices(): Promise<HealthResult[]> {
  const targets = [
    { name: "Admin Frontend", url: `http://localhost:${SERVICE_PORTS.adminFrontend}` },
    { name: "Admin Backend", url: `http://localhost:${SERVICE_PORTS.adminBackend}/api/health` },
    { name: "Portal Frontend", url: `http://localhost:${SERVICE_PORTS.portalFrontend}` },
    { name: "Portal Backend", url: `http://localhost:${SERVICE_PORTS.portalBackend}/api/health` },
  ]
  return Promise.all(targets.map(t => checkHealth(t.url)))
}
