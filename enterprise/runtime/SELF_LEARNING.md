# MeterVerse Self Learning Layer v4
**Generated:** 2026-07-14 | **Phase 04 — Enterprise AI Integration & Autonomous Orchestration**

## Purpose
The Self Learning Layer captures every execution, learns optimal tool combinations, identifies fastest and highest-quality paths, and feeds insights back into the AI Decision Engine to improve future decisions autonomously.

## Learning Pipeline

```
Execution History (from orchestrator)
  │
  ▼
┌───────────────────────────────────────────────────────────────┐
│ 1. EXECUTION RECORDER                                         │
│    Capture: task type, tools, duration, result, scores,       │
│    failures, retries, rollbacks                               │
└───────────────────────────────────────────────────────────────┘
  │
  ▼
┌───────────────────────────────────────────────────────────────┐
│ 2. PATTERN ANALYZER                                           │
│    Identify: fastest chains, highest-quality chains,           │
│    most common failures, optimal tool orderings                │
└───────────────────────────────────────────────────────────────┘
  │
  ▼
┌───────────────────────────────────────────────────────────────┐
│ 3. INSIGHT GENERATOR                                          │
│    Generate: recommendations, warnings, optimizations          │
│    Score each insight by confidence level                     │
└───────────────────────────────────────────────────────────────┘
  │
  ▼
┌───────────────────────────────────────────────────────────────┐
│ 4. FEEDBACK LOOP                                              │
│    Update TOOL_DECISION_ENGINE.md with learned weights         │
│    Update TOOL_INTELLIGENCE_LAYER.json with adjusted scores    │
│    Store insights in ENTERPRISE_MEMORY.json                   │
└───────────────────────────────────────────────────────────────┘
  │
  ▼
OUTPUT: Learning Report + Updated Intelligence + Memory
```

## Execution Recorder

### Recorded Data Per Execution
```json
{
  "execution_id": "EXEC-20260714-001",
  "decision_id": "DEC-20260714-001",
  "task_type": "BACKEND",
  "chain_id": "CHAIN-API-GEN",
  "risk_level": "MEDIUM",
  "timestamp": "2026-07-14T05:00:00Z",
  "tools": [
    {
      "name": "TypeScript",
      "duration_ms": 4500,
      "exit_code": 0,
      "retries": 0,
      "status": "SUCCESS",
      "mcp_routed": false
    },
    {
      "name": "ESLint",
      "duration_ms": 3200,
      "exit_code": 0,
      "retries": 0,
      "status": "SUCCESS",
      "mcp_routed": false
    },
    {
      "name": "Spectral",
      "duration_ms": 1800,
      "exit_code": 0,
      "retries": 0,
      "status": "SUCCESS",
      "mcp_routed": false
    },
    {
      "name": "Playwright",
      "duration_ms": 28500,
      "exit_code": 0,
      "retries": 0,
      "status": "SUCCESS",
      "mcp_routed": true
    }
  ],
  "total_duration_ms": 38000,
  "validation": {
    "overall_status": "PASS",
    "pass_rate": 100,
    "blockers": 0,
    "warnings": 1
  },
  "certification": {
    "overall_score": 87.5,
    "level": "CERTIFIED"
  },
  "rollback_triggered": false,
  "errors": []
}
```

### Storage
```
Store: enterprise/runtime/learning/history/{date}/execution-{execution_id}.json
Index: enterprise/runtime/learning/execution-index.json (summary for fast lookup)
Retention: 90 days of execution history
```

## Pattern Analyzer

### Analysis Queries

#### Fastest Chain Per Task Type
```sql
-- Pseudocode: Find the fastest execution for each chain_id
SELECT chain_id, MIN(total_duration_ms) as fastest_time,
       ARRAY_AGG(tools ORDER BY tool_order) as tool_chain
FROM execution_history
WHERE status = 'SUCCESS'
GROUP BY chain_id
ORDER BY fastest_time ASC
```

#### Highest Quality Chain Per Task Type
```sql
-- Pseudocode: Find highest certification score for each chain_id
SELECT chain_id, MAX(certification_score) as best_score,
       ARRAY_AGG(tools ORDER BY tool_order) as tool_chain
FROM execution_history
WHERE status = 'SUCCESS'
GROUP BY chain_id
ORDER BY best_score DESC
```

#### Most Common Failures
```sql
-- Pseudocode: Find tools that fail most often
SELECT tool, COUNT(*) as failure_count,
       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as failure_rate
FROM execution_history, UNNEST(tools) as tool
WHERE status = 'FAIL'
GROUP BY tool
ORDER BY failure_count DESC
```

