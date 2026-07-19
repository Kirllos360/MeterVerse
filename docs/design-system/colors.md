# MeterVerse Design System

## Token Architecture

### Brand (Single Source of Truth)
```
--brand: #00BFA5           ← change this to rebrand everything
  ├── --brand-hover        color-mix(85% brand + black)
  ├── --brand-rgb          0, 191, 165
  ├── --brand-primary      alias
  └── --brand-primary-rgb  alias
```

### Surface Tokens
```
--surface-base:      oklch(0.96 0.005 160)  → light: page bg
--surface-raised:     oklch(1 0 0)           → light: cards, panels
--surface-sunken:    oklch(0.92 0.005 160)  → light: input bg
--surface-topbar:    oklch(0.98 0.005 160)  → light: toolbar bg
--surface-tableHeader: oklch(0.95 0.005 160)
--surface-pop:       oklch(1 0 0)           → light: modals
```

### Text Tokens
```
--text-primary:    oklch(0.15 0.005 160)  → body text
--text-secondary:  oklch(0.45 0.005 160)  → secondary text
--text-tertiary:   oklch(0.65 0.005 160)  → metadata, labels
--text-disabled:   oklch(0.8 0.005 160)   → disabled text
```

### Border Tokens
```
--border-default: oklch(0 0 0 / 8%)    → standard borders
--border-subtle:  oklch(0 0 0 / 5%)    → subtle separators
```

### Elevation System
```
--elevation-0: transparent            → background
--elevation-1: var(--surface-base)    → page
--elevation-2: var(--surface-raised)  → cards, panels
--elevation-3: var(--surface-pop)     → modals, dialogs
--shadow-sm:  0 1px 2px rgba(0,0,0,0.04)    → cards
--shadow-md:  0 2px 8px rgba(0,0,0,0.06)    → dropdowns
--shadow-lg:  0 8px 24px rgba(0,0,0,0.08)   → modals
```

## Derived Color Families

### Sidebar (all from --brand)
```
--sidebar-background:    color-mix(22% brand + black)
--sidebar-text:          #FFFFFF
--sidebar-text-muted:    rgba(255,255,255,0.45)
--sidebar-icon:          rgba(255,255,255,0.4)
--sidebar-active:        rgba(var(--brand-rgb), 0.15)
--sidebar-selected:      var(--brand)
--sidebar-border:        rgba(255,255,255,0.06)
```

### Admin Panel
```
--admin-background:  #050505
--admin-surface:     #0A0A0A
--admin-border:      #1A1A1A
--admin-text:        #FFFFFF
--admin-accent:      var(--status-error)
```

## Color System

### Semantic Colors
```
--semantic-success: #059669    → success states
--semantic-warning: #D97706    → warning states
--semantic-error:   #DC2626    → error states
--semantic-info:    #3B82F6    → info states
```

All have RGB component variants for rgba() usage:
`--semantic-success-rgb: 5, 150, 105`

## Usage Rules

1. **Never hardcode colors** — always use CSS variables
2. **Never use white/black directly** — use `--white-rgb` / `--black-rgb` with rgba()
3. **Semantic colors for status** — never use brand colors for status indicators
4. **Surface tokens for backgrounds** — never use text colors as backgrounds
5. **Elevation over borders** — use shadows instead of borders for containers
