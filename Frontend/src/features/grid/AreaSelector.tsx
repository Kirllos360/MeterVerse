"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icons } from "@/components/icons"

interface Area {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
  areaId: string
}

interface AreaSelectorProps {
  areas: Area[]
  projects: Project[]
  onAreaChange?: (areaId: string) => void
  onProjectChange?: (projectId: string) => void
}

export function AreaSelector({ areas, projects, onAreaChange, onProjectChange }: AreaSelectorProps) {
  const [selectedAreaId, setSelectedAreaId] = useState<string>(areas[0]?.id ?? "")
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const selectedArea = areas.find((a) => a.id === selectedAreaId)
  const areaProjects = projects.filter((p) => p.areaId === selectedAreaId)

  const handleAreaChange = (id: string | null) => {
    if (!id) return
    setSelectedAreaId(id)
    setSelectedProjectId("")
    onAreaChange?.(id)
  }

  const handleProjectChange = (id: string | null) => {
    if (!id) return
    setSelectedProjectId(id)
    onProjectChange?.(id)
  }

  return (
    <div
      className="rounded-2xl border p-4 flex items-center gap-4"
      style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Icons.building className="h-4 w-4 shrink-0" style={{ color: "var(--brand)" }} />
        {areas.length > 1 ? (
          <Select value={selectedAreaId} onValueChange={handleAreaChange}>
            <SelectTrigger className="h-8 rounded-xl border-0 bg-transparent text-sm font-semibold gap-1 px-2 min-w-[120px]">
              <SelectValue placeholder="Select area" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            {selectedArea?.name ?? "No area"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <Icons.map className="h-4 w-4 shrink-0" style={{ color: "var(--brand)" }} />
        {areaProjects.length > 1 ? (
          <Select value={selectedProjectId} onValueChange={handleProjectChange}>
            <SelectTrigger className="h-8 rounded-xl border-0 bg-transparent text-sm font-semibold gap-1 px-2 min-w-[120px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {areaProjects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : areaProjects.length === 1 ? (
          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            {areaProjects[0].name}
          </span>
        ) : (
          <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>No projects</span>
        )}
      </div>
    </div>
  )
}
