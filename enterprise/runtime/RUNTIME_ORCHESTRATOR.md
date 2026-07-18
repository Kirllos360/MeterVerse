# MeterVerse Runtime Orchestrator v4
**Generated:** 2026-07-14 | **Phase 04 — Enterprise AI Integration & Autonomous Orchestration**

## Purpose
Executes AI decisions autonomously. Manages parallel execution, background tasks, priority queues, cancel/resume, retry with backoff, and rollback on failure. The orchestrator is the execution engine that converts Decision JSON → completed work.

## Architecture Overview

```
Decision JSON (from TOOL_DECISION_ENGINE.md)
  │
  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ ORCHESTRATOR ENGINE                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐   │
│  │ QUEUE    │→ │ SCHEDULE │→ │ EXECUTE  │→ │ MONITOR & REPORT  │   │
│  │ MANAGER  │  │  R       │  │  R       │  │  R                │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────────┘   │
│       │              │              │               │               │
│       ▼              ▼              ▼               ▼               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐   │
│  │ PRIORITY │  │ PARALLEL │  │ RETRY    │  │ ROLLBACK          │   │
│  │ SORT     │  │ GROUP    │  │ MANAGER  │  │ MANAGER           │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ EXECUTION LAYER                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ PARALLEL     │  │ SERIAL       │  │ BACKGROUND               │  │
│  │ POOL (max 4) │  │ CHAIN        │  │ QUEUE (async, no block)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
  │
  ▼
OUTPUT: Execution Report + Updated Decision Status + Logs
```

## Task Lifecycle State Machine

```
                  ┌─────────┐
                  │ PENDING │
                  └────┬────┘
                       │ dequeue
                       ▼
                  ┌─────────┐
                  │ QUEUED  │
                  └────┬────┘
                       │ schedule
                       ▼
                  ┌──────────┐
            ┌────→│ RUNNING  │←────┐
            │     └─────┬────┘     │
            │           │          │
            │     ┌─────┴──────┐   │
            │     │            │   │
            ▼     ▼            ▼   │
       ┌──────┐ ┌────────┐ ┌────┐ │
       │ FAIL │ │SUCCESS │ │ HALT│ │
       └──┬───┘ └────────┘ └──┬─┘ │
          │                   │   │
          ▼                   │   │
     ┌─────────┐              │   │
     │ RETRY   │──────────────┘   │
     │ (max 3) │  restart         │
     └─────────┘                  │
          │                       │
     (exhausted)                  │
          ▼                       │
     ┌─────────┐                  │
     │ ROLLBACK│──────────────────┘
     │ BACK    │  resume after fix
     └─────────┘
```

## Queue Manager

### Priority Levels
| Level | Value | Description | Max Wait |
|-------|-------|-------------|----------|
| CRITICAL | 100 | Production issues, security patches | Immediate |
| HIGH | 75 | Breaking changes, auth, data | < 1 min |
| MEDIUM | 50 | Feature implementation, refactors | < 5 min |
| LOW | 25 | Documentation, formatting, lint | < 15 min |
| BACKGROUND | 0 | Async reports, analysis, cleanup | No guarantee |

### Queue Operations
| Operation | Behavior |
|-----------|----------|
| `enqueue(decision, priority)` | Add to queue, sort by priority, return `task_id` |
| `dequeue()` | Pop highest-priority task |
| `peek()` | View next task without removing |
| `cancel(task_id)` | Remove from queue (if PENDING/QUEUED) or halt (if RUNNING) |
| `pause(task_id)` | Suspend execution (if RUNNING) → state becomes HALTED |
| `resume(task_id)` | Restart from HALTED → state becomes RUNNING |
| `list_queue()` | Return all tasks with states and priorities |

### Queue Priority Sort
```
sorted_queue = tasks.sort_by(
  -priority,    // higher priority first
  created_at    // FIFO within same priority
)
```

## Scheduler

