import { prisma } from "../server.js"

const PERMISSIONS_CACHE = new Map()
const CACHE_TTL = 30000 // 30 seconds

const ALL_SERVICES = [
  { id: "smtp", label: "SMTP Email", description: "Send emails via SMTP server", icon: "✉️" },
  { id: "sms", label: "SMS Gateway", description: "Send SMS via Twilio/Vonage", icon: "💬" },
  { id: "firebase", label: "Firebase Push", description: "Push notifications via Firebase", icon: "🔔" },
  { id: "symbiot", label: "Symbiot Connections", description: "Meter data ingestion via Symbiot", icon: "📡" },
  { id: "cloudflare_ai", label: "Cloudflare AI", description: "AI inference via Cloudflare Workers", icon: "🤖" },
  { id: "vercel", label: "Vercel Deployment", description: "Deployment via Vercel", icon: "▲" },
  { id: "openai", label: "OpenAI API", description: "AI via OpenAI", icon: "🧠" },
  { id: "maps", label: "Google Maps", description: "Geolocation services", icon: "🗺️" },
  { id: "clerk", label: "Clerk Auth", description: "Authentication service", icon: "🔐" },
  { id: "sentry", label: "Sentry Monitoring", description: "Error tracking", icon: "📊" },
]

let cachedPermissions = {}
let lastFetch = 0

async function loadPermissions() {
  const now = Date.now()
  if (now - lastFetch < CACHE_TTL && Object.keys(cachedPermissions).length > 0) return cachedPermissions
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: "third_party_permissions" } })
    if (setting?.value) cachedPermissions = JSON.parse(setting.value)
    else cachedPermissions = {}
    lastFetch = now
  } catch { cachedPermissions = {} }
  return cachedPermissions
}

export async function savePermissions(perms) {
  cachedPermissions = perms
  lastFetch = Date.now()
  await prisma.systemSetting.upsert({
    where: { key: "third_party_permissions" },
    create: { key: "third_party_permissions", value: JSON.stringify(perms) },
    update: { value: JSON.stringify(perms) },
  })
}

export function requireThirdPartyPermission(serviceId) {
  return async (req, res, next) => {
    const perms = await loadPermissions()
    const svc = ALL_SERVICES.find(s => s.id === serviceId)
    const grant = perms[serviceId]

    if (!grant?.granted) {
      return res.status(403).json({
        error: `Third-party service '${svc?.label || serviceId}' is not activated.`,
        code: "THIRD_PARTY_PERMISSION_DENIED",
        service: serviceId,
        resolution: `Go to Admin → Config Center → Permissions to grant access.`,
      })
    }

    next()
  }
}

export function getServicePermissions() {
  return { services: ALL_SERVICES, permissions: cachedPermissions }
}

export { ALL_SERVICES }
