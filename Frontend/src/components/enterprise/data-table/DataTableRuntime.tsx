"use client"

import { useState, useMemo, type ReactNode } from "react"
import { useWorkspaceStore } from "@/workspace/stores"

export interface Column<T> {
  id: string
  header: string
  accessor: (row: T) => ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: number
  minWidth?: number
  hidden?: boolean
  pinned?: "left" | "right"
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  pageSize?: number
  selectable?: boolean
  stickyHeader?: boolean
  density?: "comfortable" | "compact" | "ultraCompact"
  onRowClick?: (row: T) => void
  emptyMessage?: string
}

export function DataTableRuntime<T extends { id: string | number }>({
  columns,
  data,
  pageSize = 25,
  selectable = false,
  stickyHeader = true,
  density: densityProp,
  onRowClick,
  emptyMessage = "No data to display",
}: DataTableProps<T>) {
  const [page, setPage] = useState(0)
  const [pageSz, setPageSz] = useState(pageSize)
  const [selected, setSelected] = useState<Set<string | number>>(new Set())
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [search, setSearch] = useState("")
  const [colWidths, setColWidths] = useState<Record<string, number>>({})
  const { density: globalDensity } = useWorkspaceStore()
  const density = densityProp || globalDensity

  const visibleCols = useMemo(() => columns.filter((c) => !c.hidden), [columns])

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      visibleCols.some((col) => {
        const val = col.accessor(row)
        return String(val ?? "").toLowerCase().includes(q)
      })
    )
  }, [data, search, visibleCols])

  const sorted = useMemo(() => {
    if (!sortCol) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = String(columns.find((c) => c.id === sortCol)?.accessor(a) ?? "")
      const bVal = String(columns.find((c) => c.id === sortCol)?.accessor(b) ?? "")
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    })
  }, [filtered, sortCol, sortDir, columns])

  const totalPages = Math.ceil(sorted.length / pageSz)
  const pageData = sorted.slice(page * pageSz, (page + 1) * pageSz)

  const toggleSort = (colId: string) => {
    if (sortCol === colId) { setSortDir(sortDir === "asc" ? "desc" : "asc") }
    else { setSortCol(colId); setSortDir("asc") }
  }

  const toggleAll = () => {
    if (selected.size === pageData.length) { setSelected(new Set()) }
    else { setSelected(new Set(pageData.map((r) => r.id))) }
  }

  const toggleRow = (id: string | number) => {
    const next = new Set(selected)
    if (next.has(id)) { next.delete(id) } else { next.add(id) }
    setSelected(next)
  }

  const rowH = density === "ultraCompact" ? 32 : density === "compact" ? 40 : 48
  const cellPad = density === "ultraCompact" ? "4px 8px" : density === "compact" ? "6px 10px" : "10px 12px"
  const fontSize = density === "ultraCompact" ? "12px" : density === "compact" ? "13px" : "14px"

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border" style={{ borderColor: "var(--border-default, #E5E5E5)" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b" style={{ borderColor: "var(--border-default, #E5E5E5)", backgroundColor: "var(--surface-raised, #FFFFFF)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          placeholder="Search..." aria-label="Search table" className="flex-1 bg-transparent text-sm outline-none min-w-0" style={{ color: "var(--text-primary, #0A0A0A)" }}
        />
        <span className="text-xs shrink-0" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>{sorted.length} items</span>
      </div>

      {/* Table container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse" style={{ fontSize }}>
          <thead>
            <tr className="sticky top-0 z-10" style={{ backgroundColor: "var(--surface-tableHeader, #F5F5F5)" }}>
              {selectable && (
                <th className="p-2 text-center border-r" style={{ width: 40, borderColor: "var(--border-default, #E5E5E5)" }}>
                  <input type="checkbox" checked={selected.size === pageData.length && pageData.length > 0} onChange={toggleAll} className="cursor-pointer" aria-label="Select all" />
                </th>
              )}
              {visibleCols.map((col) => (
                <th
                  key={col.id}
                  onClick={() => col.sortable && toggleSort(col.id)}
                  className="text-left font-medium border-r cursor-pointer select-none"
                  style={{
                    padding: cellPad,
                    width: colWidths[col.id] || col.width,
                    minWidth: col.minWidth || 60,
                    color: "var(--text-secondary, #737373)",
                    borderColor: "var(--border-default, #E5E5E5)",
                    fontSize: "12px",
                    position: col.pinned ? "sticky" : undefined,
                    left: col.pinned === "left" ? (selectable ? 40 : 0) : undefined,
                    zIndex: col.pinned ? 11 : undefined,
                    backgroundColor: col.pinned ? "var(--surface-tableHeader, #F5F5F5)" : undefined,
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span className="truncate">{col.header}</span>
                    {sortCol === col.id && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00BFA5" strokeWidth="2">
                        <path d={sortDir === "asc" ? "M12 5v14M5 12l7-7 7 7" : "M12 19V5M5 12l7 7 7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + (selectable ? 1 : 0)} className="text-center py-12 text-sm" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className="transition-colors cursor-pointer"
                  style={{ backgroundColor: selected.has(row.id) ? "rgba(0,191,165,0.05)" : "transparent" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-hover, #F5F5F5)" }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = selected.has(row.id) ? "rgba(0,191,165,0.05)" : "transparent" }}
                >
                  {selectable && (
                    <td className="p-2 text-center border-r" style={{ borderColor: "var(--border-default, #E5E5E5)" }}>
                      <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} className="cursor-pointer" aria-label={`Select row ${row.id}`} />
                    </td>
                  )}
                  {visibleCols.map((col) => (
                    <td
                      key={col.id}
                      className="border-r"
                      style={{
                        padding: cellPad,
                        borderColor: "var(--border-default, #E5E5E5)",
                        position: col.pinned ? "sticky" : undefined,
                        left: col.pinned === "left" ? (selectable ? 40 : 0) : undefined,
                        zIndex: col.pinned ? 1 : undefined,
                        backgroundColor: col.pinned ? "var(--surface-raised, #FFFFFF)" : undefined,
                      }}
                    >
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-3 py-2 border-t" style={{ borderColor: "var(--border-default, #E5E5E5)", backgroundColor: "var(--surface-raised, #FFFFFF)" }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>
          <span>Rows:</span>
          <select value={pageSz} onChange={(e) => { setPageSz(Number(e.target.value)); setPage(0) }}
            className="bg-transparent border rounded px-1 py-0.5 text-xs outline-none"
            style={{ borderColor: "var(--border-default, #E5E5E5)", color: "var(--text-primary, #0A0A0A)" }}
          >
            {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <PageButton label="‹" disabled={page === 0} onClick={() => setPage(page - 1)} />
          {Array.from({ length: totalPages }, (_, i) => (
            <PageButton key={i} label={String(i + 1)} active={page === i} onClick={() => setPage(i)} />
          ))}
          <PageButton label="›" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} />
        </div>
      </div>
    </div>
  )
}

function PageButton({ label, active, disabled, onClick }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors disabled:opacity-30"
      style={{ backgroundColor: active ? "#00BFA5" : "transparent", color: active ? "white" : "var(--text-secondary, #737373)" }}
    >
      {label}
    </button>
  )
}