### Execution Grouping
```
Input: Decision JSON (tool_chain.parallel_groups, tool_chain.serial_chain)

Algorithm:
  1. Create parallel groups from decision.parallel_groups
  2. Create serial chain from decision.serial_chain
  3. For each parallel group:
     a. Spawn concurrent execution threads (max 4 parallel)
     b. Wait for ALL to complete (or any BLOCKER failure)
     c. Collect results
  4. For each step in serial chain:
     a. Execute step
     b. Wait for completion
     c. If BLOCKER failure: stop, trigger rollback
     d. Pass output to next step
  5. Merge all results into execution report
```

### Parallel Pool Configuration
| Setting | Value | Notes |
|---------|-------|-------|
| max_concurrent | 4 | Adjustable based on system resources |
| timeout_per_tool | 120s | Default, adjustable per tool |
| idle_timeout | 30s | Wait before scaling down |
| retry_on_timeout | true | Retry once before failing |

## Executor

### Tool Execution Protocol
```json
{
  "execution_id": "EXEC-20260714-001",
  "tool": "TypeScript",
  "command": "npx tsc --noEmit",
  "working_dir": "D:\\meter",
  "timeout": 120000,
  "retry_count": 0,
  "max_retries": 3,
  "state": "RUNNING",
  "output": null,
  "exit_code": null,
  "started_at": null,
  "completed_at": null
}
```

### Execution Flow
```
For each tool:
  1. Check tool availability (is it in master-registry.json, is binary accessible)
  2. Resolve MCP routing (should this tool go through MCP?)
  3. Build command string from tool definition
  4. Set timeout from tool intelligence layer
  5. Execute:
     a. Spawn process (or MCP call)
     b. Stream output to log
     c. Monitor timeout
     d. Capture exit code + output
  6. On success (exit 0):
     a. Mark tool SUCCESS
     b. Collect output for next tool if needed
  7. On failure (exit != 0):
     a. Check if retryable (transient vs permanent)
     b. If retryable: increment retry_count, wait (2^retry * 1s), retry
     c. If permanent or max retries: mark FAIL, trigger rollback if BLOCKER
  8. Log complete execution record
```

### Output Chaining
When tools in a serial chain consume each other's output:
```
Tool A output → stored in shared context → Tool B reads context → Tool B output → ...
```

Context schema:
```json
{
  "shared_context": {
    "files_changed": ["src/api/billing.ts"],
    "schemas_changed": ["prisma/schema.prisma"],
    "test_results": { "passed": 42, "failed": 0 },
    "lint_results": { "errors": 0, "warnings": 3 },
    "certification_score": 87.5
  }
}
```

## Retry Manager

### Retry Strategy
| Failure Type | Retry? | Delay | Max Retries |
|-------------|--------|-------|-------------|
| Network timeout | YES | exponential (1s, 2s, 4s) | 3 |
| Process OOM | YES | exponential (5s, 10s, 20s) | 3 |
| CLI not found | NO | — | 0 |
| Tool misconfigured | NO | — | 0 |
| Permission denied | NO | — | 0 |
| Test failure | NO | — | 0 (human must fix) |
| Lint error | NO | — | 0 (code must be fixed) |

### Retry Algorithm
```
retry_count = 0
max_retries = 3
base_delay = 1000ms  (1 second)

while retry_count < max_retries:
  result = execute(tool)
  if result.success:
    return SUCCESS
  if not is_retryable(result.error):
    return FAIL
  retry_count++
  delay = base_delay * (2 ^ retry_count)  // 1s, 2s, 4s
  wait(delay)
  log("Retry {retry_count}/{max_retries} for {tool}")

return FAIL  // exhausted retries
```

## Rollback Manager

### Rollback Triggers
| Condition | Action |
|-----------|--------|
| BLOCKER validation fails | Rollback entire chain |
| CRITICAL tool fails after retries | Rollback with error report |
| Security tool finds high/critical vulns | Rollback with remediation plan |
| User cancels execution | Rollback completed steps if requested |

### Rollback Operations
| Tool Type | Rollback Action |
|-----------|----------------|
| File changes | `git checkout -- <changed_files>` |
| Prisma migrations | `prisma migrate reset` or `prisma migrate down` |
| Package changes | `npm install` with previous lockfile |
| Schema changes | Revert via migration rollback |
| Configuration | Restore from backup |

