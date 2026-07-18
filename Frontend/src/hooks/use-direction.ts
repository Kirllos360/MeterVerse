"use client"

import { useEffect, useCallback } from "react"
import { useWorkspaceStore } from "@/workspace/stores"

const ARABIC_FONT = "'Cairo', 'Noto Sans Arabic', 'Tajawal', sans-serif"
const ENGLISH_FONT = "'Geist', 'Inter', system-ui, -apple-system, sans-serif"

export function useDirection() {
  const { language, setLanguage } = useWorkspaceStore()
  const dir = language === "ar" ? "rtl" : "ltr"

  const applyDirection = useCallback((lang: string) => {
    const isRtl = lang === "ar"
    const d = isRtl ? "rtl" : "ltr"

    document.documentElement.setAttribute("dir", d)
    document.documentElement.classList.remove("rtl", "ltr")
    document.documentElement.classList.add(d)

    // Apply appropriate font
    document.documentElement.style.setProperty("--font-sans", isRtl ? ARABIC_FONT : ENGLISH_FONT)
    document.documentElement.style.fontFamily = isRtl ? ARABIC_FONT : ENGLISH_FONT

    localStorage.setItem("mv-language", lang)
  }, [])

  const toggleLanguage = useCallback(() => {
    const next = language === "en" ? "ar" : "en"
    setLanguage(next)
    applyDirection(next)
  }, [language, setLanguage, applyDirection])

  useEffect(() => {
    const stored = localStorage.getItem("mv-language") || language
    const resolved = stored === "ar" ? "ar" : "en"
    if (resolved !== language) setLanguage(resolved)
    applyDirection(resolved)
  }, [])

  return { dir, language, toggleLanguage, setLanguage, applyDirection }
}
