import { modelRouter } from "../../runtime/model-router/ModelRouter.js"
import logger from "../../../../backend/src/services/logger.js"
import { resolutionLearner } from "../learning/ResolutionLearner.js"

const RECOMMENDATION_PROMPT = `You are a utility metering operations expert. Given the root cause analysis and evidence, 
recommend specific, actionable resolution steps.

Produce valid JSON ONLY with exactly this structure:
{
  "primaryAction": "The single most important action to take",
  "steps": ["Step 1", "Step 2", "Step 3", ...],
  "alternatives": [{"action": "Alternative approach", "when": "When to use this instead"}],
  "preventiveMeasures": ["Measure 1", "Measure 2"],
  "priority": "immediate|high|medium|low",
  "estimatedEffort": "hours/days/weeks estimate",
  "requiresSiteVisit": true/false,
  "requiresPartReplacement": true/false
}

Base every recommendation on the evidence. Never suggest actions unsupported by data.`

class RecommendationEngine {
  async generate(rootCause, analysis, evidence, similarPatterns = []) {
    logger.info({ rootCause }, "RecommendationEngine: generating recommendations")
    const input = {
      rootCause,
      analysis: {
        fiveWhys: analysis.fiveWhys || [],
        fiveW: analysis.fiveW || {},
        confidence: analysis.confidence || 0,
      },
      evidence: {
        meter: evidence.meter ? { serial: evidence.meter.serial, type: evidence.meter.type, status: evidence.meter.status } : null,
        events: evidence.items?.filter(i => i.type === "events").flatMap(i => i.data) || [],
        readings: evidence.items?.filter(i => i.type === "readings").flatMap(i => i.data) || [],
      },
      similarPastResolutions: similarPatterns.map(p => ({
        issue: p.issue,
        rootCause: p.rootCause,
        resolution: p.resolution,
        effectiveness: p.effectiveness,
      })),
    }

    try {
      const response = await modelRouter.analyze("llama-3.1-8b", RECOMMENDATION_PROMPT, input)
      const content = response?.result?.response || response?.choices?.[0]?.message?.content || response?.response || JSON.stringify(response)
      const parsed = JSON.parse(content)
      return {
        primaryAction: parsed.primaryAction || "Manual investigation required",
        steps: parsed.steps || [],
        alternatives: parsed.alternatives || [],
        preventiveMeasures: parsed.preventiveMeasures || [],
        priority: parsed.priority || "medium",
        estimatedEffort: parsed.estimatedEffort || "Unknown",
        requiresSiteVisit: parsed.requiresSiteVisit || false,
        requiresPartReplacement: parsed.requiresPartReplacement || false,
        similarCasesUsed: similarPatterns.length,
      }
    } catch (err) {
      logger.error({ err }, "RecommendationEngine: AI failed, using pattern-based fallback")
      return this.fallback(rootCause, analysis, similarPatterns)
    }
  }

  fallback(rootCause, analysis, similarPatterns) {
    if (similarPatterns.length > 0) {
      const best = similarPatterns[0]
      return {
        primaryAction: best.resolution || "Apply known resolution from similar case",
        steps: [`Verify issue matches pattern from case: ${best.issue || "similar issue"}`, best.resolution ? `Apply: ${best.resolution}` : "Investigate further", "Confirm resolution effectiveness", "Document outcome"],
        alternatives: [],
        preventiveMeasures: best.preventiveMeasures || ["Monitor for recurrence"],
        priority: "high",
        estimatedEffort: best.effort || "1-2 hours",
        requiresSiteVisit: false,
        requiresPartReplacement: false,
        similarCasesUsed: similarPatterns.length,
      }
    }
    return {
      primaryAction: "Manual investigation and resolution required",
      steps: ["Review evidence and root cause analysis", "Determine if site visit is necessary", "Apply corrective action", "Verify meter恢复正常 operation", "Document resolution for future reference"],
      alternatives: [{"action": "Escalate to senior engineer", "when": "If root cause confidence is below 70%"}],
      preventiveMeasures: ["Schedule preventive maintenance", "Update monitoring thresholds if applicable"],
      priority: "medium",
      estimatedEffort: "2-4 hours",
      requiresSiteVisit: true,
      requiresPartReplacement: false,
      similarCasesUsed: 0,
    }
  }
}

export const recommendationEngine = new RecommendationEngine()