### Rollback Algorithm
```
1. Identify completed steps in reverse order
2. For each completed step:
   a. Determine rollback action (git revert, migrate down, etc.)
   b. Execute rollback
   c. Verify rollback success
   d. Log rollback result
3. Mark task state as ROLLED_BACK
4. Generate rollback report
5. Notify user (if interactive)
```

## Background Task Manager

### Background Task Types
| Type | Priority | Description |
|------|----------|-------------|
| REPORT_GENERATION | BACKGROUND | Generate certification/validation reports |
| KNOWLEDGE_GRAPH_UPDATE | BACKGROUND | Update knowledge graph with new relationships |
| MEMORY_CLEANUP | BACKGROUND | Archive old memory entries |
| ANALYSIS | BACKGROUND | Analyze trends, regressions, patterns |
| PREEMPTIVE_CERTIFICATION | BACKGROUND | Pre-certify unchanged areas |

### Background Queue
```
Background tasks run in a lower-priority thread pool:
- Max 2 concurrent background tasks
- Background tasks never block the main queue
- If main queue is empty, use idle time for background work
- Background tasks can be cancelled at any time
```

## Monitoring & Observability

### Execution Metrics
| Metric | Source | Purpose |
|--------|--------|---------|
| execution_time | Timer per tool + total | Performance tracking |
| success_rate | Pass/fail per tool | Reliability monitoring |
| retry_count | Retry manager | Failure pattern detection |
| queue_depth | Queue manager | Load monitoring |
| parallel_utilization | Parallel pool | Resource efficiency |
| rollback_rate | Rollback manager | Failure severity tracking |

### Logging
```
Log format: [ORCHESTRATOR] {timestamp} {level} {task_id} {message}

Log levels:
- INFO: Normal execution (start, end, progress)
- WARN: Non-blocker issues (fallback used, tool missing)
- ERROR: Blocker failures (tool failed, rollback triggered)
- DEBUG: Detailed execution traces (for troubleshooting)

Log storage: enterprise/runtime/logs/{date}/orchestrator-{task_id}.log
```

## API

### Orchestrator API (internal)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /orchestrator/execute | Submit Decision JSON for execution |
| GET | /orchestrator/status/{task_id} | Get task status |
| POST | /orchestrator/cancel/{task_id} | Cancel running task |
| POST | /orchestrator/pause/{task_id} | Pause running task |
| POST | /orchestrator/resume/{task_id} | Resume paused task |
| GET | /orchestrator/queue | List queue |
| GET | /orchestrator/logs/{task_id} | Get execution logs |
| POST | /orchestrator/retry/{task_id} | Retry failed task |

## Integration Contract

### Input
```
decision: JSON object from TOOL_DECISION_ENGINE.md Decision Output Schema
```

### Output
```
ExecutionReport: {
  task_id: string,
  status: PENDING | QUEUED | RUNNING | SUCCESS | FAIL | HALTED | ROLLED_BACK,
  started_at: string (ISO),
  completed_at: string (ISO) | null,
  duration: number (seconds),
  results: [
    {
      tool: string,
      state: PENDING | RUNNING | SUCCESS | FAIL | SKIPPED,
      exit_code: number | null,
      output: string | null,
      duration: number (seconds),
      retries: number
    }
  ],
  validation: {
    all_passed: boolean,
    gates: [GateResult],
    pass_rate: number
  },
  certification: {
    score: number,
    level: string
  } | null,
  rollback: {
    triggered: boolean,
    steps: [RollbackStep]
  } | null,
  error: string | null
}
```

### Error Handling
| Condition | Behavior |
|-----------|----------|
| Queue full | Return 429 with retry-after header |
| Task not found | Return 404 |
| Invalid decision JSON | Return 400 with validation errors |
| Orchestrator crash | On restart: resume HALTED tasks, re-queue PENDING tasks |
| Network partition | Retry with exponential backoff, escalate if persistent |
