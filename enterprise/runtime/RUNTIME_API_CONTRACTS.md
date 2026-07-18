# MeterVerse Runtime API Contracts v4
**Generated:** 2026-07-14 | **Phase 04 — Enterprise AI Integration & Autonomous Orchestration**

## Purpose
Defines 10 internal API contracts for the MeterVerse Enterprise AI runtime. These contracts standardize communication between all runtime components — Tool, Execution, Certification, Validation, Knowledge, Memory, Planning, Decision, Monitoring, and Automation.

## API Overview

| # | API | Endpoint Prefix | Version | Purpose |
|---|-----|----------------|---------|---------|
| 1 | Tool API | `/api/v1/tool` | 1.0.0 | Register, query, verify tools |
| 2 | Execution API | `/api/v1/execution` | 1.0.0 | Submit, monitor, manage executions |
| 3 | Certification API | `/api/v1/certification` | 1.0.0 | Run and query certifications |
| 4 | Validation API | `/api/v1/validation` | 1.0.0 | Validate tool outputs against gates |
| 5 | Knowledge API | `/api/v1/knowledge` | 1.0.0 | Query and update knowledge graph |
| 6 | Memory API | `/api/v1/memory` | 1.0.0 | Store and retrieve enterprise memory |
| 7 | Planning API | `/api/v1/planning` | 1.0.0 | Classify, plan, and estimate tasks |
| 8 | Decision API | `/api/v1/decision` | 1.0.0 | Make autonomous decisions |
| 9 | Monitoring API | `/api/v1/monitoring` | 1.0.0 | System health, metrics, alerts |
| 10 | Automation API | `/api/v1/automation` | 1.0.0 | Automated workflows and triggers |

---

## 1. Tool API

### GET /api/v1/tool/registry
Returns the complete tool registry.

**Response 200:**
```json
{
  "version": "4.0.0",
  "total_tools": 110,
  "tools": [
    {
      "name": "TypeScript",
      "version": "5.8",
      "status": "CERTIFIED",
      "category": "compile",
      "verification": "npx tsc --version",
      "last_verified": "2026-07-14T04:00:00Z"
    }
  ]
}
```

### GET /api/v1/tool/{name}
Returns intelligence data for a specific tool.

**Response 200:**
```json
{
  "name": "TypeScript",
  "purpose": "Type checking",
  "owner": "Backend/Frontend Engineer",
  "category": "compile",
  "priority": 1,
  "scores": {
    "cost": 1,
    "speed": 85,
    "accuracy": 99,
    "ai_confidence": 100,
    "quality": 95,
    "enterprise": 100,
    "risk": 5,
    "runtime": 100
  },
  "fallbacks": [],
  "parallel": false,
  "mcp": false,
  "validation": "npx tsc --version"
}
```

### POST /api/v1/tool/verify
Verifies a tool is operational.

**Request:**
```json
{
  "name": "TypeScript",
  "validation_command": "npx tsc --version"
}
```

**Response 200:**
```json
{
  "name": "TypeScript",
  "verified": true,
  "version": "5.8.2",
  "timestamp": "2026-07-14T05:00:00Z"
}
```

**Response 503 (tool not found):**
```json
{
  "name": "TypeScript",
  "verified": false,
  "error": "Command not found: npx tsc --version",
  "timestamp": "2026-07-14T05:00:00Z"
}
```

---

## 2. Execution API

### POST /api/v1/execution/submit
Submit a task for execution.

**Request:**
```json
{
  "task": "Create a new billing API endpoint",
  "context": {
    "branch": "feature/billing-api",
    "environment": "development"
  },
  "options": {
    "priority": "MEDIUM",
    "auto_execute": true,
    "notify_on_complete": false
  }
}
```

**Response 202:**
```json
{
  "task_id": "TASK-20260714-001",
  "status": "QUEUED",
  "priority": 50,
  "queue_position": 1,
  "estimated_duration": "25m",
  "decision": {
    "decision_id": "DEC-20260714-001",
    "chain_id": "CHAIN-API-GEN",
    "risk_level": "MEDIUM"
  },
  "endpoints": {
    "status": "/api/v1/execution/status/TASK-20260714-001",
    "cancel": "/api/v1/execution/cancel/TASK-20260714-001",
    "logs": "/api/v1/execution/logs/TASK-20260714-001"
  }
}
```

