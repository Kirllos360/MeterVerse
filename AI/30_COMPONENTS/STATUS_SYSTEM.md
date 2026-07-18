# MeterVerse Status System

**Defines the unified status badge system used across all entities.**

---

## 1. Status Badge Component

- **Shape:** Pill-shaped (rounded-full)
- **Size:** xs (inline), sm (table cell), md (entity header)
- **Content:** Status icon + Status text label
- **Color:** Semantic color based on status category

## 2. Status Categories

| Category | Colors | Example Entities |
|----------|--------|-----------------|
| Active | Green | Active meter, paid invoice, completed reading |
| Pending | Yellow/Amber | Pending reading, issued invoice, in-review |
| Inactive | Gray | Terminated meter, cancelled invoice, archived customer |
| Problem | Red | Faulty meter, overdue invoice, rejected reading |
| Info | Blue | Offline meter, estimated reading |

## 3. Entity Status Mappings

| Entity | Statuses | Badge Colors |
|--------|----------|-------------|
| Meter | available, assigned, active, offline, faulty, replaced, terminated, retired | Green/Blue/Yellow/Red/Gray |
| Reading | valid, pending, estimated, suspicious, corrected, rejected | Green/Yellow/Blue/Red |
| Invoice | draft, issued, partially_paid, paid, overdue, cancelled | Gray/Blue/Yellow/Green/Red/Gray |
| Payment | pending, completed, reversed | Yellow/Green/Gray |
| SIM Card | 7-status lifecycle | Multi-color |
| Customer | active, suspended, archived | Green/Yellow/Gray |
| Bill Cycle | OPEN, LOCKED, APPROVED, CLOSED | Blue/Yellow/Green/Gray |

## 4. Status Badge Behavior

| Feature | Behavior |
|---------|----------|
| Color | Semantic — never decorative |
| Icon | Matches status meaning |
| Tooltip | Brief explanation on hover |
| Click | Filter by status in parent table |
| Transition | Pulse animation on status change |
| Group | Status can be grouped by category for filtering |

## 5. Status Change Notifications

When an entity's status changes:
- Toast notification to relevant users
- Activity feed entry
- Audit log entry
- Email notification (if configured)
