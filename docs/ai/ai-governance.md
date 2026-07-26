# AI Governance Architecture

## Core Principles
1. **AI can analyze** — All data sources available for analysis
2. **AI can recommend** — Suggestions with confidence scores
3. **AI cannot execute destructive actions** — No deletions, no writes without approval
4. **Every action is auditable** — Full traceability
5. **Human-in-the-loop** — Critical actions require approval

## Agent Responsibilities
| Agent | Analyze | Recommend | Execute | Approval Required |
|:------|:-------:|:---------:|:-------:|:----------------:|
| Meter RCA | ✅ | ✅ | ❌ | Never (read-only) |
| Email Intel | ✅ | ✅ | ❌ | Sending emails |
| Supplier RCA | ✅ | ✅ | ❌ | Escalations |
| Task Assistant | ✅ | ✅ | Task creation | Task assignment |
| Knowledge Graph | ✅ | ✅ | ❌ | Never (read-only) |
| Audit Timeline | ✅ | ✅ | ❌ | Never (read-only) |

## Data Boundaries
- Agents access data through the same API layer as the UI
- No direct database access
- All queries are logged with correlationId
- Sensitive fields (passwords, tokens) are redacted before reaching AI

## Prompt Versioning
- Every prompt stored in prompt-registry.md
- Version tracked in git
- Changes require AI architect approval