### GET /api/v1/execution/status/{task_id}
Returns task execution status.

**Response 200:**
```json
{
  "task_id": "TASK-20260714-001",
  "status": "RUNNING",
  "progress": {
    "tools_total": 8,
    "tools_completed": 3,
    "tools_running": 1,
    "tools_pending": 4,
    "percent_complete": 37.5
  },
  "current_tool": "Spectral",
  "started_at": "2026-07-14T05:01:00Z",
  "estimated_completion": "2026-07-14T05:26:00Z",
  "elapsed_seconds": 120
}
```

### POST /api/v1/execution/cancel/{task_id}
Cancel a running or queued task.

**Response 200:**
```json
{
  "task_id": "TASK-20260714-001",
  "status": "CANCELLED",
  "rolled_back": true,
  "completed_tools": 2,
  "rolled_back_tools": 2,
  "message": "Task cancelled by user request"
}
```

### POST /api/v1/execution/pause/{task_id}
Pause a running task.

**Response 200:**
```json
{
  "task_id": "TASK-20260714-001",
  "status": "HALTED",
  "paused_at_tool": "Spectral",
  "can_resume": true
}
```

### POST /api/v1/execution/resume/{task_id}
Resume a paused task.

**Response 200:**
```json
{
  "task_id": "TASK-20260714-001",
  "status": "RUNNING",
  "resuming_at_tool": "Spectral",
  "progress": { "tools_completed": 3, "tools_remaining": 5 }
}
```

### GET /api/v1/execution/logs/{task_id}
Returns execution logs.

**Response 200:**
```json
{
  "task_id": "TASK-20260714-001",
  "logs": [
    {
      "timestamp": "2026-07-14T05:01:00Z",
      "level": "INFO",
      "tool": "ORCHESTRATOR",
      "message": "Task submitted, decision created: DEC-20260714-001"
    },
    {
      "timestamp": "2026-07-14T05:01:05Z",
      "level": "INFO",
      "tool": "TypeScript",
      "message": "Starting: npx tsc --noEmit"
    },
    {
      "timestamp": "2026-07-14T05:01:10Z",
      "level": "INFO",
      "tool": "TypeScript",
      "message": "Completed: 0 errors, exit code 0"
    },
    {
      "timestamp": "2026-07-14T05:01:15Z",
      "level": "WARN",
      "tool": "ESLint",
      "message": "Completed: 0 errors, 2 warnings"
    },
    {
      "timestamp": "2026-07-14T05:03:00Z",
      "level": "INFO",
      "tool": "ORCHESTRATOR",
      "message": "All tools completed. Generating report..."
    }
  ]
}
```

### GET /api/v1/execution/queue
Returns the current execution queue.

**Response 200:**
```json
{
  "queue_depth": 2,
  "max_depth": 10,
  "items": [
    {
      "task_id": "TASK-20260714-001",
      "priority": 50,
      "status": "RUNNING",
      "submitted_at": "2026-07-14T05:00:00Z"
    },
    {
      "task_id": "TASK-20260714-002",
      "priority": 75,
      "status": "QUEUED",
      "submitted_at": "2026-07-14T05:02:00Z"
    }
  ]
}
```

---

## 3. Certification API

### POST /api/v1/certification/run
Run a certification check.

**Request:**
```json
{
  "chain_id": "CHAIN-CODE",
  "dimensions": ["code_quality", "architecture", "testing"],
  "options": {
    "detailed": true,
    "generate_report": true
  }
}
```

**Response 200:**
```json
{
  "certification_id": "CERT-20260714-001",
  "overall_score": 87.5,
  "level": "CERTIFIED",
  "dimensions": {
    "code_quality": { "score": 95, "threshold": 80, "status": "PASS" },
    "architecture": { "score": 90, "threshold": 80, "status": "PASS" },
    "testing": { "score": 85, "threshold": 80, "status": "PASS" },
    "security": { "score": null, "threshold": 80, "status": "SKIPPED" }
  },
  "report_url": "/api/v1/certification/report/CERT-20260714-001"
}
```

### GET /api/v1/certification/status
Returns current certification status.

