# Feature Dependency Matrix

**Purpose:** Every feature lists its dependencies. No feature is implemented before its dependencies.

| Feature | Depends On |
|---------|-----------|
| Customer Documents | Customer, Permission, Upload, Storage, Audit, Notification, Search, Timeline |
| Invoice Generation | Reading, Tariff, ChargeRule, Contract, Customer |
| Payment Gateway | Payment, Invoice, Customer, Audit, Notification |
| AI Anomaly Detection | Reading, ValidationRule, Audit, Timeline, Notification |
| Real-Time Dashboard | WebSocket, KPI, ActivityStream, Permission |
| Mobile Sync | Auth, Customer, Meter, Reading, Offline Queue |
| Search | Customer, Meter, Reading, Invoice, Elasticsearch |
