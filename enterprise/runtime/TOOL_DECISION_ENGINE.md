# MeterVerse AI Decision Engine v4
**Generated:** 2026-07-14 | **Phase 04 — Enterprise AI Integration & Autonomous Orchestration**

## Purpose
The AI Decision Engine is the autonomous brain of MeterVerse. It ingests any task description and outputs a complete, executable decision without human intervention — selecting tools, roles, order, MCPs, validators, reports, docs, and tests.

## Decision Pipeline

```
Task Description
  │
  ▼
┌──────────────────────────────────────────────────────────────────┐
│ 1. TASK CLASSIFIER                                                │
│    Parse task → extract keywords → match task type               │
│    → determine risk level (LOW/MEDIUM/HIGH/CRITICAL)             │
│    → determine domain (API/FE/SEC/TEST/DB/ARCH/PERF/DOC/CODE)   │
└──────────────────────────────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────────────────────────────┐
│ 2. ROLE SELECTOR                                                  │
│    Map task type → primary AI role(s) from AI_ROLES_v3.md        │
│    Map risk level → required supervisor (Chief Architect)        │
│    Resolve role conflicts (multiple matches = sequential roles)  │
└──────────────────────────────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────────────────────────────┐
│ 3. TOOL CHAIN SELECTOR                                            │
│    Load chain from TOOL_SELECTION_ENGINE.md                      │
│    Filter by tool availability (master-registry.json)            │
│    Apply fallback chain from TOOL_INTELLIGENCE_LAYER.json        │
│    Apply intelligence scores (speed, accuracy, confidence)       │
└──────────────────────────────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────────────────────────────┐
│ 4. EXECUTION ORDERER                                              │
│    Topological sort from TOOL_DEPENDENCY_GRAPH.json              │
│    Group parallel-executable tools                                │
│    Order serial chains                                            │
│    Apply risk-based priority (CRITICAL first)                    │
└──────────────────────────────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────────────────────────────┐
│ 5. MCP RESOLVER                                                   │
│    Check if any selected tools have MCP capability                │
│    Load MCP graph from TOOL_DEPENDENCY_GRAPH.json → mcpGraph     │
│    Activate relevant MCP servers                                  │
│    Route tool execution through MCP if beneficial                │
└──────────────────────────────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────────────────────────────┐
│ 6. VALIDATION GATE SELECTOR                                       │
│    Load validation gates from TOOL_DEPENDENCY_GRAPH.json         │
│    → validationGraph                                              │
│    Map selected tool chain → required validation gates           │
│    Set severity per gate (BLOCKER / HIGH / MEDIUM)               │
└──────────────────────────────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────────────────────────────┐
│ 7. DOCUMENTATION PLANNER                                         │
│    Determine if ADR needed (ARCH/HIGH/CRITICAL)                  │
│    Determine if API docs needed (API change)                     │
│    Determine if changelog needed (user-facing)                   │
│    Determine if knowledge graph update needed (structural)       │
└──────────────────────────────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────────────────────────────┐
│ 8. CERTIFICATION PLANNER                                         │
│    Map tools to certification dimensions                          │
│    Set expected thresholds per dimension                          │
│    Calculate expected overall score                               │
│    Determine certification level (CERTIFIED/QUALIFIED/WARNING)   │
└──────────────────────────────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────────────────────────────┐
│ 9. REPORT GENERATOR                                              │
│    Generate completion report structure                           │
│    Include: tools run, results, scores, pass/fail matrix         │
│    Include: remediation plan if failures                          │
└──────────────────────────────────────────────────────────────────┘
  │
  ▼
OUTPUT: Complete Decision JSON (executable by orchestrator)
```

## Decision Output Schema