**Response 200:**
```json
{
  "last_certification": "2026-07-14T04:00:00Z",
  "overall_score": 92.4,
  "level": "QUALIFIED",
  "history": [
    { "phase": "Phase 01", "score": 89, "level": "QUALIFIED" },
    { "phase": "Phase 02", "score": 87.5, "level": "QUALIFIED" },
    { "phase": "Phase 03", "score": null, "level": "IN_PROGRESS" },
    { "phase": "Phase 04", "score": 92.4, "level": "HEALTHY" }
  ]
}
```

### GET /api/v1/certification/report/{cert_id}
Returns a certification report.

**Response 200:**
```json
{
  "certification_id": "CERT-20260714-001",
  "generated": "2026-07-14T05:00:00Z",
  "overall_score": 87.5,
  "level": "CERTIFIED",
  "dimension_scores": [
    { "dimension": "architecture", "score": 90, "weight": 15, "weighted": 13.5 },
    { "dimension": "security", "score": 85, "weight": 15, "weighted": 12.75 },
    { "dimension": "performance", "score": 80, "weight": 15, "weighted": 12.0 },
    { "dimension": "testing", "score": 90, "weight": 15, "weighted": 13.5 },
    { "dimension": "accessibility", "score": 85, "weight": 10, "weighted": 8.5 },
    { "dimension": "maintainability", "score": 90, "weight": 10, "weighted": 9.0 },
    { "dimension": "documentation", "score": 85, "weight": 10, "weighted": 8.5 },
    { "dimension": "enterprise", "score": 90, "weight": 10, "weighted": 9.0 }
  ],
  "recommendations": [
    "Improve performance score: run Lighthouse audit, optimize bundle",
    "Improve accessibility score: run Pa11y, fix contrast issues"
  ]
}
```

---

## 4. Validation API

### POST /api/v1/validation/run
Run validation against tool execution results.

**Request:**
```json
{
  "tool_results": [
    {
      "tool": "TypeScript",
      "exit_code": 0,
      "stdout": "0 errors",
      "stderr": ""
    },
    {
      "tool": "ESLint",
      "exit_code": 0,
      "stdout": "0 errors, 2 warnings",
      "stderr": ""
    }
  ],
  "chain_id": "CHAIN-CODE"
}
```

**Response 200:**
```json
{
  "report_id": "VAL-20260714-001",
  "overall": {
    "status": "PASS",
    "pass_rate": 100,
    "domains_passed": 2,
    "domains_total": 2,
    "blockers": 0
  },
  "domains": [
    {
      "domain": "code_quality",
      "status": "PASS",
      "severity": "BLOCKER",
      "pass_rate": 100,
      "gates": [
        { "tool": "TypeScript", "status": "PASS", "details": "0 errors" },
        { "tool": "ESLint", "status": "PASS", "details": "0 errors, 2 warnings" }
      ]
    }
  ]
}
```

### POST /api/v1/validation/gates
Returns defined validation gates for a domain or chain.

**Request:**
```json
{ "domain": "security" }
```

**Response 200:**
```json
{
  "domain": "security",
  "severity": "BLOCKER",
  "gates": [
    { "tool": "Semgrep", "command": "semgrep --config=auto .", "pass_criteria": "0 findings" },
    { "tool": "Snyk", "command": "snyk test", "pass_criteria": "0 high/critical" },
    { "tool": "Trivy", "command": "trivy fs --severity CRITICAL,HIGH .", "pass_criteria": "0 critical/high" },
    { "tool": "Checkov", "command": "checkov -d .", "pass_criteria": "0 failed" },
    { "tool": "Gitleaks", "command": "gitleaks detect", "pass_criteria": "0 secrets" },
    { "tool": "TruffleHog", "command": "trufflehog filesystem . --only-verified", "pass_criteria": "0 secrets" },
    { "tool": "npm audit", "command": "npm audit", "pass_criteria": "0 critical/high" }
  ]
}
```

---

## 5. Knowledge API

### GET /api/v1/knowledge/graph
Returns the knowledge graph.

**Response 200:**
```json
{
  "version": "4.0.0",
  "graphs": {
    "project": { "node_count": 42, "edge_count": 86 },
    "dependencies": { "node_count": 156, "edge_count": 312 },
    "api": { "node_count": 28, "edge_count": 45 },
    "database": { "node_count": 15, "edge_count": 22 },
    "ui": { "node_count": 33, "edge_count": 51 },
    "workflows": { "node_count": 12, "edge_count": 18 }
  },
  "documentation": "KNOWLEDGE_GRAPH_v3.md"
}
```

