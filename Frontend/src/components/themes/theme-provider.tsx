"use client"

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react"

interface ThemeContextValue {
  theme: string
  setTheme: (theme: string) => void
  resolvedTheme: string
}

const ThemeCtx = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
})

export function useTheme() {
  return useContext(ThemeCtx)
}

interface ThemeProviderProps {
  children: ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  enableColorScheme?: boolean
}

export default function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  enableColorScheme = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState("light")

  const applyTheme = (newTheme: string) => {
    let resolved = newTheme
    if (enableSystem && newTheme === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    setResolvedTheme(resolved)
    if (attribute === "class") {
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(resolved)
    }
    if (enableColorScheme) {
      document.documentElement.style.colorScheme = resolved
    }
    try {
      localStorage.setItem("theme", newTheme)
    } catch {}
  }

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme)
    applyTheme(newTheme)
  }

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const initial = stored || defaultTheme
    setThemeState(initial)
    applyTheme(initial)

    if (enableSystem) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = () => {
        if (theme === "system") applyTheme("system")
      }
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }
  }, [])

  const value = useMemo(() => ({ theme, setTheme, resolvedTheme }), [theme, resolvedTheme])

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}