```json
{
  "decision_id": "DEC-20260714-001",
  "timestamp": "2026-07-14T05:00:00Z",
  "task": {
    "description": "Create billing API endpoint",
    "classification": "BACKEND",
    "risk_level": "MEDIUM",
    "risk_score": 35,
    "chain_id": "CHAIN-API-GEN"
  },
  "roles": {
    "primary": "Backend Engineer",
    "secondary": ["Database Engineer"],
    "supervisor": "Chief Architect",
    "reasoning": "API generation + database schema change requires backend + DB collaboration"
  },
  "tool_chain": {
    "selected": ["OpenAPIGenerator", "Spectral", "SwaggerCLI", "TypeDoc", "Prisma", "TypeScript", "ESLint", "Playwright"],
    "parallel_groups": [
      ["OpenAPIGenerator", "Prisma validate"],
      ["Spectral", "ESLint"],
      ["TypeScript", "TypeDoc"],
      ["SwaggerCLI", "Playwright"]
    ],
    "serial_chain": ["Prisma validate → Prisma migrate → TypeScript → ESLint → Spectral → OpenAPIGenerator → SwaggerCLI → TypeDoc → Playwright"],
    "fallbacks_used": [],
    "missing_tools": []
  },
  "mcp": {
    "activated": ["PostgreSQL", "Playwright"],
    "routed_through_mcp": ["Prisma", "Playwright"],
    "reasoning": "Database operations through PostgreSQL MCP, E2E tests through Playwright MCP"
  },
  "validation": {
    "gates": [
      { "domain": "architecture", "tools": ["DependencyCruiser", "Madge"], "severity": "BLOCKER" },
      { "domain": "code_quality", "tools": ["TypeScript", "ESLint"], "severity": "BLOCKER" },
      { "domain": "api", "tools": ["Spectral"], "severity": "BLOCKER" },
      { "domain": "testing", "tools": ["Playwright"], "severity": "BLOCKER" },
      { "domain": "documentation", "tools": ["TypeDoc", "MkDocs"], "severity": "MEDIUM" }
    ],
    "expected_pass_rate": "100%"
  },
  "documentation": {
    "adr_needed": true,
    "api_docs_needed": true,
    "changelog_needed": true,
    "knowledge_graph_update": true,
    "reasoning": "Structural API change + new endpoint + new schema"
  },
  "certification": {
    "dimensions": {
      "architecture": { "expected": 90, "threshold": 80, "weight": 15 },
      "security": { "expected": 85, "threshold": 80, "weight": 15 },
      "performance": { "expected": 85, "threshold": 75, "weight": 15 },
      "testing": { "expected": 90, "threshold": 80, "weight": 15 },
      "accessibility": { "expected": 85, "threshold": 75, "weight": 10 },
      "maintainability": { "expected": 90, "threshold": 80, "weight": 10 },
      "documentation": { "expected": 85, "threshold": 75, "weight": 10 },
      "enterprise": { "expected": 90, "threshold": 80, "weight": 10 }
    },
    "expected_overall": 87.5,
    "expected_level": "CERTIFIED",
    "minimum_acceptable": 80
  },
  "report": {
    "format": "markdown",
    "sections": ["execution_summary", "tool_results", "validation_matrix", "certification_scores", "remediation_plan"],
    "output_path": "enterprise/runtime/gates/decision-report-{decision_id}.md"
  },
  "estimated_duration": "25m",
  "auto_execute": true
}
```

## Automatic Classification Rules

### Rule A: Task → Type Mapping
| Keywords | Task Type | Domain | Primary Role | Chain ID |
|----------|-----------|--------|-------------|----------|
| `api`, `endpoint`, `openapi`, `route`, `controller`, `rest` | API Generation | BACKEND | Backend Engineer | CHAIN-API-GEN |
| `component`, `page`, `ui`, `react`, `frontend`, `layout`, `hook` | Frontend | FRONTEND | Frontend Engineer | CHAIN-FE |
| `security`, `vuln`, `audit`, `cve`, `secret`, `sast`, `auth` | Security | SECURITY | Security Engineer | CHAIN-SEC |
| `test`, `e2e`, `playwright`, `coverage`, `jest`, `spec` | Testing | TESTING | QA Engineer | CHAIN-TEST |
| `schema`, `migration`, `prisma`, `database`, `model`, `sql` | Database | DATABASE | Database Engineer | CHAIN-DB |
| `architecture`, `refactor`, `restructure`, `adr`, `design` | Architecture | ARCHITECTURE | Chief Architect | CHAIN-ARCH |
| `performance`, `bundle`, `load`, `lighthouse`, `optimize` | Performance | PERFORMANCE | Performance Engineer | CHAIN-PERF |
| `doc`, `documentation`, `readme`, `changelog`, `mkdocs` | Documentation | DOCUMENTATION | Documentation Engineer | CHAIN-DOC |
| `full`, `certify`, `enterprise`, `all`, `complete` | Full Certification | ENTERPRISE | Chief Architect | CHAIN-FULL |
| `*default*` | Code Change | CODE | Senior Developer | CHAIN-CODE |

