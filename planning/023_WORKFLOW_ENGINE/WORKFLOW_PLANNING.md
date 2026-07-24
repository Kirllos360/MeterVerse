# Workflow Engine — Enterprise Planning

## Current State
- 3 state machines (customer, invoice, meter) in `workflow-engine.js`
- Code-defined transitions — not configurable by admin

## Target State (n8n-style visual builder)

### Components Needed
| Component | Description | Effort |
|-----------|-------------|:------:|
| Workflow Designer | Drag-and-drop node editor UI | 3 sessions |
| Node Palette | Available node types | 2 sessions |
| Node Library | Pre-built nodes for each engine | 3 sessions |
| Workflow Runtime | Engine to execute workflows | 2 sessions |
| Workflow Scheduler | Cron-based workflow triggers | 1 session |
| Workflow Monitor | Execution history + logs | 1 session |
| Workflow Templates | Pre-built workflow templates | 2 sessions |

### Node Types
- **Trigger**: Schedule, Webhook, API, Event
- **Action**: Send Email, Send SMS, Create Invoice, Update Meter
- **Logic**: Condition, Switch, Delay, Loop
- **Integration**: HTTP Request, Database Query, File Operation
- **Approval**: Human Task, Escalation, Notification

### Workflow Examples
| Workflow | Trigger | Actions |
|:--------:|---------|---------|
| Invoice Overdue Notice | Daily schedule | Check overdue invoices → Send reminder email |
| Meter Reading Alert | Webhook | Validate reading → Flag anomaly → Notify technician |
| New Customer Onboarding | API Event | Create customer → Assign meter → Send welcome |
| Payment Received | API Event | Allocate payment → Update ledger → Send receipt |
