// Model Router — Provider-agnostic AI model abstraction
import logger from "../../../../backend/src/services/logger.js"

const PROVIDERS = {
  cloudflare: {
    chat: async (model, messages) => {
      const res = await fetch(`${process.env.CLOUDFLARE_API_BASE || "https://api.cloudflare.com/client/v4/accounts/" + process.env.CLOUDFLARE_ACCOUNT_ID + "/ai/run"}/${model}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_AI_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      })
      return res.json()
    },
  },
  openai: {
    chat: async (model, messages) => {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages }),
      })
      return res.json()
    },
  },
}

export class ModelRouter {
  constructor() {
    this.defaultProvider = process.env.AI_PROVIDER || "cloudflare"
    this.models = {
      "llama-3.2-3b": { provider: "cloudflare", model: "@cf/meta/llama-3.2-3b-instruct" },
      "llama-3.1-8b": { provider: "cloudflare", model: "@cf/meta/llama-3.1-8b-instruct" },
      "gpt-4o-mini": { provider: "openai", model: "gpt-4o-mini" },
    }
  }

  async chat(modelKey, messages) {
    const config = this.models[modelKey]
    if (!config) throw new Error(`Model '${modelKey}' not found`)

    const provider = PROVIDERS[config.provider]
    if (!provider) throw new Error(`Provider '${config.provider}' not configured`)

    logger.info({ model: modelKey, provider: config.provider }, `Model router: ${modelKey} via ${config.provider}`)
    return provider.chat(config.model, messages)
  }

  async analyze(modelKey, prompt, data) {
    const messages = [
      { role: "system", content: prompt },
      { role: "user", content: typeof data === "string" ? data : JSON.stringify(data, null, 2) },
    ]
    return this.chat(modelKey, messages)
  }
}

export const modelRouter = new ModelRouter()

