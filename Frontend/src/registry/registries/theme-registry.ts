import { BaseRegistry } from "./base-registry"
import type { Registrable } from "../contracts/base"

export interface ThemeVariables {
  "--background": string; "--foreground": string
  "--card": string; "--card-foreground": string
  "--primary": string; "--primary-foreground": string
  "--secondary": string; "--secondary-foreground": string
  "--muted": string; "--muted-foreground": string
  "--accent": string; "--accent-foreground": string
  "--destructive": string
  "--border": string; "--input": string; "--ring": string
  "--chart-1": string; "--chart-2": string; "--chart-3": string; "--chart-4": string; "--chart-5": string
  "--sidebar": string; "--sidebar-foreground": string; "--sidebar-primary": string; "--sidebar-accent": string; "--sidebar-border": string
  "--brand-primary": string; "--brand-secondary": string; "--brand-tertiary": string
  "--status-success": string; "--status-warning": string; "--status-error": string; "--status-pending": string
  "--energy-import": string; "--energy-export": string; "--energy-combined": string
  "--font-sans": string; "--font-mono": string; "--radius": string
  [key: string]: string
}

export interface ThemeRegistration extends Registrable {
  variables: ThemeVariables
  modes: ("light" | "dark")[]
  previewColor: string
  isBuiltin?: boolean
}

export class ThemeRegistry extends BaseRegistry<ThemeRegistration> {
  private _activeTheme: string = "whatsapp"
  private _currentMode: "light" | "dark" = "light"

  constructor() { super("theme-registry", "Theme Registry") }

  setActiveTheme(themeId: string): void { this._activeTheme = themeId }
  getActiveTheme(): ThemeRegistration { return this.get(this._activeTheme) || this.getAll()[0] }
  setMode(mode: "light" | "dark"): void { this._currentMode = mode }
  getCurrentMode(): "light" | "dark" { return this._currentMode }
  getByMode(mode: "light" | "dark"): ThemeRegistration[] { return this.getAll().filter((t) => t.modes.includes(mode)) }

  applyTheme(themeId: string): void {
    const theme = this.get(themeId)
    if (!theme) return
    const root = document.documentElement
    for (const [key, value] of Object.entries(theme.variables)) {
      root.style.setProperty(key, value)
    }
    root.setAttribute("data-theme", themeId)
    root.classList.remove("light", "dark")
    root.classList.add(this._currentMode)
    this._activeTheme = themeId
  }
}
