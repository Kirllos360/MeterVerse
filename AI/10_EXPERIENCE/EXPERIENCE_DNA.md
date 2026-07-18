# MeterVerse Experience DNA

**Authoritative source for all user experience decisions.** Every page, component, and workflow inherits from this document.

---

## 1. Design Philosophy

MeterVerse is an Enterprise Utility Operating System, not an ERP. This distinction drives every experience decision:

- **Process-oriented, not page-oriented.** Users complete business workflows, not isolated tasks.
- **Guidance-first.** The platform recommends the next logical step. Users can hide guidance and restore it.
- **Permission-aware.** Every action, page, and widget respects the user's role. Users never see what they cannot do.
- **Lifecycle-driven.** Every entity (meter, customer, invoice, reading) has a lifecycle. The UI reflects where it is and what can happen next.
- **Expert and beginner compatible.** Novices get guidance; experts get speed (keyboard shortcuts, bulk actions, command palette).

## 2. Experience Profiles

| Profile | Primary Workflows | Complexity | Guidance Level |
|---------|------------------|------------|----------------|
| Operations | Monitoring, alerts, meter health | Medium | Interactive |
| Billing | Invoice generation, payments, collections | High | Step-by-step |
| CRM | Customer management, support tickets | Medium | Contextual |
| Administration | Configuration, users, areas, settings | High | Documentation |
| Analytics | Reports, KPIs, trends, exports | Low | Self-serve |
| GIS | Location hierarchy, maps, assignments | Medium | Visual |
| Executive | Dashboards, summaries, high-level KPIs | Low | Push |
| Configuration | Tariffs, thresholds, billing cycles | High | Wizard-guided |
| Field Operations | Readings, meter assignments, SIM swaps | High | Task-driven |
| Customer | Portal: invoices, payments, meters, usage | Low | Self-serve |

## 3. Core Experience Principles

| Principle | Description |
|-----------|-------------|
| **Predictability** | Similar actions have similar outcomes across all domains |
| **Progressive disclosure** | Show essentials first; reveal complexity on demand |
| **Forgiveness** | Warn before irreversible actions; support undo where possible |
| **Feedback** | Every action produces immediate, clear feedback |
| **Context preservation** | Navigation preserves user context (filters, scroll position, selections) |
| **Error prevention** | Block impossible actions before they reach the backend |
| **Status visibility** | Every entity shows its current state and available transitions |

## 4. Status System

Every business entity has a lifecycle with visible status:

- Status displayed as color-coded badges (green=active, yellow=pending, red=problem, gray=inactive)
- Status determines available actions (disabled buttons for invalid transitions)
- Status changes trigger notifications to relevant users
- Status history is tracked and viewable

## 5. Guidance Philosophy

- **Inline guidance:** Tooltips, helper text, contextual hints
- **Workflow guidance:** Step indicators, progress bars, "what's next" panels
- **Intelligent suggestions:** "3 readings are suspicious. Review them now."
- **Hidden when mastered:** Users can dismiss guidance; it stays hidden for that workflow

## 6. Error Philosophy

- **Prevent:** Block invalid inputs, disable impossible actions, validate early
- **Warn:** Business rule violations show warning messages but allow override with justification
- **Explain:** Errors explain WHAT happened, WHY it happened, and HOW to fix it
- **Recover:** Provide a path forward after every error

## 7. Empty State Philosophy

Never show a blank page. Every empty state must:
- Explain what should be here
- Provide a call to action to add content
- Link to documentation if relevant
- Show an illustration that matches the context
