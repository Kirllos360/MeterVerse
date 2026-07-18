"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useWorkspaceStore } from "@/workspace/stores"
import { useTranslation } from "@/hooks/use-translation"

const SEARCH_CATEGORIES = ["all", "customers", "meters", "invoices", "readings", "payments"]

export function GlobalSearch() {
  const { t, language } = useTranslation()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [isFocused, setIsFocused] = useState(false)
  const [showCatDropdown, setShowCatDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsFocused(false); setShowCatDropdown(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const suggestions = query.length > 0 ? [
    { label: `${t("common.searchIn", "Search in")} ${t("nav.customers", "Customers")}`, icon: "👤" },
    { label: `${t("common.searchIn", "Search in")} ${t("nav.meters", "Meters")}`, icon: "⚡" },
    { label: `${t("common.searchIn", "Search in")} ${t("nav.invoices", "Invoices")}`, icon: "📄" },
  ] : []

  return (
    <div ref={ref} className="relative w-full" style={{ direction: language === "ar" ? "rtl" : "ltr" }}>
      <div className={`flex items-center rounded-xl border transition-all duration-200 overflow-hidden`}
        style={{
          backgroundColor: isFocused ? "var(--surface-raised, #FFFFFF)" : "var(--surface-sunken, #F0F0F0)",
          borderColor: isFocused ? "#00BFA5" : "var(--border-default, #E5E5E5)",
          boxShadow: isFocused ? "0 0 0 2px rgba(0,191,165,0.15)" : "none",
        }}
      >
        <div className="relative">
          <button onClick={() => setShowCatDropdown(!showCatDropdown)}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium border-r whitespace-nowrap transition-colors hover:bg-black/5"
            style={{ borderColor: "var(--border-default, #E5E5E5)", color: "var(--text-secondary, #737373)" }}
          >
            {category === "all" ? (language === "ar" ? "الكل" : "All") : t(`nav.${category}`, category)}
            <motion.svg animate={{ rotate: showCatDropdown ? 180 : 0 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></motion.svg>
          </button>
          <AnimatePresence>
            {showCatDropdown && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 mt-1 w-40 rounded-xl border shadow-lg z-50 overflow-hidden"
                style={{ backgroundColor: "var(--surface-raised, #FFFFFF)", borderColor: "var(--border-default, #E5E5E5)" }}>
                {SEARCH_CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => { setCategory(cat); setShowCatDropdown(false) }}
                    className="w-full px-3 py-2.5 text-sm text-left transition-colors hover:bg-black/5 flex items-center gap-2"
                    style={{ color: category === cat ? "#00BFA5" : "var(--text-primary, #0A0A0A)", backgroundColor: category === cat ? "rgba(0,191,165,0.05)" : "transparent" }}>
                    {cat === "all" ? (language === "ar" ? "الكل" : "All") : `${t(`nav.${cat}`, cat)}`}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={category === "all"
            ? (language === "ar" ? "ابحث في أي شيء..." : "Search anything...")
            : `${language === "ar" ? "ابحث في" : "Search"} ${t(`nav.${category}`, category)}...`}
          className="flex-1 px-3 py-2 text-sm outline-none bg-transparent min-w-0"
          style={{ color: "var(--text-primary, #0A0A0A)" }}
        />

        {query && (
          <button onClick={() => { setQuery(""); inputRef.current?.focus() }} className="px-2 flex items-center" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
        <div className="px-2.5 flex items-center" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
      </div>

      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-lg z-50 overflow-hidden"
            style={{ backgroundColor: "var(--surface-raised, #FFFFFF)", borderColor: "var(--border-default, #E5E5E5)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => { setQuery(""); inputRef.current?.blur() }}
                className="w-full px-3 py-2.5 text-sm text-left flex items-center gap-2 transition-all hover:bg-black/5"
                style={{ color: "var(--text-primary, #0A0A0A)", borderBottom: i < suggestions.length - 1 ? "1px solid var(--border-default, #E5E5E5)" : "none" }}>
                <span>{s.icon}</span><span>{s.label}</span>
              </button>
            ))}
            <div className="px-3 py-2.5 text-xs font-medium" style={{ color: "var(--text-tertiary, #A3A3A3)", borderTop: "1px solid var(--border-default, #E5E5E5)" }}>
              {language === "ar" ? `ابحث في كل الصفحات عن "${query}"` : `Search in all pages for "${query}"`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