### Analysis Results Schema
```json
{
  "analysis_id": "ANALYSIS-20260714-001",
  "generated": "2026-07-14T06:00:00Z",
  "executions_analyzed": 42,
  "period": "2026-07-12T00:00:00Z to 2026-07-14T06:00:00Z",
  "fastest_chains": [
    {
      "chain_id": "CHAIN-CODE",
      "fastest_time_ms": 8500,
      "average_time_ms": 12000,
      "tool_chain": ["TypeScript", "ESLint", "Prettier"],
      "execution_id": "EXEC-20260713-015"
    },
    {
      "chain_id": "CHAIN-SEC",
      "fastest_time_ms": 42000,
      "average_time_ms": 55000,
      "tool_chain": ["Semgrep", "Snyk", "Trivy", "Gitleaks"],
      "execution_id": "EXEC-20260713-008"
    }
  ],
  "highest_quality_chains": [
    {
      "chain_id": "CHAIN-API-GEN",
      "best_score": 95,
      "average_score": 87.5,
      "tool_chain": ["Prisma", "TypeScript", "ESLint", "Spectral", "OpenAPIGenerator", "SwaggerCLI", "TypeDoc", "Playwright"],
      "execution_id": "EXEC-20260713-022"
    }
  ],
  "most_common_failures": [
    {
      "tool": "Snyk",
      "failure_count": 5,
      "failure_rate": 11.9,
      "common_errors": ["API rate limit", "Network timeout"],
      "recommendation": "Increase timeout, add retry with longer delay"
    },
    {
      "tool": "Playwright",
      "failure_count": 3,
      "failure_rate": 7.1,
      "common_errors": ["Timeout waiting for selector", "Browser crash"],
      "recommendation": "Increase default timeout to 30s"
    }
  ],
  "tool_combination_insights": [
    {
      "tools": ["TypeScript", "ESLint"],
      "average_duration_ms": 7700,
      "pass_rate": 100,
      "recommendation": "Always run together (recommended ordering)"
    },
    {
      "tools": ["Semgrep", "Snyk"],
      "average_duration_ms": 18000,
      "pass_rate": 85,
      "recommendation": "Run in parallel (no dependency)"
    }
  ]
}
```

## Insight Generator

### Insight Types
| Type | Confidence | Action |
|------|-----------|--------|
| SPEED_OPTIMIZATION | HIGH | Reorder tools for faster execution |
| QUALITY_IMPROVEMENT | HIGH | Add missing quality gates |
| FAILURE_PATTERN | MEDIUM | Adjust retry strategy or timeouts |
| TOOL_REPLACEMENT | LOW | Suggest alternative tool with better metrics |
| GATE_ADJUSTMENT | MEDIUM | Tighten or relax validation thresholds |
| PARALLEL_OPPORTUNITY | HIGH | Convert serial steps to parallel |

### Insight Generation Rules
```
For each chain with >= 5 executions:
  1. Calculate p50, p90, p99 duration
  2. If p90 > 2x p50 → flag for optimization (variance too high)
  3. If pass rate < 90% → flag for investigation
  4. If any tool fails > 10% of time → flag for retry/fallback review
  5. If two tools always run sequentially with no dependency → suggest parallelism

For each task type with >= 3 executions:
  1. Compare highest vs lowest scoring chains
  2. Identify tools present in high-scoring but missing from low-scoring
  3. Suggest adding missing tools to low-scoring chains

For each tool with >= 10 executions:
  1. Track duration trend (is it getting slower?)
  2. Track accuracy trend (is it finding more/less issues?)
  3. If duration increasing > 20% week-over-week → flag for investigation
```

### Insight Output Schema
```json
{
  "insight_id": "INSIGHT-20260714-001",
  "type": "SPEED_OPTIMIZATION",
  "confidence": "HIGH",
  "description": "CHAIN-SEC tools Semgrep and Snyk have no dependency and can run in parallel, saving ~18s",
  "impact": {
    "estimated_time_saved_ms": 18000,
    "affected_chain": "CHAIN-SEC",
    "improvement_percentage": 35
  },
  "recommendation": "Update TOOL_SELECTION_ENGINE.md CHAIN-SEC parallel_groups to include Semgrep+Snyk together",
  "related_executions": ["EXEC-20260713-008", "EXEC-20260713-012", "EXEC-20260714-001"]
}
```

## Feedback Loop

