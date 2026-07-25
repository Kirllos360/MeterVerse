import { Router } from "express"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"
import { savePermissions, getServicePermissions, ALL_SERVICES } from "../middleware/thirdPartyPermissions.js"
import { z } from "zod"
import crypto from "crypto"

const router = Router()
router.use(authenticate)

const ALGORITHM = "aes-256-gcm"
const ENCRYPTION_KEY = crypto.scryptSync(process.env.JWT_SECRET || "meterverse-default-secret", "salt", 32)

function encrypt(text) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return iv.toString("hex") + ":" + encrypted
}

function decrypt(text) {
  if (!text) return null
  try {
    const parts = text.split(":")
    const iv = Buffer.from(parts.shift(), "hex")
    const encrypted = parts.join(":")
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv)
    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  } catch { return null }
}

async function getConfig(key) {
  const setting = await prisma.systemSetting.findUnique({ where: { key: `config_${key}` } })
  if (!setting) return {}
  try {
    const parsed = JSON.parse(decrypt(setting.value) || "{}")
    return parsed
  } catch { return {} }
}

async function setConfig(key, value) {
  const encrypted = encrypt(JSON.stringify(value))
  await prisma.systemSetting.upsert({
    where: { key: `config_${key}` },
    create: { key: `config_${key}`, value: encrypted },
    update: { value: encrypted },
  })
}

// GET /api/admin/config/:key - Load configuration
router.get("/config/:key", requirePermission("admin.*"), async (req, res) => {
  try {
    if (req.params.key === "symbiot") {
      const raw = await getConfig("symbiot")
      return res.json({ connections: raw.connections || [] })
    }
    const config = await getConfig(req.params.key)
    res.json({ config })
  } catch (err) { res.status(500).json({ error: "Failed to load config" }) }
})

// POST /api/admin/config/:key - Save configuration
router.post("/config/:key", requirePermission("admin.*"), async (req, res) => {
  try {
    if (req.params.key === "symbiot") {
      const { connections } = req.body
      await setConfig("symbiot", { connections: connections || [] })
      return res.json({ message: `${connections?.length || 0} connection(s) saved` })
    }
    await setConfig(req.params.key, req.body.config || {})
    res.json({ message: "Configuration saved" })
  } catch (err) { res.status(500).json({ error: "Failed to save config" }) }
})

// POST /api/admin/config/smtp/test - Test SMTP connection
router.post("/config/smtp/test", requirePermission("admin.*"), async (req, res) => {
  try {
    const { host, port, username, password, secure } = req.body.config || {}
    if (!host || !port) return res.status(400).json({ error: "Host and port required" })
    // SMTP connection test placeholder — real implementation uses nodemailer
    res.json({ message: `SMTP configuration validated. Host: ${host}:${port}. User: ${username}. Save config and install nodemailer for full test.` })
  } catch (err) { res.status(500).json({ error: "SMTP test failed" }) }
})

// POST /api/admin/config/sms/test - Test SMS connection
router.post("/config/sms/test", requirePermission("admin.*"), async (req, res) => {
  try {
    const { provider, accountSid, fromNumber } = req.body.config || {}
    if (!provider || !accountSid) return res.status(400).json({ error: "Provider and account SID required" })
    res.json({ message: `SMS configuration validated. Provider: ${provider}. From: ${fromNumber}. Save config and install Twilio/Vonage SDK for full test.` })
  } catch (err) { res.status(500).json({ error: "SMS test failed" }) }
})

// POST /api/admin/config/firebase/test - Test Firebase connection
router.post("/config/firebase/test", requirePermission("admin.*"), async (req, res) => {
  try {
    const { projectId } = req.body.config || {}
    if (!projectId) return res.status(400).json({ error: "Project ID required" })
    res.json({ message: `Firebase configuration validated. Project: ${projectId}. Save config and install firebase-admin SDK for full test.` })
  } catch (err) { res.status(500).json({ error: "Firebase test failed" }) }
})

// POST /api/admin/config/symbiot/test - Test Symbiot connection
router.post("/config/symbiot/test", requirePermission("admin.*"), async (req, res) => {
  try {
    const { connection } = req.body
    if (!connection?.ip || !connection?.port) return res.status(400).json({ error: "IP and port required" })
    // Symbiot connection test — ping the server
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const resp = await fetch(`http://${connection.ip}:${connection.port}/health`, { signal: controller.signal })
      clearTimeout(timeout)
      if (resp.ok) return res.json({ message: `Connected to ${connection.projectName} at ${connection.ip}:${connection.port}` })
      return res.json({ message: `Server at ${connection.ip}:${connection.port} responded (status ${resp.status})` })
    } catch (e) {
      return res.status(400).json({ error: `Cannot reach ${connection.ip}:${connection.port} — ${e.message}` })
    }
  } catch (err) { res.status(500).json({ error: "Symbiot test failed" }) }
})

// ─── THIRD PARTY PERMISSION GRANTS (phone-app style) ────────────────

router.get("/permissions", requirePermission("admin.*"), async (req, res) => {
  const data = getServicePermissions()
  res.json(data)
})

router.post("/permissions/:serviceId/grant", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const svc = ALL_SERVICES.find(s => s.id === req.params.serviceId)
    if (!svc) return res.status(404).json({ error: "Unknown service" })

    const setting = await prisma.systemSetting.findUnique({ where: { key: "third_party_permissions" } })
    const perms = setting?.value ? JSON.parse(setting.value) : {}

    perms[req.params.serviceId] = {
      granted: true,
      grantedBy: req.user?.email || "unknown",
      grantedAt: new Date().toISOString(),
    }

    await savePermissions(perms)
    auditLog(req, "permission.granted", { service: req.params.serviceId, grantedBy: req.user?.email })
    res.json({ message: `${svc.label} permission granted.`, permissions: perms })
  } catch (err) { next(err) }
})

router.post("/permissions/:serviceId/revoke", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: "third_party_permissions" } })
    const perms = setting?.value ? JSON.parse(setting.value) : {}
    perms[req.params.serviceId] = { granted: false, grantedBy: null, grantedAt: null }
    await savePermissions(perms)
    auditLog(req, "permission.revoked", { service: req.params.serviceId })
    res.json({ message: `Permission revoked.`, permissions: perms })
  } catch (err) { next(err) }
})

export { router as configRouter }
