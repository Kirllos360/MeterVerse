"use client"

import { useCallback, useMemo } from "react"
import { useTheme } from "@/components/themes/theme-provider"
import { useThemeConfig } from "@/components/themes/active-theme"
import { THEMES, DEFAULT_THEME } from "@/components/themes/theme.config"
import { useWorkspaceStore } from "@/workspace/stores"

export type ThemeMode = "light" | "dark" | "system"

export function useThemeMode() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { activeTheme, setActiveTheme } = useThemeConfig()
  const { theme: wsTheme, setTheme: setWsTheme } = useWorkspaceStore()

  const cycleMode = useCallback(() => {
    const modes: ThemeMode[] = ["light", "dark", "system"]
    const current = (theme as ThemeMode) || "light"
    const idx = modes.indexOf(current)
    const next = modes[(idx + 1) % modes.length]

    setTheme(next)

    // Update <html> class
    document.documentElement.classList.remove("light", "dark")
    let resolved = next
    if (next === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    document.documentElement.classList.add(resolved)

    // Update color-scheme meta
    const meta = document.querySelector('meta[name="color-scheme"]') || (() => {
      const m = document.createElement("meta")
      m.name = "color-scheme"
      document.head.appendChild(m)
      return m
    })()
    meta.setAttribute("content", next === "system" ? "light dark" : next)

    localStorage.setItem("mv-color-mode", next)
  }, [theme, setTheme])

  const cycleTheme = useCallback(() => {
    const themes = THEMES
    const current = activeTheme || DEFAULT_THEME
    const idx = themes.findIndex((t) => t.value === current)
    const next = themes[(idx + 1) % themes.length].value
    setActiveTheme(next)
    setWsTheme(next)
    localStorage.setItem("mv-active-theme", next)
  }, [activeTheme, setActiveTheme, setWsTheme])

  const mode = useMemo(() => theme as ThemeMode, [theme])

  return { mode, cycleMode, activeTheme, cycleTheme, resolvedTheme }
}