### Score Adjustment Algorithm
```
For each tool in TOOL_INTELLIGENCE_LAYER.json:
  new_speed = weighted_average(
    base_speed (weight 0.6),
    observed_speed_percentile (weight 0.4)
  )
  new_accuracy = weighted_average(
    base_accuracy (weight 0.5),
    observed_pass_rate (weight 0.5)
  )
  new_confidence = weighted_average(
    base_confidence (weight 0.7),
    observed_reliability (weight 0.3)
  )

Where:
  observed_speed_percentile = percentile rank among all tools (0-100)
  observed_pass_rate = (successful_executions / total_executions) * 100
  observed_reliability = (1 - retry_rate) * 100
```

### Threshold Adjustment Algorithm
```
For each domain gate in VALIDATION_ENGINE.md:
  If gate pass rate > 98% for 30+ executions:
    Consider tightening threshold (raise bar)
  If gate pass rate < 70% for 10+ executions:
    Consider relaxing threshold (temporary) or fixing underlying issues
  Threshold changes require Chief Architect approval
```

### Feedback Integration Points
| System | What Gets Updated | How |
|--------|------------------|-----|
| TOOL_DECISION_ENGINE.md | Risk scores, role mappings, chain selections | Updated weights file |
| TOOL_INTELLIGENCE_LAYER.json | Speed, accuracy, confidence scores | Score adjustment algorithm |
| TOOL_SELECTION_ENGINE.md | Parallel groups, chain ordering | Reorder recommendations |
| VALIDATION_ENGINE.md | Domain thresholds | Threshold adjustment algorithm |
| ENTERPRISE_MEMORY.json | Decision history, lessons learned | Insight storage |

## Learning Database Schema

### Execution Index (execution-index.json)
```json
{
  "version": "1.0.0",
  "generated": "2026-07-14T06:00:00Z",
  "total_executions": 42,
  "executions": [
    {
      "execution_id": "EXEC-20260714-001",
      "decision_id": "DEC-20260714-001",
      "task_type": "BACKEND",
      "chain_id": "CHAIN-API-GEN",
      "timestamp": "2026-07-14T05:00:00Z",
      "total_duration_ms": 38000,
      "status": "SUCCESS",
      "certification_score": 87.5,
      "has_report": true
    }
  ]
}
```

### Learned Weights (learned-weights.json)
```json
{
  "version": "1.0.0",
  "generated": "2026-07-14T06:00:00Z",
  "chain_weights": {
    "CHAIN-API-GEN": {
      "tool_order_score": 0.85,
      "parallel_efficiency": 0.75,
      "quality_score": 0.92,
      "recommended_tools": ["Prisma", "TypeScript", "ESLint", "Spectral"],
      "optional_tools": ["OpenAPIGenerator", "SwaggerCLI"],
      "avoid_when": ["no_api_change"]
    },
    "CHAIN-SEC": {
      "tool_order_score": 0.80,
      "parallel_efficiency": 0.90,
      "quality_score": 0.88,
      "recommended_tools": ["Semgrep", "Snyk", "Trivy", "Gitleaks"],
      "optional_tools": ["Checkov", "TruffleHog"],
      "avoid_when": []
    }
  },
  "domain_thresholds": {
    "code_quality": { "pass_rate_threshold": 100, "adjusted_from": 100, "adjusted_date": null },
    "security": { "pass_rate_threshold": 100, "adjusted_from": 100, "adjusted_date": null },
    "documentation": { "pass_rate_threshold": 80, "adjusted_from": 100, "adjusted_date": "2026-07-14" }
  }
}
```

## Integration Contract

### Input
```
execution_report: JSON from RUNTIME_ORCHESTRATOR.md Output Schema
```

### Output
```
LearningReport: {
  analysis_id: string,
  insights: [Insight],
  score_adjustments: [{ tool: string, speed: number, accuracy: number, confidence: number }],
  threshold_adjustments: [{ domain: string, old_threshold: number, new_threshold: number }],
  storage_paths: {
    execution_record: string,
    analysis: string,
    insights: string,
    weights: string
  }
}
```

### Self-Learning Maturity Model
| Level | State | Criteria |
|-------|-------|----------|
| 1 | RECORDING | All executions recorded, no analysis |
| 2 | ANALYZING | Patterns identified, basic insights generated |
| 3 | ADAPTING | Scores and thresholds adjusted automatically |
| 4 | OPTIMIZING | Tool chains reordered for optimal speed/quality |
| 5 | AUTONOMOUS | Full self-optimization without human intervention |

Current Level: **2 (ANALYZING)** — targeting Level 4 by end of Phase 04.
