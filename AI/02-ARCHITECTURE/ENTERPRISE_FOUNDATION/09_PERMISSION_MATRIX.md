# Section 9 — Extended Permission Matrix

---

## Permission Dimensions

| Dimension | Values |
|-----------|--------|
| Operation | view, add, edit, delete, approve, reject, export, import, print, configure |
| Assignee | user, role, userGroup |
| Scope | project, area, department, organization |
| Condition | always, conditional (amount > threshold), ownership |

## Page-Level Permissions

| Page | View | Add | Edit | Delete | Approve | Export | Configure |
|------|------|-----|------|--------|---------|--------|-----------|
| Dashboard (Executive) | viewer+ | — | — | — | — | viewer+ | admin+ |
| Dashboard (Operations) | operator+ | — | — | — | — | operator+ | admin+ |
| Dashboard (Billing) | finance+ | — | — | — | — | finance+ | admin+ |
| Dashboard (Collections) | finance+ | — | — | — | — | finance+ | admin+ |
| Customer Explorer | viewer+ | operator+ | area_manager+ | admin+ | — | viewer+ | — |
| Customer Workspace | viewer+ | operator+ | area_manager+ | admin+ | — | viewer+ | — |
| Meter Explorer | viewer+ | operator+ | operator+ | admin+ | — | viewer+ | — |
| Meter Workspace | viewer+ | operator+ | operator+ | admin+ | — | viewer+ | — |
| Reading Explorer | viewer+ | operator+ | operator+ | admin+ | admin+ | viewer+ | — |
| Invoice Explorer | viewer+ | admin+ | finance+ | super_admin | admin+ | viewer+ | — |
| Invoice Workspace | viewer+ | admin+ | finance+ | super_admin | admin+ | viewer+ | — |
| Payment Explorer | viewer+ | finance+ | finance+ | super_admin | super_admin | viewer+ | — |
| Tariff Studio | admin+ | admin+ | admin+ | super_admin | admin+ | admin+ | admin+ |
| Bill Cycle | admin+ | admin+ | admin+ | super_admin | admin+ | — | admin+ |
| Reports | viewer+ | admin+ | admin+ | admin+ | — | viewer+ | admin+ |
| Settings | admin+ | admin+ | admin+ | super_admin | — | admin+ | admin+ |
| Upload Center | admin+ | admin+ | — | — | — | — | admin+ |
| Sync Gateway | operator+ | admin+ | — | — | — | operator+ | admin+ |
| Control Center | super_admin | super_admin | super_admin | super_admin | — | super_admin | super_admin |

## Component-Level Permissions

| Component | Visibility | Condition |
|-----------|-----------|-----------|
| Generate Invoice button | finance+ | Customer has readings for period |
| Reverse Payment button | super_admin | Payment is completed |
| Approve Reading button | admin+ | Reading is suspicious/pending |
| Transfer Ownership button | admin+ | Source != target customer |
| Edit Meter button | operator+ | Meter is not retired |
| Delete button (any entity) | admin+ | Entity has no active dependencies |
| Export button | viewer+ | Always visible |
| Import button | admin+ | Always visible |
| Settings navigation | admin+ | Always visible |

## Button-Level Permission Implementation

```typescript
// ProtectedAction component wraps every permission-gated element
<ProtectedAction permission="invoice:issue" fallback={<Tooltip content="You don't have permission to issue invoices" />}>
  <Button>Issue Invoice</Button>
</ProtectedAction>
```

## Permission Inheritance

```
Organization-level roles (super_admin, system_admin)
    ↓ inherits to
Project-level roles (admin, area_manager)
    ↓ inherits to
Area-level roles (operator, technician, finance, support, collector)
    ↓ inherits to
Self (customer — portal only)
```

Higher-level roles inherit all permissions from lower levels PLUS their own additional permissions.