### Rule B: Risk Classification
| Score | Level | Criteria |
|-------|-------|----------|
| 1-20 | LOW | Documentation, formatting, lint fixes, non-functional changes |
| 21-50 | MEDIUM | Feature implementation, refactors, schema additions, non-breaking |
| 51-80 | HIGH | Security patches, architecture changes, breaking API changes |
| 81-100 | CRITICAL | Auth changes, data migrations, production config, schema deletion |

Risk scoring formula:
```
risk_score = (scope_impact * 0.4) + (data_sensitivity * 0.3) + (rollback_complexity * 0.3)
```

### Rule C: Role Resolution
1. **Single domain match** → single primary role executes
2. **Multi-domain match** (e.g., API + DB) → roles execute sequentially in dependency order
3. **Risk ≥ HIGH** → Chief Architect added as supervisor
4. **Risk = CRITICAL** → Chief Architect must approve output before merge
5. **No match** → default to Senior Developer for implementation, Chief Architect for architecture

### Rule D: Tool Chain Selection
```
For each task type:
  1. Load chain ID from Rule A
  2. Load chain template from TOOL_SELECTION_ENGINE.md
  3. For each tool slot:
     a. Check tool availability in master-registry.json
     b. If available → select
     c. If not → check fallback in TOOL_INTELLIGENCE_LAYER.json
     d. If fallback available → select with warning
     e. If no fallback → skip with MISSING_TOOL warning
  4. Optimize order using TOOL_DEPENDENCY_GRAPH.json topological sort
  5. Identify parallel groups (tools with no interdependency)
```

### Rule E: MCP Activation Rules
| Tool | MCP Server | Activate When |
|------|-----------|---------------|
| Prisma | PostgreSQL MCP | Database operations, migrations, queries |
| Playwright | Playwright MCP | Browser-based E2E tests |
| Storybook | Storybook MCP | Component development |
| Figma tokens | Figma MCP | Design token sync |
| Git operations | Git MCP | Commits, branches, PRs |
| Sequential reasoning | SequentialThinking MCP | Complex multi-step tasks |
| mkdocs | Notion MCP | Documentation sync |

### Rule F: Validation Gate Mapping
| Tool Chain | Required Gates |
|-----------|---------------|
| CHAIN-API-GEN | api, code_quality, architecture, documentation |
| CHAIN-FE | code_quality, accessibility, testing, performance |
| CHAIN-SEC | security, code_quality |
| CHAIN-TEST | testing, code_quality |
| CHAIN-DB | architecture, code_quality |
| CHAIN-ARCH | architecture, code_quality, documentation |
| CHAIN-PERF | performance, code_quality |
| CHAIN-DOC | documentation, code_quality |
| CHAIN-FULL | ALL gates |
| CHAIN-CODE | code_quality, architecture |

### Rule G: Documentation Requirements
| Condition | ADR Needed | API Docs | Changelog | KG Update |
|-----------|-----------|----------|-----------|-----------|
| Risk = HIGH or CRITICAL | YES | depends | YES | depends |
| Domain = ARCHITECTURE | YES | NO | depends | YES |
| Domain = API | depends | YES | YES | YES |
| Domain = DATABASE | YES | depends | depends | YES |
| Domain = SECURITY | depends | NO | YES | NO |
| User-facing change | depends | depends | YES | depends |
| Structural change | YES | depends | depends | YES |

### Rule H: Certification Thresholds
| Level | Overall Score | Minimum Per Dimension |
|-------|--------------|----------------------|
| CERTIFIED | ≥ 85 | ≥ 75 |
| QUALIFIED | ≥ 70 | ≥ 60 |
| WARNING | ≥ 50 | ≥ 40 |
| FAILING | < 50 | any < 40 |

## Decision Examples

