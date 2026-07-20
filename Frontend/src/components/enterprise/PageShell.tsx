"use client"

import { useState, type ReactNode } from "react"
import { motion } from "framer-motion"

interface Column {
  id: string
  label: string
  sortable?: boolean
}

interface PageShellProps {
  title: string
  description?: string
  icon?: string
  addLabel?: string
  onAdd?: () => void
  onSearch?: (query: string) => void
  onFilter?: (field: string, value: string) => void
  onSort?: (field: string, direction: "asc" | "desc") => void
  filters?: { label: string; field: string; options: { label: string; value: string }[] }[]
  columns?: Column[]
  searchPlaceholder?: string
  children: ReactNode
}

export function PageShell({
  title, description, icon, addLabel = "Add New",
  onAdd, onSearch, onSort, columns,
  searchPlaceholder = "Search anything...",
  children,
}: PageShellProps) {
  const [searchVal, setSearchVal] = useState("")
  const [sortField, setSortField] = useState("")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const handleSearch = (val: string) => {
    setSearchVal(val)
    onSearch?.(val)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      const dir = sortDir === "asc" ? "desc" : "asc"
      setSortDir(dir)
      onSort?.(field, dir)
    } else {
      setSortField(field)
      setSortDir("asc")
      onSort?.(field, "asc")
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with title + add button */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-raised)" }}>
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(var(--brand-rgb), 0.1)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={icon === "customers" ? "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" :
                  icon === "meters" ? "M12 2a10 10 0 1010 10M12 12l4-4M12 2v10" :
                  icon === "invoices" ? "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6" :
                  icon === "readings" ? "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" :
                  icon === "payments" ? "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" :
                  "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"} />
              </svg>
            </div>
          )}
          <div>
            <h1 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h1>
            {description && <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{description}</p>}
          </div>
        </div>
        {onAdd && (
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onAdd}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white transition-all shadow-lg"
            style={{ backgroundColor: "var(--brand)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {addLabel}
          </motion.button>
        )}
      </div>

      {/* Search + Sort toolbar */}
      {(onSearch || columns) && (
        <div className="flex items-center gap-2 px-6 py-3 border-b" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-raised)" }}>
          {onSearch && (
            <div className="relative flex-1 max-w-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={searchVal} onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none transition-all focus:border-[var(--brand)] focus:ring-1 focus:ring-[rgba(var(--brand-rgb),0.2)]"
                style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-sunken)", color: "var(--text-primary)" }}
              />
            </div>
          )}
          {columns && columns.filter(c => c.sortable).length > 0 && (
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Sort:</span>
              <select onChange={(e) => handleSort(e.target.value)} value={sortField}
                className="px-2 py-1 rounded border text-xs outline-none bg-transparent"
                style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              >
                <option value="">None</option>
                {columns.filter(c => c.sortable).map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              {sortField && (
                <button onClick={() => handleSort(sortField)} className="p-1 rounded hover:bg-black/5" title={`${sortDir === "asc" ? "Ascending" : "Descending"}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2">
                    <path d={sortDir === "asc" ? "M12 5v14M5 12l7-7 7 7" : "M12 19V5M5 12l7 7 7-7"} />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: "var(--surface-base)" }}>
        {children}
      </div>
    </div>
  )
}