### GET /api/v1/knowledge/query
Query the knowledge graph.

**Request:**
```json
{
  "query": "What components depend on the billing module?",
  "type": "dependencies",
  "max_results": 10
}
```

**Response 200:**
```json
{
  "query": "billing module dependencies",
  "results": [
    { "source": "BillingController", "target": "BillingService", "relation": "depends_on" },
    { "source": "BillingService", "target": "InvoiceModel", "relation": "depends_on" },
    { "source": "BillingService", "target": "PaymentGateway", "relation": "depends_on" },
    { "source": "BillingModule", "target": "BillingController", "relation": "contains" }
  ],
  "total_results": 4
}
```

---

## 6. Memory API

### GET /api/v1/memory/decisions
Returns decision history.

**Response 200:**
```json
{
  "total_decisions": 11,
  "decisions": [
    {
      "id": "ADR-001",
      "title": "Initial toolchain selection",
      "phase": "Phase 01",
      "date": "2026-07-12",
      "impact": "Selected 18 engineering tools"
    }
  ]
}
```

### POST /api/v1/memory/store
Store a new memory entry.

**Request:**
```json
{
  "type": "decision",
  "data": {
    "id": "ADR-012",
    "phase": "Phase 04",
    "title": "Decision Engine architecture",
    "date": "2026-07-14",
    "impact": "Created autonomous decision pipeline with 9 rules"
  }
}
```

**Response 201:**
```json
{
  "stored": true,
  "memory_id": "MEM-20260714-001",
  "type": "decision",
  "timestamp": "2026-07-14T05:00:00Z"
}
```

### GET /api/v1/memory/search
Search memory entries.

**Request:**
```json
{
  "query": "toolchain installation",
  "type": "installation",
  "max_results": 5
}
```

**Response 200:**
```json
{
  "query": "toolchain installation",
  "results": [
    {
      "id": "MEM-20260712-001",
      "type": "installation",
      "date": "2026-07-12",
      "summary": "Installed 22 tools: ast-grep, ripgrep, jscodeshift, log4brains, adr, ...",
      "phase": "Phase 01"
    },
    {
      "id": "MEM-20260714-002",
      "type": "installation",
      "date": "2026-07-14",
      "summary": "Installed 5 MCP servers, mkdocs, gitleaks. Confirmed semgrep, trufflehog, mermaid-cli, k6",
      "phase": "Phase 03"
    }
  ],
  "total_results": 2
}
```

---

## 7. Planning API

### POST /api/v1/planning/classify
Classify a task and generate a plan.

**Request:**
```json
{
  "task": "Implement user authentication with JWT",
  "context": {
    "branch": "feature/auth",
    "environment": "development"
  }
}
```

**Response 200:**
```json
{
  "plan_id": "PLAN-20260714-001",
  "classification": "BACKEND",
  "risk_level": "CRITICAL",
  "risk_score": 85,
  "reasoning": "Auth changes involve JWT secret management, user data, and security-critical code",
  "chain_id": "CHAIN-CODE",
  "estimated_duration": "45m",
  "steps": [
    { "order": 1, "type": "ARCHITECTURE", "tools": ["DependencyCruiser", "Madge"], "estimated": "3m" },
    { "order": 2, "type": "CODE", "tools": ["TypeScript", "ESLint", "Prettier"], "estimated": "5m" },
    { "order": 3, "type": "SECURITY", "tools": ["Semgrep", "Snyk", "Gitleaks"], "estimated": "10m" },
    { "order": 4, "type": "TESTING", "tools": ["Playwright", "Jest"], "estimated": "15m" },
    { "order": 5, "type": "VALIDATION", "tools": ["Spectral"], "estimated": "2m" },
    { "order": 6, "type": "CERTIFICATION", "tools": [], "estimated": "5m" },
    { "order": 7, "type": "DOCUMENTATION", "tools": ["ADR", "MkDocs"], "estimated": "5m" }
  ],
  "documentation": {
    "adr_needed": true,
    "api_docs_needed": true,
    "changelog_needed": true
  },
  "recommendations": [
    "Add ADR-012 for JWT authentication strategy",
    "Use Passport JWT strategy (consistent with existing codebase)",
    "Store JWT secret in environment variable, never in code"
  ]
}
```