### Example 1: "Create a new billing API endpoint"
```json
{
  "decision_id": "DEC-20260714-001",
  "task": { "classification": "BACKEND", "risk_level": "MEDIUM", "chain_id": "CHAIN-API-GEN" },
  "roles": { "primary": "Backend Engineer", "secondary": [], "supervisor": null },
  "tool_chain": {
    "selected": ["Prisma", "TypeScript", "ESLint", "Spectral", "OpenAPIGenerator", "SwaggerCLI", "TypeDoc", "Playwright", "DependencyCruiser", "Madge"],
    "parallel_groups": [
      ["Prisma validate", "TypeScript"],
      ["ESLint", "Spectral"],
      ["OpenAPIGenerator", "DependencyCruiser"],
      ["SwaggerCLI", "Madge"],
      ["TypeDoc", "Playwright"]
    ]
  },
  "mcp": { "activated": ["PostgreSQL"], "routed_through_mcp": ["Prisma"] },
  "validation": { "gates": ["api", "code_quality", "architecture"] },
  "documentation": { "adr_needed": false, "api_docs_needed": true, "changelog_needed": true },
  "certification": { "expected_overall": 87.5, "expected_level": "CERTIFIED" },
  "auto_execute": true
}
```

### Example 2: "Run full security audit"
```json
{
  "decision_id": "DEC-20260714-002",
  "task": { "classification": "SECURITY", "risk_level": "HIGH", "chain_id": "CHAIN-SEC" },
  "roles": { "primary": "Security Engineer", "secondary": [], "supervisor": "Chief Architect" },
  "tool_chain": {
    "selected": ["Semgrep", "Snyk", "Trivy", "Checkov", "Gitleaks", "TruffleHog", "npm audit", "Spectral"],
    "parallel_groups": [
      ["Semgrep", "Snyk", "Trivy"],
      ["Checkov", "Gitleaks", "TruffleHog"],
      ["npm audit", "Spectral"]
    ]
  },
  "validation": { "gates": ["security", "code_quality"] },
  "documentation": { "adr_needed": false, "changelog_needed": true, "kg_update": false },
  "certification": { "expected_overall": 85, "expected_level": "CERTIFIED", "minimum_acceptable": 80 },
  "auto_execute": true
}
```

### Example 3: "Refactor authentication module"
```json
{
  "decision_id": "DEC-20260714-003",
  "task": { "classification": "ARCHITECTURE", "risk_level": "CRITICAL", "chain_id": "CHAIN-ARCH" },
  "roles": { "primary": "Chief Architect", "secondary": ["Security Engineer", "Backend Engineer"], "supervisor": "Chief Architect (self)" },
  "tool_chain": {
    "selected": ["DependencyCruiser", "Madge", "Knip", "TypeScript", "ESLint", "Graphviz", "Semgrep", "Snyk", "Gitleaks", "Playwright"],
    "parallel_groups": [
      ["DependencyCruiser", "Madge", "Knip"],
      ["TypeScript", "ESLint"],
      ["Semgrep", "Snyk", "Gitleaks"],
      ["Graphviz", "Playwright"]
    ],
    "serial_chain": ["DependencyCruiser → Madge → Knip → TypeScript → ESLint → Semgrep → Snyk → Gitleaks → Graphviz → Playwright"]
  },
  "validation": { "gates": ["architecture", "security", "code_quality", "testing", "documentation"] },
  "documentation": { "adr_needed": true, "changelog_needed": true, "kg_update": true },
  "certification": { "expected_overall": 82, "expected_level": "QUALIFIED", "minimum_acceptable": 80 },
  "auto_execute": true,
  "requires_approval": true,
  "approval_role": "Chief Architect"
}
```

## Integration Contract

### Input
```
task: string — natural language task description
context?: object — optional execution context (branch, environment, previous decisions)
```

### Output
```
Decision: JSON object following Decision Output Schema
```

### Error Handling
| Condition | Behavior |
|-----------|----------|
| No tool chain matched | Default to CHAIN-CODE, log warning |
| All tools missing in chain | Skip chain, return MINIMAL decision with tsc+eslint only |
| Role not found | Default to Senior Developer |
| Risk cannot be calculated | Default to MEDIUM (safe default) |
| MCP server unavailable | Execute tool directly without MCP |
