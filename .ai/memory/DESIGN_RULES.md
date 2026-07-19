# MeterVerse — Design Rules for AI Agents

## Color Rules
1. NEVER use hardcoded hex colors — always use `var(--xxx)` CSS variables
2. NEVER use `#FFFFFF` or `#000000` directly — use `var(--text-primary)` or `var(--text-*)` 
3. NEVER use `white` or `black` as color values — use `rgba(var(--white-rgb), X)` or `rgba(var(--black-rgb), X)`
4. ALWAYS derive sidebar/inspector/panel colors from `--brand` via `color-mix()`
5. ALWAYS use semantic tokens (`--semantic-success/error/warning`) for status indicators
6. NEVER use brand colors for status — brand is for interactive/accent elements only

## Typography Rules
1. ALWAYS use `--text-xxx` tokens (display/heading/title/body/caption/label) — never hardcoded px values
2. ALWAYS use `--weight-xxx` tokens (bold/semibold/medium/normal) — never numeric values
3. Font sizes allowed: 10px, 12px, 14px, 16px, 20px, 24px, 32px only
4. Line heights: use Tailwind defaults or `--leading-xxx` tokens

## Spacing Rules
1. ALWAYS use `--space-xxx` tokens: 4, 8, 12, 16, 24, 32, 48 — nothing else
2. Padding, margin, gap should use the spacing scale
3. NEVER use arbitrary pixel values like `p-[13px]` or `gap-[7px]`

## Radius Rules
1. `--radius-sm`: 4px — inputs, buttons, small controls
2. `--radius-md`: 8px — cards, panels (shadcn standard)
3. `--radius-lg`: 12px — dialogs, sheets (max)
4. NEVER use arbitrary radius values

## Elevation Rules
1. `--elevation-0`: background (no shadow)
2. `--elevation-1`: page content
3. `--elevation-2`: cards, panels, dropdowns
4. `--elevation-3`: modals, dialogs
5. `--shadow-sm`: cards
6. `--shadow-md`: dropdowns, popovers
7. `--shadow-lg`: modals, dialogs
8. NEVER add shadows to buttons or inputs

## Icon Rules
1. `--icon-sm`: 16px — inline with text
2. `--icon-md`: 20px — navigation
3. `--icon-lg`: 24px — buttons, empty states
4. NEVER use arbitrary icon sizes

## Focus Rules
1. ALL interactive elements must have `focus-visible:ring-[3px] focus-visible:ring-ring/50`
2. ALWAYS use `focus-visible:`, not `focus:` — preserve click appearance
3. ALL clickable elements with `onClick` must have `onKeyDown` for keyboard users

## Accessibility Rules
1. ALL form inputs must have `<label htmlFor="">` association
2. ALL icon-only buttons must have `aria-label`
3. ALL custom interactive elements must have `role` attribute
4. ALL dialogs/drawers must trap focus
5. ALL dynamic content changes must have `aria-live` regions
6. Skip-to-content link must be first focusable element
7. Color contrast must meet WCAG AA (4.5:1 for text, 3:1 for large text)

## Border Rules
1. ONLY functional borders (table rows, list items, section separators)
2. NEVER decorative borders (cards, panels, containers)
3. Use elevation/shadows instead of borders for containers
4. `--border-default` for standard separators
5. `--border-subtle` for subtle separators
