"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "green-light" | "green-dark" | "red-light" | "red-dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "green-light",
  setTheme: () => {},
  toggleTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("mv-theme") as Theme | null
}

const THEMES: Theme[] = ["green-light", "green-dark", "red-light", "red-dark"]

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("green-light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = getStoredTheme()
    if (stored && THEMES.includes(stored)) {
      setThemeState(stored)
    } else {
      const prefersDark = getSystemTheme() === "dark"
      setThemeState(prefersDark ? "green-dark" : "green-light")
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme)
      localStorage.setItem("mv-theme", theme)
    }
  }, [theme, mounted])

  const setTheme = (t: Theme) => setThemeState(t)

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === "green-light") return "green-dark"
      if (prev === "green-dark") return "green-light"
      if (prev === "red-light") return "red-dark"
      return "red-light"
    })
  }

  if (!mounted) return <>{children}</>

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>
}
