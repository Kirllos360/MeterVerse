# Cross-Wave Dependency Matrix

**Purpose:** Waves are not isolated — this matrix tracks cross-wave dependencies.

| Wave 02 Feature | Depends on Wave 01 | Depends on Wave XX |
|----------------|-------------------|-------------------|
| Tasks Module | Auth, Permission, User, Notification | — |
| Search | All entity CRUDs | — |
| WebSocket | Auth, Notification | — |
| Email Delivery | EmailLog model, SMTP config | — |
| Accessibility | All UI components | — |

| Wave 03 Feature | Depends on Wave 01 | Depends on Wave 02 |
|----------------|-------------------|-------------------|
| Tariff Engine | Tariff model, Reading | — |
| BillRun Engine | Invoice, Reading, Tariff | — |
| Payment Gateway | Payment, Invoice | Notifications |

| Wave 05 Feature | Depends on Wave 01 | Depends on Wave 03 |
|----------------|-------------------|-------------------|
| Anomaly Detection | Reading, ValidationRule | — |
| AI Chat | Auth, Permission, All entities | — |
| Forecasting | Reading (history) | Billing data |

| Wave 06 Feature | Depends on Wave 01-05 |
|----------------|----------------------|
| Mobile API | Auth (mobile scope), All entities |
| Production Deploy | All waves complete |
