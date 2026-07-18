# Section 4 — Universal Data Entry Engine

**Purpose:** Replace all scattered "Add" pages with ONE permanent engine.

---

## Architecture

```
User clicks "Add [Entity]"
    ↓
UniversalDataEntry dialog opens
    ↓
Step 1: Select Entity Type (from registry)
    ↓
Step 2: Load Dynamic Form (from EntityFormRegistry)
    ↓
Step 3: Fill form (React Hook Form + Zod)
    ├── Inline validation (on blur)
    ├── Business validation (on change)
    └── Dependency validation (on change)
    ↓
Step 4: Preview (read-only summary of entered data)
    ↓
Step 5: Save
    ├── API call
    ├── Audit log
    ├── Event published
    └── Notification sent
    ↓
Step 6: Redirect to new entity detail
    ├── Workflow Assistant activates
    └── Toast confirmation
```

## Supported Entities

| Entity | Form Fields | Validation | Dependencies |
|--------|------------|-----------|-------------|
| Customer | nameAr, nameEn, phone, email, type, nationalId, projectId | required, email, phone, unique | Project must exist |
| Unit | name, code, type, area, rooms, floorId, buildingId, projectId | required, numeric | Floor, Building, Project must exist |
| Meter | serialNumber, type, brand, model, projectId | required, unique serial | Project must exist |
| Reading | meterId, value, date, source, notes | required, positive, date, sequence | Meter must be active |
| Invoice | customerId, period, items | required | Customer, Tariff, Reading must exist |
| Payment | customerId, amount, method, date, invoiceIds | required, positive, <= balance | Customer, Invoice(s) must exist |
| Tariff | name, type, chargeMode, rate, effectiveFrom | required, positive, non-overlap | Project must exist |
| SIM | iccid, msisdn, provider, status | required, unique | — |
| Wallet | customerId, initialBalance | required | Customer must exist |
| Settlement | customerId, amount, type, reason | required | Customer must exist |
| User | name, email, password, roleId | required, email, minLength | Role must exist |
| Project | name, code, area | required, unique code | — |
| Area | name, code | required, unique code | — |

## Dynamic Form Features

| Feature | Implementation |
|---------|---------------|
| Field types | Text, Number, Currency, Select, MultiSelect, Date, Switch, Textarea, File |
| Validation | Zod schema per entity. Inline on blur. Business rules on change. |
| Dependencies | Dependent fields show/hide based on other field values |
| Autocomplete | Search-select for related entities (Customer, Meter, Project) |
| Sections | Complex forms grouped into sections with collapsible headers |
| Defaults | Smart defaults based on context (project, area from workspace) |
| Draft | Auto-save draft to localStorage every 30 seconds |
| Keyboard | Tab between fields, Enter to submit, Esc to cancel |

## Replaces

- NewCustomerPage (legacy) → UniversalDataEntry
- NewReading form (planned) → UniversalDataEntry
- Add Meter dialog (planned) → UniversalDataEntry
- Create Invoice (planned) → UniversalDataEntry