---

## 8. Decision API

### POST /api/v1/decision/make
Make an autonomous decision for a task.

**Request:**
```json
{
  "task": "Add rate limiting to billing API",
  "context": {
    "existing_patterns": ["nestjs-rate-limiter"],
    "constraints": ["must support distributed rate limiting"]
  }
}
```

**Response 200:**
```json
{
  "decision_id": "DEC-20260714-002",
  "timestamp": "2026-07-14T05:00:00Z",
  "task": {
    "description": "Add rate limiting to billing API",
    "classification": "BACKEND",
    "risk_level": "MEDIUM",
    "chain_id": "CHAIN-API-GEN"
  },
  "roles": {
    "primary": "Backend Engineer",
    "secondary": [],
    "supervisor": null
  },
  "tool_chain": {
    "selected": ["TypeScript", "ESLint", "Prettier", "DependencyCruiser", "Madge", "Spectral", "Playwright", "Snyk"],
    "parallel_groups": [
      ["TypeScript", "DependencyCruiser"],
      ["ESLint", "Madge", "Snyk"],
      ["Prettier", "Spectral"],
      ["Playwright"]
    ]
  },
  "validation": {
    "gates": ["code_quality", "architecture", "api", "testing"],
    "expected_pass_rate": 100
  },
  "certification": {
    "expected_overall": 87.5,
    "expected_level": "CERTIFIED"
  },
  "auto_execute": true
}
```

### GET /api/v1/decision/history
Returns recent decisions.

**Response 200:**
```json
{
  "total_decisions": 1,
  "decisions": [
    {
      "decision_id": "DEC-20260714-001",
      "task": "Create billing API endpoint",
      "classification": "BACKEND",
      "risk_level": "MEDIUM",
      "timestamp": "2026-07-14T05:00:00Z",
      "executed": false
    }
  ]
}
```

---

## 9. Monitoring API

### GET /api/v1/monitoring/health
Returns system health status.

**Response 200:**
```json
{
  "status": "HEALTHY",
  "overall_score": 92.4,
  "components": {
    "orchestrator": { "status": "ONLINE", "score": 100 },
    "decision_engine": { "status": "ONLINE", "score": 100 },
    "validation_engine": { "status": "ONLINE", "score": 100 },
    "self_learning": { "status": "ONLINE", "score": 60 },
    "master_registry": { "status": "ONLINE", "score": 95 },
    "enterprise_memory": { "status": "ONLINE", "score": 90 }
  },
  "last_checked": "2026-07-14T05:00:00Z"
}
```

### GET /api/v1/monitoring/metrics
Returns system metrics.

**Response 200:**
```json
{
  "executions": { "total": 0, "today": 0, "success_rate": null },
  "queue": { "depth": 0, "max_depth": 10, "utilization_percent": 0 },
  "tools": { "certified": 105, "missing": 5, "coverage_percent": 95.5 },
  "performance": {
    "average_execution_time_ms": null,
    "p50_duration_ms": null,
    "p95_duration_ms": null
  },
  "learning": {
    "total_insights": 0,
    "maturity_level": 2,
    "executions_analyzed": 0
  }
}
```

### GET /api/v1/monitoring/alerts
Returns active alerts.

**Response 200:**
```json
{
  "total_alerts": 3,
  "alerts": [
    {
      "severity": "WARN",
      "message": "Phase 03 certification still IN_PROGRESS",
      "domain": "certification",
      "timestamp": "2026-07-14T05:00:00Z",
      "acknowledged": false
    },
    {
      "severity": "INFO",
      "message": "5 tools still MISSING: bundle-wizard, ts-prune, log4brains, redocly, bruno",
      "domain": "tooling",
      "timestamp": "2026-07-14T04:00:00Z",
      "acknowledged": true
    },
    {
      "severity": "INFO",
      "message": "Self Learning Layer at Level 2, needs 10+ executions",
      "domain": "learning",
      "timestamp": "2026-07-14T05:00:00Z",
      "acknowledged": false
    }
  ]
}
```

