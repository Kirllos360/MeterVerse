# DESIGN_TOKEN_USAGE.md
**Project:** MeterVerse MVEOS

### PRIMARY TOKENS (Green Forest Foundation)
- `--color-primary`: #10B981 (Emerald Green - Action)
- `--color-primary-dark`: #064E3B (Forest Green - Structure)
- `--color-surface-light`: #F4FBF4 (Warm White - Light Mode)
- `--color-surface-dark`: #0D1510 (Deep Charcoal - Dark Mode)
- `--color-danger`: #FC7C78 (Industrial Red)
- `--color-warning`: #FBBF24 (Warm Amber)

### GEOMETRY TOKENS
- `--radius-action`: 10px (Buttons, Inputs)
- `--radius-container`: 16px (Cards, Sections)
- `--radius-overlay`: 20px (Modals, Drawers)

### SPACING TOKENS
- `--space-margin-desktop`: 32px
- `--space-grid-gap`: 24px
- `--space-row-density`: 12px (High density for tables)

### TYPOGRAPHY TOKENS
- `--font-primary`: Hanken Grotesk
- `--font-tabular`: JetBrains Mono (For all numerical data)
- `--weight-headline`: 700 (Bold)
- `--weight-body`: 400 (Regular)

---
**Standard Usage:** Use `tabular-nums` for all Meter IDs, Consumption values, and Invoices to prevent UI jitter during updates.