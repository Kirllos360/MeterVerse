# Theme Rules

## Theme Architecture
```
ThemeProvider (React Context)
  → Reads localStorage 'mv-theme' key
  → Sets data-theme attribute on <html>
  → Injects CSS variables via globals.css
  → Applies transition-colors for smooth switch
  
ThemeSwitcher (UI Component)
  → Dropdown/cycle button in admin header
  → Options: Green Light, Green Dark, Red Light, Red Dark
  → Persists to localStorage
  → Fires onChange event for analytics
```

## Available Themes
| Theme | ID | Purpose |
|:------|:---|:--------|
| Green Light | `green-light` | Default operational mode |
| Green Dark | `green-dark` | NOC / administrator night mode |
| Red Light | `red-light` | Executive alert mode |
| Red Dark | `red-dark` | Incident management / critical alerts |

## Token Reference
Every UI color must use `--mv-*` CSS variables. No exceptions.
See `frontend-governance.md` Section 4.1 for complete token definitions.
