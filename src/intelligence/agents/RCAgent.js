// RCA Agent — Meter Root Cause Analysis
import { agentRuntime } from "../runtime/agent-engine/AgentRuntime.js"
import { modelRouter } from "../runtime/model-router/ModelRouter.js"
import { toolRegistry } from "../runtime/tool-registry/ToolRegistry.js"
import { auditService } from "../runtime/audit-service/AuditService.js"

const RCA_PROMPT = `You are a Meter Root Cause Analysis expert for a utility company.
Analyze the meter data provided and produce:
1. Executive Summary — What happened in plain language
2. Technical Analysis — Detailed breakdown of the issue
3. Evidence — Specific data points that support the analysis
4. 5 Whys — Five levels of root cause追问
5. 5W — Who, What, Where, When, Why
6. Root Cause — The single most likely root cause
7. Confidence Score — 0-100 based on available evidence
8. Recommended Action — What to do next

IMPORTANT RULES:
- Every conclusion must cite specific evidence
- If confidence is below 70, state "HUMAN REVIEW REQUIRED"
- Never invent data
- Base analysis ONLY on provided information`

export const rcaAgent = {
  id: "meter-rca",
  name: "Meter RCA Agent",
  async execute(input, context) {
    const startTime = Date.now()
    const { serial, issue } = input

    // Step 1: Gather evidence
    const meter = await toolRegistry.execute("lookup_meter", { serial })
    const similarIssues = await toolRegistry.execute("lookup_similar_issues", { errorPattern: issue || "", limit: 5 })

    const evidence = {
      meter: meter || { error: "Meter not found" },
      similarIssues: similarIssues || [],
      query: { serial, issue },
    }

    // Step 2: Run AI analysis
    const result = await modelRouter.analyze("llama-3.1-8b", RCA_PROMPT, evidence)

    const duration = Date.now() - startTime

    // Step 3: Audit
    auditService.record({
      agentId: "meter-rca",
      executionId: context.executionId,
      action: "analyze_meter",
      input: { serial, issue },
      output: result,
      duration,
      status: "completed",
      confidence: result.confidenceScore || 50,
    })

    return {
      agent: "meter-rca",
      serial,
      analysis: result,
      evidence,
      duration,
      timestamp: new Date().toISOString(),
    }
  },
}

// Register the agent
agentRuntime.registerAgent(rcaAgent)
