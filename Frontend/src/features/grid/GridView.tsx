"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import type { ColumnConfig } from "@/admin/tables/page-config"

interface GridViewProps {
  data: any[]
  columns: ColumnConfig[]
  onAction?: (action: string, row: any) => void
  rowsPerPage?: number
}

const defaultBadgeVariant = (v: string) => {
  const map: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    active: "default", inactive: "secondary", maintenance: "outline", terminated: "destructive",
    completed: "default", pending: "secondary", failed: "destructive", cancelled: "outline",
    paid: "default", overdue: "destructive", available: "default", assigned: "secondary",
    faulty: "destructive", retired: "outline",
  }
  return map[v?.toLowerCase()] || "outline"
}

export function GridView({ data, columns, onAction, rowsPerPage = 12 }: GridViewProps) {
  const [page, setPage] = useState(1)

  const labelCols = columns.filter(c => c.type !== "status" && c.type !== "badge")
  const statusCol = columns.find(c => c.type === "status" || c.type === "badge")

  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage))
  const paged = useMemo(() => data.slice((page - 1) * rowsPerPage, page * rowsPerPage), [data, page, rowsPerPage])

  const getCardValue = (row: any, cols: ColumnConfig[]) => {
    for (const c of cols) {
      const val = c.accessor(row)
      if (val && val !== "—") return val
    }
    return ""
  }

  const getCardLabel = (row: any, cols: ColumnConfig[]) => {
    const fallback = cols.find(c => c.type === "email" || c.id === "email")
    if (fallback) {
      const v = fallback.accessor(row)
      if (v && v !== "—") return v
    }
    for (const c of cols) {
      const val = c.accessor(row)
      if (val && val !== "—" && val !== getCardValue(row, cols)) return val
    }
    return ""
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
              No records found.
            </div>
          ) : paged.map((row: any, idx: number) => {
            const rid = row.id || row[columns[0]?.id] || `grid-${idx}`
            const primary = getCardValue(row, labelCols)
            const secondary = getCardLabel(row, labelCols)
            const statusVal = statusCol ? statusCol.accessor(row) : null
            const statusVariant = statusCol?.badgeVariant?.(statusVal) || defaultBadgeVariant(statusVal)

            return (
              <motion.div
                key={rid}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{primary || "—"}</p>
                        {secondary && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{secondary}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {statusVal && (
                          <Badge variant={statusVariant} className="capitalize text-[10px] px-2 py-0.5">
                            {statusVal}
                          </Badge>
                        )}
                        {onAction && (
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger render={<Button variant="ghost" className="h-7 w-7 p-0" />}>
                              <Icons.ellipsis className="h-3.5 w-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[120px]">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-[10px]">Actions</DropdownMenuLabel>
                              </DropdownMenuGroup>
                              <DropdownMenuItem onClick={() => onAction("view", row)}>
                                <Icons.eyeOff className="mr-2 h-3.5 w-3.5" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onAction("edit", row)}>
                                <Icons.edit className="mr-2 h-3.5 w-3.5" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onAction("delete", row)} className="text-destructive">
                                <Icons.trash className="mr-2 h-3.5 w-3.5" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {columns.filter(c => c.accessor(row) && c.accessor(row) !== primary && c.accessor(row) !== secondary && c.id !== statusCol?.id).slice(0, 4).map(col => (
                        <div key={col.id}>
                          <span className="text-muted-foreground block truncate">{col.header}</span>
                          <span className="font-medium truncate block">{col.accessor(row) ?? "—"}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </AnimatePresence>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 py-2 text-xs text-muted-foreground">
          <span>{data.length} records · page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              <Icons.chevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4))
              const p = start + i
              return p <= totalPages ? (
                <Button key={p} variant={p === page ? "default" : "ghost"} size="sm" className="w-8 h-8 p-0 text-xs" onClick={() => setPage(p)}>{p}</Button>
              ) : null
            })}
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              <Icons.chevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
