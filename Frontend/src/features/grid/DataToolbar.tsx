"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"

export type ViewMode = "grid" | "list"

interface DataToolbarProps {
  search: string
  onSearchChange: (v: string) => void
  viewMode: ViewMode
  onViewModeChange: (v: ViewMode) => void
  filterOptions?: { value: string; label: string }[]
  filter?: string
  onFilterChange?: (v: string | null) => void
  sortOptions?: { value: string; label: string }[]
  sort?: string
  onSortChange?: (v: string | null) => void
  meterTypes?: { value: string; label: string }[]
  meterType?: string
  onMeterTypeChange?: (v: string | null) => void
  onExport?: (format: "csv" | "excel" | "pdf") => void
  dateFrom?: string
  dateTo?: string
  onDateFromChange?: (v: string) => void
  onDateToChange?: (v: string) => void
}

export function DataToolbar({
  search, onSearchChange,
  viewMode, onViewModeChange,
  filterOptions, filter, onFilterChange,
  sortOptions, sort, onSortChange,
  meterTypes, meterType, onMeterTypeChange,
  onExport,
  dateFrom, dateTo, onDateFromChange, onDateToChange,
}: DataToolbarProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 rounded-xl border h-9"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>

        {onFilterChange && filterOptions && (
          <Select value={filter || "all"} onValueChange={onFilterChange}>
            <SelectTrigger className="h-9 rounded-xl text-xs gap-1 min-w-[100px]">
              <Icons.filter className="h-3.5 w-3.5" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {onSortChange && sortOptions && (
          <Select value={sort || ""} onValueChange={onSortChange}>
            <SelectTrigger className="h-9 rounded-xl text-xs gap-1 min-w-[100px]">
              <Icons.chevronsUpDown className="h-3.5 w-3.5" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {onMeterTypeChange && meterTypes && (
          <Select value={meterType || "all"} onValueChange={onMeterTypeChange}>
            <SelectTrigger className="h-9 rounded-xl text-xs gap-1 min-w-[110px]">
              <Icons.settings className="h-3.5 w-3.5" />
              <SelectValue placeholder="Meter Type" />
            </SelectTrigger>
            <SelectContent>
              {meterTypes.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {(onDateFromChange || onDateToChange) && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl text-xs gap-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Icons.calendar className="h-3.5 w-3.5" />
            Dates
          </Button>
        )}

        <div className="flex items-center border rounded-xl overflow-hidden h-9">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewModeChange("grid")}
            className={`px-2.5 h-full flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            <Icons.layoutGrid className="h-3.5 w-3.5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewModeChange("list")}
            className={`px-2.5 h-full flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            <Icons.list className="h-3.5 w-3.5" />
          </motion.button>
        </div>

        {onExport && (
          <Select onValueChange={(v: string | null) => v && onExport(v as "csv" | "excel" | "pdf")}>
            <SelectTrigger className="h-9 rounded-xl text-xs gap-1 min-w-[90px]">
              <Icons.download className="h-3.5 w-3.5" />
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {showFilters && (onDateFromChange || onDateToChange) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-center gap-2 flex-wrap"
        >
          {onDateFromChange && (
            <Input
              type="date"
              value={dateFrom || ""}
              onChange={e => onDateFromChange(e.target.value)}
              className="h-9 rounded-xl text-xs w-[150px]"
            />
          )}
          {onDateToChange && (
            <Input
              type="date"
              value={dateTo || ""}
              onChange={e => onDateToChange(e.target.value)}
              className="h-9 rounded-xl text-xs w-[150px]"
            />
          )}
        </motion.div>
      )}
    </div>
  )
}
