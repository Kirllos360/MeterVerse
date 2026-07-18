export type ThemeMode = "light" | "dark" | "gray" | "night" | "highContrast" | "adaptive"

export interface ThemeConfig {
  mode: ThemeMode
  density: "comfortable" | "compact" | "ultraCompact"
  direction: "ltr" | "rtl"
  reducedMotion: boolean
  fontSize: number
  sidebarCollapsed: boolean
  sidebarMode: "expanded" | "collapsed" | "dock" | "floating"
}

export const themeDefaults: ThemeConfig = {
  mode: "adaptive",
  density: "comfortable",
  direction: "ltr",
  reducedMotion: false,
  fontSize: 1,
  sidebarCollapsed: false,
  sidebarMode: "expanded",
}

export const themeModes: ThemeMode[] = ["light", "dark", "gray", "night", "highContrast", "adaptive"]

export const themeColors = {
  light: { bg: "#FAFAFA", text: "#0A0A0A", brand: "#00BFA5" },
  dark: { bg: "#0A0A0A", text: "#FAFAFA", brand: "#4DD0C0" },
  gray: { bg: "#F2F2F2", text: "#1A1A1A", brand: "#00A88F" },
  night: { bg: "#050505", text: "#E0E0E0", brand: "#4DD0C0" },
  highContrast: { bg: "#FFFFFF", text: "#000000", brand: "#006351" },
} as const
