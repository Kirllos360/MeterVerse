import { Router } from "express"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()

const CF_AI_URL = "https://api.cloudflare.com/client/v4/accounts"
const CF_ACCOUNT_ID = "" // Extracted from token or set via env
const CF_API_TOKEN = process.env.CLOUDFLARE_AI_TOKEN || ""

const MODELS = {
  "llama-3.2-3b": "@cf/meta/llama-3.2-3b-instruct",
  "llama-3.1-8b": "@cf/meta/llama-3.1-8b-instruct",
  "mistral-7b": "@cf/mistral/mistral-7b-instruct-v0.1",
  "llama-3.2-1b": "@cf/meta/llama-3.2-1b-instruct",
}

router.post("/ai/chat", requirePermission("ai.*"), async (req, res, next) => {
  try {
    const { message, model = "llama-3.2-3b", system = "You are MeterVerse AI assistant." } = req.body
    if (!message) return res.status(400).json({ error: "Message required" })

    const modelPath = MODELS[model]
    if (!modelPath) return res.status(400).json({ error: `Unknown model. Available: ${Object.keys(MODELS).join(", ")}` })

    if (!CF_API_TOKEN) {
      return res.json({
        model,
        response: `[Cloudflare AI not configured] Set CLOUDFLARE_AI_TOKEN env var. You said: "${message.substring(0, 50)}..."`,
        source: "offline",
      })
    }

    const cfRes = await fetch(`${CF_AI_URL}/${CF_ACCOUNT_ID}/ai/run/${modelPath}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${CF_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "system", content: system }, { role: "user", content: message }] }),
    })

    if (!cfRes.ok) {
      const err = await cfRes.text()
      return res.status(502).json({ error: `Cloudflare AI error: ${err.substring(0, 200)}` })
    }

    const data = await cfRes.json()
    auditLog(req, "ai.chat", { model, messageLength: message.length })

    res.json({
      model,
      response: data.result?.response || "No response",
      usage: data.result?.usage || {},
    })
  } catch (err) { next(err) }
})

// List available models
router.get("/ai/models", requirePermission("ai.*"), (req, res) => {
  res.json({
    models: Object.entries(MODELS).map(([id, path]) => ({ id, path, free: true, provider: "Cloudflare Workers AI" })),
    configured: !!CF_API_TOKEN,
  })
})

export { router as aiCloudflareRouter }
