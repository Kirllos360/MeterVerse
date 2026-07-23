"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

interface Command {
  id: string
  label: string
  description?: string
  icon?: string
  action: () => void
  keywords?: string[]
}

interface SearchResult {
  id: string
  _type: string
  name?: string
  serial?: string
  number?: string
  email?: string
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  const navigationCommands: Command[] = [
    { id: "nav-customers", label: "Go to Customers", description: "View all customers", action: () => router.push("/admin/customers"), keywords: ["customers", "clients"] },
    { id: "nav-meters", label: "Go to Meters", description: "View all meters", action: () => router.push("/admin/meters"), keywords: ["meters", "devices"] },
    { id: "nav-readings", label: "Go to Readings", description: "View meter readings", action: () => router.push("/admin/readings"), keywords: ["readings", "consumption"] },
    { id: "nav-invoices", label: "Go to Invoices", description: "View all invoices", action: () => router.push("/admin/invoices"), keywords: ["invoices", "bills"] },
    { id: "nav-payments", label: "Go to Payments", description: "View all payments", action: () => router.push("/admin/payments"), keywords: ["payments", "transactions"] },
    { id: "nav-tasks", label: "Go to Tasks", description: "View task board", action: () => router.push("/admin/tasks"), keywords: ["tasks", "kanban"] },
    { id: "nav-notifications", label: "Go to Notifications", description: "View notifications", action: () => router.push("/admin/notifications"), keywords: ["notifications", "alerts"] },
    { id: "nav-reports", label: "Go to Reports", description: "View reports", action: () => router.push("/admin/reports"), keywords: ["reports", "analytics"] },
    { id: "nav-settings", label: "Go to Settings", description: "System settings", action: () => router.push("/admin/settings"), keywords: ["settings", "configuration"] },
  ]

  const actionCommands: Command[] = [
    { id: "act-refresh", label: "Refresh Page", description: "Reload current page", action: () => window.location.reload(), keywords: ["refresh", "reload"] },
  ]

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Search via API
  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      try {
        const res = await apiClient<{ results: SearchResult[] }>(`/api/search?q=${encodeURIComponent(query)}&limit=5`)
        setResults(res.results || [])
      } catch { setResults([]) }
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  const allItems = [...navigationCommands, ...actionCommands]

  const filteredCommands = query.length < 2
    ? allItems
    : allItems.filter((cmd) => {
        const q = query.toLowerCase()
        return cmd.label.toLowerCase().includes(q) || cmd.keywords?.some((k) => k.includes(q))
      })

  const totalItems = filteredCommands.length + results.length

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, totalItems - 1)) }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)) }
      if (e.key === "Enter" && totalItems > 0) {
        const idx = selectedIndex
        if (idx < filteredCommands.length) {
          filteredCommands[idx].action()
        } else {
          const resultIdx = idx - filteredCommands.length
          const result = results[resultIdx]
          if (result) {
            const path = result._type === "customer" ? "customers" : result._type === "meter" ? "meters" : "invoices"
            router.push(`/admin/${path}/${result.id}`)
          }
        }
        setOpen(false)
      }
    },
    [filteredCommands, results, selectedIndex, totalItems, router]
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center border-b px-4">
          <svg className="w-4 h-4 text-muted-foreground mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            autoFocus
            type="text"
            placeholder="Search pages, customers, meters..."
            className="flex-1 py-3 outline-none text-sm bg-transparent"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
          />
          <kbd className="text-xs text-muted-foreground border rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {query.length < 2 && (
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Navigation</div>
          )}
          {filteredCommands.map((cmd, i) => (
            <button
              key={cmd.id}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${i === selectedIndex ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              onClick={() => { cmd.action(); setOpen(false) }}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <span>{cmd.label}</span>
              {cmd.description && <span className="text-xs text-muted-foreground">{cmd.description}</span>}
            </button>
          ))}

          {results.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">Search Results</div>
              {results.map((r, i) => {
                const idx = filteredCommands.length + i
                const label = r.name || r.serial || r.number || r.email || r.id.slice(0, 8)
                const typeLabel = r._type === "customer" ? "Customer" : r._type === "meter" ? "Meter" : "Invoice"
                return (
                  <button
                    key={r.id}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${idx === selectedIndex ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                    onClick={() => { const path = r._type === "customer" ? "customers" : r._type === "meter" ? "meters" : "invoices"; router.push(`/admin/${path}/${r.id}`); setOpen(false) }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <span>{label}</span>
                    <span className="text-xs text-muted-foreground">{typeLabel}</span>
                  </button>
                )
              })}
            </>
          )}

          {query.length >= 2 && filteredCommands.length === 0 && results.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">No results for &quot;{query}&quot;</p>
          )}
        </div>
      </div>
    </div>
  )
}
