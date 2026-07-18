# MeterVerse Workflow Assistant DNA

**Defines the guided workflow system that recommends next steps and guides users through business processes.**

---

## 1. Workflow Assistant

- **Location:** Right-side context panel or bottom sheet
- **Trigger:** Auto-appears for complex workflows or user request
- **Content:** Current step, available next steps, progress, tips
- **State:** Collapsible, dismissible, persistent per workflow
- **Reappear:** Can be reopened from "Help" or "Guide me" buttons

## 2. Guidance Types

| Type | Trigger | Display |
|------|---------|---------|
| Next Step | After completing an action | Toast + panel update |
| Suggestion | System detects incomplete workflow | Subtle panel indicator |
| Warning | Business rule violation risk | Yellow banner |
| Error Recovery | Action failed | Red banner with fix steps |
| Onboarding | First-time user | Step-by-step tour |

## 3. Workflow Assistant Rules

| Rule | Implementation |
|------|---------------|
| Non-blocking | User can ignore guidance |
| Persistent | Returns if workflow isn't complete |
| Contextual | Only shows relevant guidance |
| Learnable | Does not repeat for experts |
| Dismissible | Can hide permanently for a workflow |
| Restorable | Can re-enable from settings |

## 4. Guided Mode

- **Activation:** User clicks "Guide me" button
- **Visual:** Highlighted current field/action, dimmed background
- **Navigation:** Step-by-step with "Next" and "Previous"
- **Progress:** Step counter (Step 3 of 7)
- **Exit:** "Exit guided mode" at any time
- **Auto-advance:** After completing a step, advance to next

## 5. Intelligent Suggestions

| Suggestion Type | Example |
|-----------------|---------|
| Missing data | "3 readings are flagged as suspicious. Review them now." |
| Workflow continuation | "Meter assigned successfully. Would you like to record an initial reading?" |
| Deadline approaching | "Invoice #1234 is due in 3 days. Follow up with customer." |
| Bulk action | "12 readings are ready for billing. Generate invoices for all?" |
| Anomaly detection | "Customer XYZ's consumption dropped 80% this month. Verify meter reading." |
