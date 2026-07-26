"use client"

import { useTheme } from "./ThemeProvider"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

const THEME_OPTIONS = [
  { id: "green-light" as const, label: "Green Light", icon: Icons.sun },
  { id: "green-dark" as const, label: "Green Dark", icon: Icons.moon },
  { id: "red-light" as const, label: "Red Light", icon: Icons.sun },
  { id: "red-dark" as const, label: "Red Dark", icon: Icons.moon },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const currentIndex = THEME_OPTIONS.findIndex(t => t.id === theme)
  const nextTheme = THEME_OPTIONS[(currentIndex + 1) % THEME_OPTIONS.length]

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(nextTheme.id)} title={`Switch to ${nextTheme.label}`}>
      <nextTheme.icon className="h-4 w-4" />
    </Button>
  )
}
