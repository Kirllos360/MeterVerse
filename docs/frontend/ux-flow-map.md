# UX Flow Map

## Admin Portal (25 nav items)

### Primary Flows
```
Login → Admin Dashboard (/admin)
         ├── Home               → Stats, quick links, recent activity
         ├── Users              → List → Create/Edit → Permissions
         ├── Roles              → List → Create/Edit → Permission matrix
         ├── Audit              → List → Filter by action/actor
         │
         ├── Customers          → List → Detail → Edit → Assign meter
         ├── Meters             → List → Detail → Terminate
         ├── Meter Relay        → List → 11 actions per meter
         ├── Meter Assignments  → List → Create → Conflict detection
         │
         ├── Projects           → List → Create → Zones → Units
         ├── Zones              → List → Create (linked to Project)
         ├── Units              → List → Create (linked to Zone)
         │
         ├── Readings           → List → Create → Validate
         ├── Consumption        → Period view
         ├── Batch Validation   → Review queue → Approve/Reject
         │
         ├── Invoices           → List → Generate → Issue → Adjust
         ├── Payments           → List → Create → Reverse/Refund
         ├── Tariffs            → List → Create → Rates → Tiers
         ├── SIM Cards          → List → Assign → Release
         │
         ├── Settings           → System configuration
         ├── Reports            → Export → Download
         ├── Services           → Email/SMS/Push status
         ├── Security           → Audit checks
         ├── AI                 → Chat, forecasting, analysis
         └── Monitoring         → Health, metrics, performance
```

### Key UX Patterns
- **List/Detail**: GenericAdminPage → entity-specific detail page
- **Create/Edit**: Slide-out Sheet (shadcn) with form fields
- **Confirmation**: AlertDialog for destructive actions
- **Toast**: sonner for success/error notifications
- **Loading**: Skeleton animation (shadcn)
- **Empty**: "No records found" with contextual message
- **Error**: Error card with retry button
