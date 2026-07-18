# MeterVerse Utility Language

**Version:** 2.0.0  
**Authority:** The business language of MeterVerse. NOT UI language — business language.

---

## 1. Core Business Terms

| Term | Definition | Never Use |
|------|------------|-----------|
| Meter | A physical device that measures utility consumption | Device, sensor, gadget |
| Reading | A measurement captured from a meter at a point in time | Value, data point |
| Consumption | The difference between two readings, indicating usage | Usage, volume |
| Invoice | A financial document requesting payment for consumption | Bill, charge |
| Payment | Money received from a customer | Transaction, deposit |
| Customer | An entity that receives utility services | Client, account holder |
| Project | A development or community served by the platform | Site, location |
| Area | A geographic region with its own configuration | Region, zone |
| Tariff | The pricing structure applied to consumption | Rate, price plan |
| SIM Card | A cellular module in a smart meter for communication | Chip, modem |

---

## 2. Business Event Language

| Event | Description | Expected User Action |
|-------|-------------|---------------------|
| Meter Assigned | Meter linked to customer+unit | Confirm assignment |
| Reading Captured | New reading recorded | Validate if automated |
| Review Required | Reading flagged as suspicious | Review and approve/reject |
| Invoice Generated | New invoice created | Review and issue |
| Invoice Issued | Invoice sent to customer | Track payment |
| Payment Received | Payment recorded | Verify allocation |
| Payment Overdue | Invoice past due date | Initiate collection |
| Sync Completed | Data synchronized with Symbiot | Verify status |
| Sync Failed | Synchronization error | Investigate and retry |
| Tariff Changed | Tariff plan updated | Notify affected customers |
| Meter Offline | Communication lost with meter | Dispatch technician |
| Alert Triggered | System detected anomaly | Investigate and resolve |

---

## 3. Business Event Visual Language

| Severity | Visual | Color | Animation | Dashboard Widget |
|----------|--------|-------|-----------|-----------------|
| Information | Icon + label | brand-500 | None | Activity feed |
| Success | Icon + label + toast | status-active | Check pulse | Activity feed |
| Warning | Icon + label + banner | status-pending | Gentle pulse | Alert widget |
| Error | Icon + label + banner + toast | status-error | Pulse + attention | Alert widget |
| Critical | Full banner + toast + sound | status-error | Pulsing + shaking | Alert widget + notification |

---

## 4. Business Priority Levels

| Priority | Response Time | Display | Sound |
|----------|--------------|---------|-------|
| P0-Critical | Immediate | Full-screen banner + notification + toast | Yes |
| P1-High | <1 hour | Banner + notification | Optional |
| P2-Medium | <24 hours | Notification | No |
| P3-Low | <1 week | Activity feed only | No |

---

## 5. Business Metrics

| Metric | Definition | Format | Display Rule |
|--------|-----------|--------|-------------|
| Revenue | Total invoiced amount | Currency (EGP) | 2 decimal places |
| Collection Rate | Paid / Invoiced % | Percentage | Round to 1 decimal |
| Outstanding | Total unpaid invoices | Currency (EGP) | Always show with aging |
| Consumption | Units consumed | Number (kWh, m³) | No decimals |
| Reading Success | Valid readings / Total | Percentage | Show trend arrow |
| Meter Health | Healthy meters / Total | Percentage | Color-coded |
