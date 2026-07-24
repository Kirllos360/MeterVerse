# Process Diagram Registry — Planning

## Diagram Types per Process

| Process | Mermaid | BPMN | Sequence | Activity | State | ERD | Deployment | Data Flow |
|:--------|:-------:|:----:|:--------:|:--------:|:----:|:---:|:----------:|:---------:|
| P001 Customer Onboarding | ⏳ | ❌ | ⏳ | ❌ | ❌ | ❌ | ❌ | ❌ |
| P003 Reading Capture | ⏳ | ❌ | ⏳ | ❌ | ❌ | ❌ | ❌ | ❌ |
| P005 Invoice Generation | ⏳ | ❌ | ⏳ | ❌ | ✅ | ❌ | ❌ | ❌ |
| P007 Payment Recording | ⏳ | ❌ | ⏳ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Auth Flow | ✅ | ❌ | ⏳ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Bill Run Lifecycle | ⏳ | ❌ | ⏳ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Tariff Calculation | ⏳ | ❌ | ⏳ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Priority for Diagram Generation
| Priority | Process | Diagram Type | Reason |
|:--------:|:--------|:------------:|--------|
| P1 | Customer Onboarding | Sequence | Most common user workflow |
| P1 | Invoice Generation | Activity | Core business process |
| P1 | Payment Recording | Sequence | Financial accuracy |
| P2 | Meter Reading | State | Device lifecycle |
| P2 | Bill Run | Activity | Scheduling dependency |
| P3 | All others | Mermaid | Documentation completeness |
