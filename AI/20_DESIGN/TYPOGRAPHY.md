# MeterVerse Typography System

**Defines the complete typography scale, font selections, and usage rules.**

---

## 1. Font Stack

| Usage | Font | Fallback |
|-------|------|----------|
| UI (Latin) | Inter | system-ui, sans-serif |
| UI (Arabic) | Cairo | system-ui, sans-serif |
| Monospace | JetBrains Mono | monospace |

## 2. Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| text-xs | 12px | 16px | 400/500/600 | Captions, labels, badges |
| text-sm | 14px | 20px | 400/500/600 | Body text, table cells |
| text-base | 16px | 24px | 400/500/600 | Large body text, inputs |
| text-lg | 18px | 28px | 500/600/700 | Section headings |
| text-xl | 20px | 28px | 600/700 | Sub-page titles |
| text-2xl | 24px | 32px | 600/700 | Page titles |
| text-3xl | 30px | 36px | 700 | Dashboard headings |
| text-4xl | 36px | 40px | 700 | Hero metrics |
| text-5xl | 48px | 48px | 700 | Display metrics |

## 3. Font Weights

| Weight | Variable Name | Usage |
|--------|--------------|-------|
| 400 | --font-normal | Body text, descriptions |
| 500 | --font-medium | Labels, table headers |
| 600 | --font-semibold | Card titles, section headings |
| 700 | --font-bold | Page titles, KPIs, stats |

## 4. Arabic Typography

Arabic text uses Cairo font with these adjustments:
- Line height: +0.125rem (wider than Latin for readability)
- Font weight: one level lighter than Latin equivalent (Arabic characters are denser)
- RTL-aware: text-align, direction, and padding/margin flip automatically
- Numbers: use Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) in Arabic mode

## 5. Monospace Usage

JetBrains Mono used for:
- Meter serial numbers
- SIM card ICCID
- IP addresses
- SQL queries in admin console
- Code snippets
- API endpoint displays
- Technical identifiers

## 6. Typography Rules

| Rule | Application |
|------|-------------|
| Maximum line length | 80 characters for body text, unlimited for data tables |
| Heading hierarchy | Only one H1 per page. H2 for sections. H3 for sub-sections. |
| Link text | Always underlined, brand-600 color, brand-700 on hover |
| Disabled text | text-text-tertiary, opacity may be reduced |
| Truncation | Single-line with ellipsis. Tooltip on hover for full text. |
| Text selection | Brand-200 background for selected text |
