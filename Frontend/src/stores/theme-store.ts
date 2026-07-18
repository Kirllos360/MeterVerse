"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ThemeMode, ThemeConfig } from "@/design-system/theme"

interface ThemeState extends ThemeConfig {
  resolvedMode: "light" | "dark" | "gray" | "night" | "highContrast"
  setMode: (mode: ThemeMode) => void
  setDensity: (density: ThemeConfig["density"]) => void
  toggleDirection: () => void
  toggleReducedMotion: () => void
  setFontSize: (size: number) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarMode: (mode: ThemeConfig["sidebarMode"]) => void
  reset: () => void
}

function resolveTheme(mode: ThemeMode): ThemeState["resolvedMode"] {
  if (mode !== "adaptive") return mode
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

const defaults: ThemeConfig = {
  mode: "adaptive",
  density: "comfortable",
  direction: "ltr",
  reducedMotion: false,
  fontSize: 1,
  sidebarCollapsed: false,
  sidebarMode: "expanded",
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      ...defaults,
      resolvedMode: resolveTheme(defaults.mode),
      setMode: (mode) => set({ mode, resolvedMode: resolveTheme(mode) }),
      setDensity: (density) => set({ density }),
      toggleDirection: () => set((s) => ({ direction: s.direction === "ltr" ? "rtl" : "ltr" })),
      toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
      setFontSize: (fontSize) => set({ fontSize: Math.max(0.75, Math.min(1.5, fontSize)) }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed, sidebarMode: collapsed ? "collapsed" : "expanded" }),
      setSidebarMode: (sidebarMode) => set({ sidebarMode, sidebarCollapsed: sidebarMode !== "expanded" }),
      reset: () => set({ ...defaults, resolvedMode: resolveTheme(defaults.mode) }),
    }),
    {
      name: "meterverse-theme",
      partialize: (state) => ({
        mode: state.mode,
        density: state.density,
        direction: state.direction,
        reducedMotion: state.reducedMotion,
        fontSize: state.fontSize,
        sidebarMode: state.sidebarMode,
      }),
    }
  )
)