### POST /api/v1/monitoring/alerts/{alert_id}/acknowledge
Acknowledge an alert.

**Response 200:**
```json
{
  "alert_id": "alert-1",
  "acknowledged": true,
  "acknowledged_at": "2026-07-14T05:00:00Z"
}
```

---

## 10. Automation API

### POST /api/v1/automation/trigger
Trigger an automated workflow.

**Request:**
```json
{
  "trigger": "post-commit",
  "context": {
    "branch": "feature/billing-api",
    "changed_files": ["src/api/billing.controller.ts", "prisma/schema.prisma"],
    "commit_message": "Add billing API endpoint with rate limiting"
  }
}
```

**Response 200:**
```json
{
  "trigger_id": "TRIGGER-20260714-001",
  "trigger": "post-commit",
  "status": "PROCESSING",
  "workflow": "AUTO-CERTIFY",
  "steps": [
    { "action": "classify", "status": "COMPLETE", "result": "BACKEND - MEDIUM" },
    { "action": "plan", "status": "COMPLETE", "result": "CHAIN-API-GEN" },
    { "action": "decide", "status": "COMPLETE", "result": "DEC-20260714-003" },
    { "action": "execute", "status": "PENDING", "task_id": "TASK-20260714-003" },
    { "action": "validate", "status": "PENDING" },
    { "action": "certify", "status": "PENDING" },
    { "action": "report", "status": "PENDING" }
  ]
}
```

### POST /api/v1/automation/rules
Register or update an automation rule.

**Request:**
```json
{
  "trigger": "post-commit",
  "condition": {
    "branch_pattern": "feature/*",
    "changed_file_pattern": "*.ts",
    "min_risk_level": "LOW"
  },
  "workflow": "AUTO-CERTIFY",
  "enabled": true
}
```

**Response 201:**
```json
{
  "rule_id": "RULE-001",
  "trigger": "post-commit",
  "condition": {
    "branch_pattern": "feature/*",
    "changed_file_pattern": "*.ts",
    "min_risk_level": "LOW"
  },
  "workflow": "AUTO-CERTIFY",
  "enabled": true,
  "created_at": "2026-07-14T05:00:00Z"
}
```

### GET /api/v1/automation/rules
Returns registered automation rules.

**Response 200:**
```json
{
  "total_rules": 1,
  "rules": [
    {
      "rule_id": "RULE-001",
      "trigger": "post-commit",
      "condition": { "branch_pattern": "feature/*", "changed_file_pattern": "*.ts" },
      "workflow": "AUTO-CERTIFY",
      "enabled": true,
      "executions": 0
    }
  ]
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "error": "BAD_REQUEST",
  "message": "Invalid request body: missing required field 'task'",
  "details": { "missing_fields": ["task"] },
  "timestamp": "2026-07-14T05:00:00Z"
}
```

### 404 Not Found
```json
{
  "error": "NOT_FOUND",
  "message": "Task TASK-999999999 not found",
  "timestamp": "2026-07-14T05:00:00Z"
}
```

### 429 Too Many Requests
```json
{
  "error": "RATE_LIMITED",
  "message": "Queue is full (max 10 tasks). Retry after current execution completes.",
  "retry_after_seconds": 120,
  "timestamp": "2026-07-14T05:00:00Z"
}
```

### 503 Service Unavailable
```json
{
  "error": "SERVICE_UNAVAILABLE",
  "message": "Component 'orchestrator' is OFFLINE or not responding",
  "timestamp": "2026-07-14T05:00:00Z"
}
```

## API Versioning
- All endpoints use URL path versioning: `/api/v{major}/`
- Breaking changes increment the major version
- Non-breaking additions use minor version bumps (header: `X-API-Version: 1.1`)
- Deprecated endpoints return `Warning: 299 - "Deprecated API version"` header
- Backward compatibility maintained for 2 minor versions

## Authentication
- Internal APIs use API key authentication via `X-API-Key` header
- Machine-to-machine communication uses JWT tokens
- All requests logged with caller identity
- Rate limiting: 1000 requests/minute per caller

## Integration Contract
```
Base URL: /api/v1
Content-Type: application/json
Accept: application/json
Authentication: X-API-Key: <key>
Rate Limit: 1000 req/min
Timeout: 30s (standard), 300s (execution endpoints)
```
