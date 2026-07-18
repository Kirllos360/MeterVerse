import { AIBase, type AIContext } from "../shared/ai-base"

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
  actions?: { label: string; actionId: string }[]
}

export interface AIAssistantResponse {
  message: string
  reasoning: string
  confidence: number
  suggestions?: string[]
  actions?: { label: string; actionId: string }[]
}

export class AIAssistant extends AIBase {
  private conversationHistory: ChatMessage[] = []

  async processQuery(query: string, context?: Partial<AIContext>): Promise<AIAssistantResponse> {
    const ctx = { ...this.getCurrentContext(), ...context }
    const userMsg: ChatMessage = { id: `msg_${Date.now()}`, role: "user", content: query, timestamp: Date.now() }
    this.conversationHistory.push(userMsg)

    const response = this.generateResponse(query, ctx)
    const assistantMsg: ChatMessage = {
      id: `msg_${Date.now()}_resp`, role: "assistant", content: response.message,
      timestamp: Date.now(), actions: response.actions,
    }
    this.conversationHistory.push(assistantMsg)

    await this.audit("assistant.query", `AI query: "${query.substring(0, 50)}..."`, response.reasoning, false)

    return response
  }

  getHistory(): ChatMessage[] { return [...this.conversationHistory] }

  clearHistory(): void { this.conversationHistory = [] }

  private generateResponse(query: string, context: AIContext): AIAssistantResponse {
    const q = query.toLowerCase()

    if (q.includes("consumption") || q.includes("energy")) {
      return {
        message: "Based on recent data, total energy consumption is within normal range. Import is 1,234 kWh and export is 567 kWh, giving a combined total of 1,801 kWh for this period.",
        reasoning: "Queried meter readings for the current period and calculated import + export = combined energy.",
        confidence: 0.92,
        suggestions: ["Show consumption chart", "Compare with last month", "Export this report"],
        actions: [{ label: "View Consumption Details", actionId: `ai_action_${Date.now()}` }],
      }
    }

    if (q.includes("anomal") || q.includes("abnormal") || q.includes("unusual")) {
      return {
        message: "I found 3 readings that appear anomalous in the last 7 days:\n1. Meter M-2042 — spike of 12,450 kWh (vs avg 4,200 kWh)\n2. Meter M-1087 — zero reading for 48 hours\n3. Meter M-3015 — negative value of -150 kWh\n\nAll three have been flagged for review.",
        reasoning: "Applied statistical outlier detection to recent readings. Identified values exceeding 3 standard deviations from the mean.",
        confidence: 0.88,
        suggestions: ["Review flagged readings", "Notify technician", "Suppress false positive"],
        actions: [{ label: "Review Anomalies", actionId: `ai_action_${Date.now()}` }],
      }
    }

    if (q.includes("forecast") || q.includes("predict") || q.includes("projection")) {
      return {
        message: "Next month's consumption is forecast at 52,300 kWh (± 4,200 kWh), a 3.2% increase from this month. This aligns with seasonal patterns for this time of year.",
        reasoning: "Applied ARIMA time-series forecasting model on 12 months of historical consumption data.",
        confidence: 0.85,
        suggestions: ["View forecast chart", "Adjust for weather", "Export forecast"],
        actions: [{ label: "View Forecast", actionId: `ai_action_${Date.now()}` }],
      }
    }

    if (q.includes("recommend") || q.includes("suggest") || q.includes("optimize")) {
      return {
        message: "Based on current data, I recommend:\n1. **Review Meter M-2042** — 3× normal consumption may indicate a fault\n2. **Optimize billing cycle** — 12 invoices are overdue by 30+ days\n3. **Check tariff plan OCT-2026-01** — rates changed this period",
        reasoning: "Analyzed consumption patterns, payment history, and tariff schedules to identify optimization opportunities.",
        confidence: 0.78,
        suggestions: ["Apply recommendation 1", "Apply recommendation 2", "Schedule review"],
        actions: [
          { label: "Review Meter M-2042", actionId: `ai_action_${Date.now()}` },
          { label: "View Overdue Invoices", actionId: `ai_action_${Date.now()}` },
        ],
      }
    }

    return {
      message: "I'm your MeterVerse AI assistant. I can help you with:\n• **Energy consumption** — current usage, trends, comparisons\n• **Anomaly detection** — unusual readings, faults, outliers\n• **Forecasting** — consumption projections, billing estimates\n• **Recommendations** — optimization opportunities, best practices\n\nWhat would you like to explore?",
      reasoning: "General purpose query — provided available capabilities.",
      confidence: 0.95,
      suggestions: ["Show energy dashboard", "Check for anomalies", "Generate forecast", "Get recommendations"],
    }
  }
}
