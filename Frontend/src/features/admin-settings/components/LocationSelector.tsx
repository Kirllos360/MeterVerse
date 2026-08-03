"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAdminStore } from "@/stores/admin-store"
import { apiClient } from "@/lib/api-client"

interface Area { name: string; code: string; meterCount: number }
interface Project { id: string; name: string; zoneCount: number }
interface Zone { id: string; name: string; code: string; unitCount: number }

export function LocationSelector() {
  const { location, setArea, setProject, setZone, setUnitType } = useAdminStore()
  const [areas, setAreas] = useState<Area[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [unitTypes, setUnitTypes] = useState<string[]>([])
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load areas on mount
  useEffect(() => {
    apiClient<{ areas: Area[] }>("/locations/areas").then(d => setAreas(d.areas || [])).catch(() => {})
    apiClient<{ types: { type: string }[] }>("/locations/unit-types").then(d => setUnitTypes((d.types || []).map(t => t.type))).catch(() => {})
  }, [])

  // Load projects when area changes
  useEffect(() => {
    if (!location.selectedArea) { setProjects([]); return }
    apiClient<{ projects: Project[] }>(`/locations/areas/${encodeURIComponent(location.selectedArea)}/projects`)
      .then(d => setProjects(d.projects || [])).catch(() => {})
  }, [location.selectedArea])

  // Load zones when project changes
  useEffect(() => {
    if (!location.selectedProject) { setZones([]); return }
    apiClient<{ zones: Zone[] }>(`/locations/projects/${location.selectedProject.id}/zones`)
      .then(d => setZones(d.zones || [])).catch(() => {})
  }, [location.selectedProject])

  // Close on outside click
  useEffect(() => {
    if (!openDropdown) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpenDropdown(null)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [openDropdown])

  const selectors = [
    { key: "area", label: "Area", value: location.selectedArea, items: areas.map(a => ({ id: a.name, name: a.name })), onChange: (v: string) => setArea(v) },
    { key: "project", label: "Project", value: location.selectedProject?.name || null, items: projects.map(p => ({ id: p.id, name: p.name })), onChange: (v: string) => setProject(projects.find(p => p.id === v) || null), disabled: !location.selectedArea },
    { key: "zone", label: "Zone", value: location.selectedZone?.name || null, items: zones.map(z => ({ id: z.id, name: z.name })), onChange: (v: string) => setZone(zones.find(z => z.id === v) || null), disabled: !location.selectedProject },
  ]

  return (
    <div ref={dropdownRef} className="flex items-center gap-2">
      {selectors.map(s => (
        <div key={s.key} className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === s.key ? null : s.key)}
            disabled={s.disabled}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all hover:opacity-85"
            style={{
              backgroundColor: s.value ? "var(--brand)" : "var(--surface-topbar)",
              borderColor: s.value ? "var(--brand)" : "var(--border-default)",
              color: s.value ? "#FFFFFF" : "var(--text-secondary)",
              opacity: s.disabled ? 0.4 : 1,
            }}
          >
            <span>{s.value || s.label}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          <AnimatePresence>
            {openDropdown === s.key && s.items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1 left-0 z-50 min-w-[180px] max-h-[240px] overflow-y-auto rounded-xl border shadow-lg"
                style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}
              >
                {s.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { s.onChange(item.id); setOpenDropdown(null) }}
                    className="w-full text-left px-3 py-2 text-xs font-medium transition-all hover:opacity-80"
                    style={{
                      color: s.value === item.name ? "var(--brand)" : "var(--text-primary)",
                      backgroundColor: s.value === item.name ? "var(--brand)/08" : "transparent",
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      {location.selectedZone && (
        <select
          value={location.selectedUnitType || ""}
          onChange={e => setUnitType(e.target.value || null)}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl border outline-none"
          style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
        >
          <option value="">Unit Type</option>
          {unitTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      )}
    </div>
  )
}

export function HeaderAreaSelector() {
  const { location, setArea, setProject, setZone, setUnitType } = useAdminStore()
  const [areas, setAreas] = useState<Area[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    apiClient<{ areas: Area[] }>("/locations/areas")
      .then(d => setAreas(d.areas || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold transition-all hover:opacity-85"
        style={{ borderColor: "var(--border-default)", color: location.selectedArea ? "var(--brand)" : "var(--toolbar-muted)" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
        <span>{location.selectedArea || "Select Area"}</span>
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      <AnimatePresence>
        {open && areas.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.12 }} className="absolute left-0 top-full mt-1.5 min-w-[160px] rounded-xl z-[9999] shadow-lg overflow-hidden"
            style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)" }}>
            <div className="p-1 max-h-48 overflow-y-auto">
              <button onClick={() => { setArea(null); setProject(null); setZone(null); setUnitType(null); setOpen(false) }}
                className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                style={{ color: "var(--text-secondary)" }}>All Areas</button>
              {areas.map((a: Area) => (
                <button key={a.name} onClick={() => { setArea(a.name); setOpen(false) }}
                  className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                  style={{ color: location.selectedArea === a.name ? "var(--brand)" : "var(--text-primary)", fontWeight: location.selectedArea === a.name ? 700 : 500 }}>
                  {a.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
