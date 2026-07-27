"use client"

import { useState } from "react"
import { AnalyticsBar } from "@/features/charts/AnalyticsBar"
import { DataToolbar, type ViewMode } from "@/features/grid/DataToolbar"

interface ChartConfig {
  title: string
  data1: { name: string; value: number }[]
  data2: { name: string; value: number }[]
  data3: { name: string; value: number }[]
}

interface ToolbarConfig {
  sortOptions?: { value: string; label: string }[]
  filterOptions?: { value: string; label: string }[]
}

interface EnhancedListPageProps {
  title: string
  description: string
  chartConfigs?: ChartConfig
  toolbarConfig?: ToolbarConfig
  children?: React.ReactNode
}

export function EnhancedListPage({ title, description, chartConfigs, toolbarConfig, children }: EnhancedListPageProps) {
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [sort, setSort] = useState<string | null>(null)
  const [filter, setFilter] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>

      {chartConfigs && (
        <AnalyticsBar
          title={chartConfigs.title}
          data1={chartConfigs.data1}
          data2={chartConfigs.data2}
          data3={chartConfigs.data3}
        />
      )}

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortOptions={toolbarConfig?.sortOptions}
        sort={sort ?? undefined}
        onSortChange={setSort}
        filterOptions={toolbarConfig?.filterOptions}
        filter={filter ?? undefined}
        onFilterChange={setFilter}
        onExport={(format) => {
          console.log(`Export as ${format}`)
        }}
      />

      {children}
    </div>
  )
}
