# MeterVerse Form DNA

**Defines form behavior, validation, layout, and user guidance.**

---

## 1. Form Archetypes

| Type | Use Case | Layout |
|------|----------|--------|
| Inline | Quick create/edit in table row | Single row |
| Dialog | Simple create/edit (5-10 fields) | Centered dialog |
| Full page | Complex create/edit (10+ fields) | Full page |
| Wizard | Multi-step workflows | Step indicator + content |
| Search | Filter and search | Collapsible panel |
| Bulk edit | Edit multiple entities at once | Dialog with entity list |

## 2. Form Validation

- **Inline validation** — validates on blur, shows error below field
- **Submit validation** — validates all fields on submit, scrolls to first error
- **Real-time validation** — only for dependent fields (e.g., password confirmation)
- **Business rule validation** — validates against backend rules on submit

| Validation State | Visual |
|-----------------|--------|
| Valid | No indicator (default) |
| Invalid | Red border + error message below field |
| Warning | Yellow border + warning message below field |
| Validating | Spinner icon in field |
| Success | Green checkmark after async validation |

## 3. Form Field Types

| Field Type | Component | Usage |
|-----------|-----------|-------|
| Text | Input | Short text, names, codes |
| Textarea | Textarea | Long text, notes, descriptions |
| Number | Input type="number" | Numeric values |
| Select | Select | Single choice from list |
| Multi Select | Select multiple | Multiple choices |
| Search Select | Combobox | Search + select from large list |
| Date | Calendar popover | Date selection |
| Date Range | Calendar range | Date range selection |
| Switch | Switch | Boolean toggle |
| Checkbox | Checkbox | Multiple selection |
| Radio | RadioGroup | Single choice from few options |
| File Upload | Drag-and-drop zone | File upload |
| Currency | Input + currency prefix | Monetary values |
| Password | Input type="password" + toggle | Password entry |

## 4. Form Layout

| Layout | Desktop | Mobile |
|--------|---------|--------|
| Single column | 1 column | 1 column |
| Two column | 2 columns | 1 column |
| Three column | 3 columns | 1 column |
| Inline | Horizontal | Stacked vertical |

## 5. Form Guidance

- **Labels:** Always visible above the input (not placeholder)
- **Helper text:** Below input for explanation
- **Required indicator:** Asterisk + "(required)" text
- **Character count:** Below input for limited-length fields
- **Section dividers:** Separators for form sections
- **Tooltips:** Question mark icon with hover tooltip for complex fields

## 6. Form Actions

| Action | Button | Position |
|--------|--------|----------|
| Submit | Primary button | Bottom-right |
| Cancel | Secondary button | Bottom-right, before submit |
| Reset | Ghost/link | Bottom-left |
| Save draft | Secondary button | Bottom-left |

## 7. Wizard Form Rules

- Progress indicator at top showing steps
- "Next" and "Previous" buttons at bottom
- Each step validates before allowing forward
- Summary step before final submission
- Can save as draft and resume later
- Breadcrumb navigation between steps
