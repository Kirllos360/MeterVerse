# MeterVerse Workflow DNA

**Defines how business workflows behave, how users navigate them, and how the UI guides users through processes.**

---

## 1. Workflow Principles

- Every workflow has a defined lifecycle with clear states and transitions
- The current state determines available actions
- Transitions are validated against business rules before execution
- Workflows can be paused and resumed
- Workflows show progress (steps completed, steps remaining)
- Workflows generate audit trails automatically

## 2. Core Workflows

### Meter Lifecycle
```
available → assigned → active → offline → faulty → replaced → terminated → retired
```
**User journey:** Select project > Select location > Select customer > Select meter type > Select meter > Assign SIM > Confirm

### Customer Lifecycle
```
prospect → active → suspended → archived
```
**User journey:** Search/create customer > Enter details > Assign units/meters > Manage billing > Transfer/merge/archive

### Reading Lifecycle
```
pending → validated → approved → billed
```
**User journey:** Select meter > Enter reading > Validate > Review queue > Approve/Reject/Correct

### Invoice Lifecycle
```
draft → issued → partially_paid → paid → overdue → cancelled
```
**User journey:** Generate invoices > Review > Issue > Track payments > Handle overdue > Cancel if needed

### Bill Cycle Lifecycle
```
OPEN → LOCKED → APPROVED → CLOSED
```
**User journey:** Create cycle > Generate invoices > Review > Lock > Approve > Close

### Payment Lifecycle
```
initiated → completed → allocated → reversed (if needed)
```
**User journey:** Receive payment > Identify customer > Allocate to invoices > Record > Generate receipt

### Ticket Lifecycle
```
open → in_progress → resolved → closed
```
**User journey:** Create ticket > Assign > Work > Resolve > Customer confirmation > Close

### Alert Lifecycle
```
triggered → acknowledged → resolved
```
**User journey:** Receive alert > Investigate > Acknowledge > Resolve root cause

## 3. Wizard Pattern (Multi-Step Flows)

Used for complex workflows that require sequential decisions:

- Progress indicator showing all steps with current step highlighted
- Steps can be navigated forward (next) and backward (previous)
- Each step validates before allowing forward progress
- Summary/confirmation step before final submission
- "Save as draft" for multi-session workflows
- Keyboard: Enter=next, Shift+Enter=previous

## 4. Approval Workflows

Certain actions require approval:
- High-value invoice adjustments
- Meter termination with outstanding balance
- Customer account closure
- Tariff changes mid-cycle

Approval workflow:
1. User initiates action with justification
2. System routes to approver based on amount/type
3. Approver reviews details and approves/rejects
4. User notified of outcome
5. Action executed on approval

## 5. Bulk Operations

| Operation | Entity | Selection Method |
|-----------|--------|-----------------|
| Bulk assign meters | Meters | SmartTable row selection |
| Bulk terminate | Meters | SmartTable row selection |
| Bulk approve readings | Readings | Review queue select-all |
| Bulk generate invoices | Invoices | Filter + generate all |
| Bulk import | Multiple entities | Upload Center (CSV/Excel) |

## 6. Workflow Integration Patterns

- **Dashboard widgets** show workflow tasks needing attention
- **Notification center** alerts users to workflow events
- **Command palette** provides quick access to common workflow actions
- **Context panels** show related workflow information
- **Guided mode** step-by-step walkthrough for complex workflows
