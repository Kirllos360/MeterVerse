import { modelRouter } from "../../runtime/model-router/ModelRouter.js"
import logger from "../../../../backend/src/services/logger.js"

const FIVE_WHYS_PROMPT = `You are a Root Cause Analysis expert for a utility metering company.
Given the issue description and evidence, generate a structured 5-Whys analysis.

Produce valid JSON ONLY with exactly these fields:
{
  "fiveWhys": ["Why 1: ... because ...", "Why 2: ... because ...", "Why 3: ... because ...", "Why 4: ... because ...", "Why 5: ... because ..."],
  "fiveW": { "who": "Who is affected", "what": "What happened", "when": "When it occurred", "where": "Where it occurred", "why": "Why it matters" },
  "rootCause": "The single most likely root cause in one sentence",
  "confidence": 0-100 based on evidence completeness,
  "summary": "One-paragraph executive summary of the issue and root cause"
}

Rules:
- Each Why must logically lead to the next
- Base every claim on specific evidence provided
- If evidence is insufficient, set confidence < 50 and note gaps
- Never invent data or make assumptions without evidence`

class FiveWhysEngine {
  async generate(issue, evidence) {
    logger.info({ issue }, "FiveWhysEngine: generating analysis")
    const input = {
      issue,
      evidence: {
        meter: evidence.meter ? { serial: evidence.meter.serial, type: evidence.meter.type, status: evidence.meter.status, area: evidence.meter.area, customer: evidence.meter.customer } : null,
        readings: evidence.items?.filter(i => i.type === "readings").flatMap(i => i.data) || [],
        events: evidence.items?.filter(i => i.type === "events").flatMap(i => i.data) || [],
        sims: evidence.items?.filter(i => i.type === "sims").flatMap(i => i.data) || [],
        assignments: evidence.items?.filter(i => i.type === "assignments").flatMap(i => i.data) || [],
        missing: evidence.missing || [],
        confidence: evidence.confidence || 0,
      },
    }

    try {
      const response = await modelRouter.analyze("llama-3.1-8b", FIVE_WHYS_PROMPT, input)
      const content = response?.result?.response || response?.choices?.[0]?.message?.content || response?.response || JSON.stringify(response)
      const parsed = JSON.parse(content)
      return {
        fiveWhys: parsed.fiveWhys || [],
        fiveW: parsed.fiveW || { who: "", what: "", when: "", where: "", why: "" },
        rootCause: parsed.rootCause || "Unable to determine root cause",
        confidence: parsed.confidence || Math.min(evidence.confidence || 50, 80),
        summary: parsed.summary || "",
      }
    } catch (err) {
      logger.error({ err, issue }, "FiveWhysEngine: AI analysis failed, using fallback")
      return this.fallback(issue, evidence)
    }
  }

  fallback(issue, evidence) {
    const eventCount = evidence.items?.filter(i => i.type === "events").flatMap(i => i.data).length || 0
    const readingCount = evidence.items?.filter(i => i.type === "readings").flatMap(i => i.data).length || 0
    return {
      fiveWhys: [
        `Why 1: The issue "${issue}" was observed because of abnormal meter behavior`,
        `Why 2: The meter showed abnormal behavior due to environmental or operational factors`,
        `Why 3: These factors affected the meter's communication or measurement module`,
        `Why 4: The module degraded because of accumulated stress or external interference`,
        `Why 5: The root cause is likely a systemic issue in meter deployment or maintenance that allowed this stress to accumulate unchecked`,
      ],
      fiveW: {
        who: evidence.meter?.customer || "Unknown customer",
        what: issue || "Meter anomaly detected",
        when: new Date().toISOString(),
        where: `Meter ${evidence.meter?.serial || "unknown"} in ${evidence.meter?.area || "unknown area"}`,
        why: "Potential operational or environmental impact on metering accuracy",
      },
      rootCause: `Degradation of meter performance due to ${eventCount > 0 ? "repeated events" : "operational factors"} (${readingCount > 0 ? readingCount + " readings analyzed" : "no recent readings"})`,
      confidence: Math.min(30 + eventCount * 5 + readingCount * 3, 65),
      summary: `Analysis of meter ${evidence.meter?.serial || "unknown"} identified issue "${issue}" with ${eventCount} events and ${readingCount} readings available. Limited evidence reduces confidence. Human review required.`,
    }
  }
}

export const fiveWhysEngine = new FiveWhysEngine()
