"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "@/hooks/use-translation"

interface SmartSearchProps {
  placeholder?: string
  onSearch?: (query: string) => void
  suggestions?: string[]
}

const SEARCH_FILTERS = [
  { id: "all", label: "All", labelAr: "الكل" },
  { id: "customers", label: "Customers", labelAr: "العملاء" },
  { id: "meters", label: "Meters", labelAr: "العدادات" },
  { id: "invoices", label: "Invoices", labelAr: "الفواتير" },
  { id: "readings", label: "Readings", labelAr: "القراءات" },
  { id: "payments", label: "Payments", labelAr: "المدفوعات" },
]

const MOCK_RESULTS: Record<string, { label: string; page: string; icon: string }[]> = {
  customers: [
    { label: "Ahmed Hassan — Residential", page: "Customers", icon: "👤" },
    { label: "Omar Corp — Commercial", page: "Customers", icon: "👤" },
    { label: "Fatima Ali — Residential", page: "Customers", icon: "👤" },
  ],
  meters: [
    { label: "M-2042 — Zone A, Building 3", page: "Meters", icon: "⚡" },
    { label: "M-1087 — Zone B, Building 1", page: "Meters", icon: "⚡" },
    { label: "M-3015 — Zone C", page: "Meters", icon: "⚡" },
  ],
  invoices: [
    { label: "INV-2024-0892 — $1,234.56", page: "Invoices", icon: "📄" },
    { label: "INV-2024-0893 — $567.89", page: "Invoices", icon: "📄" },
  ],
  readings: [
    { label: "Meter M-2042 — 4,567 kWh", page: "Readings", icon: "📊" },
    { label: "Meter M-1087 — 234 kWh", page: "Readings", icon: "📊" },
  ],
  payments: [
    { label: "PAY-2024-001 — $1,234.56", page: "Payments", icon: "💳" },
  ],
}

export function SmartSearch({ placeholder, onSearch, suggestions: _suggestions }: SmartSearchProps) {
  const { t, language } = useTranslation()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [isFocused, setIsFocused] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsFocused(false); setShowFilter(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const getResults = () => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    const results: { label: string; page: string; icon: string; filterId: string }[] = []
    for (const [key, items] of Object.entries(MOCK_RESULTS)) {
      if (filter !== "all" && filter !== key) continue
      for (const item of items) {
        if (item.label.toLowerCase().includes(q) || item.page.toLowerCase().includes(q)) {
          results.push({ ...item, filterId: key })
        }
      }
    }
    return results.slice(0, 8)
  }

  const results = getResults()
  const currentFilterLabel = SEARCH_FILTERS.find((f) => f.id === filter)

  return (
    <div ref={ref} className="relative w-full" style={{ direction: language === "ar" ? "rtl" : "ltr" }}>
      <div
        className="flex items-center rounded-xl border transition-all duration-200 overflow-hidden"
        style={{
          backgroundColor: isFocused ? "var(--surface-raised, #FFFFFF)" : "var(--surface-sunken, #F0F0F0)",
          borderColor: isFocused ? "var(--brand-primary, #00BFA5)" : "var(--border-default, #E5E5E5)",
          boxShadow: isFocused ? "0 0 0 2px rgba(0,191,165,0.15)" : "none",
        }}
      >
        {/* Filter Selector */}
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-r whitespace-nowrap transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            style={{ borderColor: "var(--border-default, #E5E5E5)", color: "var(--text-secondary, #737373)" }}
          >
            {language === "ar" ? (currentFilterLabel?.labelAr || "الكل") : (currentFilterLabel?.label || "All")}
            <motion.svg animate={{ rotate: showFilter ? 180 : 0 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></motion.svg>
          </button>
          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute top-full left-0 mt-1 w-44 rounded-xl border shadow-lg z-50 overflow-hidden"
                style={{ backgroundColor: "var(--surface-raised, #FFFFFF)", borderColor: "var(--border-default, #E5E5E5)" }}
              >
                {SEARCH_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => { setFilter(f.id); setShowFilter(false) }}
                    className="w-full px-3 py-2.5 text-sm text-left transition-colors hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2"
                    style={{
                      color: filter === f.id ? "var(--brand-primary, #00BFA5)" : "var(--text-primary, #0A0A0A)",
                      backgroundColor: filter === f.id ? "rgba(0,191,165,0.05)" : "transparent",
                    }}
                  >
                    <span>{language === "ar" ? f.labelAr : f.label}</span>
                    {filter === f.id && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00BFA5" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); onSearch?.(e.target.value) }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder || (language === "ar" ? "ابحث في أي شيء..." : "Search anything...")}
          className="flex-1 px-3 py-2 text-sm outline-none bg-transparent min-w-0"
          style={{ color: "var(--text-primary, #0A0A0A)" }}
        />

        {/* Clear */}
        {query && (
          <button onClick={() => { setQuery(""); inputRef.current?.focus() }} className="px-2 flex items-center" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        )}

        {/* Search icon */}
        <div className="px-2.5 flex items-center" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </div>
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {isFocused && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-lg z-50 overflow-hidden"
            style={{
              backgroundColor: "var(--surface-raised, #FFFFFF)",
              borderColor: "var(--border-default, #E5E5E5)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => { setQuery(r.label); inputRef.current?.blur() }}
                className="w-full px-3 py-2.5 text-sm text-left flex items-center gap-3 transition-all hover:bg-black/5 dark:hover:bg-white/10"
                style={{ borderBottom: i < results.length - 1 ? "1px solid var(--border-default, #E5E5E5)" : "none", color: "var(--text-primary, #0A0A0A)" }}
              >
                <span>{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="truncate">{r.label}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0" style={{ backgroundColor: "rgba(0,191,165,0.1)", color: "var(--brand-primary, #00BFA5)" }}>
                  {r.page}
                </span>
              </button>
            ))}
            <div className="px-3 py-2.5 text-xs font-medium" style={{ color: "var(--text-tertiary, #A3A3A3)", borderTop: "1px solid var(--border-default, #E5E5E5)" }}>
              {language === "ar" ? `ابحث في كل الصفحات عن "${query}"` : `Search in all pages for "${query}"`}
            </div>
          </motion.div>
        )}
        {isFocused && query && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-lg z-50 overflow-hidden p-4 text-center text-sm"
            style={{ backgroundColor: "var(--surface-raised, #FFFFFF)", borderColor: "var(--border-default, #E5E5E5)", color: "var(--text-tertiary, #A3A3A3)" }}
          >
            {language === "ar" ? `لا توجد نتائج لـ "${query}"` : `No results for "${query}"`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
