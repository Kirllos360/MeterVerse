import { prisma } from "../db.js"
import crypto from "crypto"

const RETRY_DELAYS = [1000, 5000, 15000]  // 1s, 5s, 15s exponential backoff
const MAX_BODY_SIZE = 512 * 1024  // 512KB max payload

export async function dispatchWebhook(event, payload) {
  try {
    const webhooks = await prisma.webhook.findMany({ where: { active: true, archivedAt: null } })
    const matching = webhooks.filter(w => {
      try { return JSON.parse(w.events).includes(event) } catch { return false }
    })
    if (matching.length === 0) return { dispatched: 0 }

    const results = []
    for (const webhook of matching) {
      const body = JSON.stringify({ event, timestamp: new Date().toISOString(), payload })
      if (body.length > MAX_BODY_SIZE) {
        results.push({ webhookId: webhook.id, error: "Payload too large" })
        continue
      }

      // HMAC signing
      const signature = webhook.secret
        ? crypto.createHmac("sha256", webhook.secret).update(body).digest("hex")
        : null

      let success = false
      for (let attempt = 0; attempt < RETRY_DELAYS.length; attempt++) {
        try {
          const headers = { "Content-Type": "application/json", "X-Event-Type": event }
          if (signature) headers["X-Webhook-Signature"] = signature

          const res = await fetch(webhook.url, {
            method: "POST", headers, body,
            signal: AbortSignal.timeout(10000),
          })
          if (res.ok) { success = true; break }
        } catch {}
        if (attempt < RETRY_DELAYS.length - 1) await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt]))
      }

      await prisma.webhook.update({ where: { id: webhook.id }, data: { lastTriggeredAt: new Date() } })
      await prisma.gatewayLog?.create?.({
        data: { webhookId: webhook.id, event, status: success ? "delivered" : "failed", response: success ? "200" : "timeout" },
      }).catch(() => {})

      results.push({ webhookId: webhook.id, success })
    }
    return { dispatched: results.length, results }
  } catch (err) {
    return { error: err.message, dispatched: 0 }
  }
}
