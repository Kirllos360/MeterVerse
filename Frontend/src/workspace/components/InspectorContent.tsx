"use client"

import { useWorkspaceStore } from "../stores"

const tabs = [
  { id: "details", label: "Details" },
  { id: "activity", label: "Activity" },
  { id: "history", label: "History" },
  { id: "metadata", label: "Meta" },
]

const infoRows = [
  { label: "Type", value: "—" },
  { label: "Status", value: "—" },
  { label: "Created", value: "—" },
  { label: "Updated", value: "—" },
  { label: "Area", value: "October" },
  { label: "Category", value: "—" },
]

export function InspectorContent() {
  const { inspectorOpen, setInspectorOpen } = useWorkspaceStore()

  return (
    <div className="h-full py-2 pe-2" style={{ height: "100vh" }}>
      <div className="flex flex-col h-full rounded-2xl shadow-xl overflow-hidden"
        style={{ backgroundColor: "#064E3B", border: "1px solid rgba(0,191,165,0.12)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#00BFA5" }} />
            <span className="text-sm font-medium text-white">Inspector</span>
          </div>
          <button onClick={() => setInspectorOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10" style={{ color: "rgba(255,255,255,0.4)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-3 pt-3 pb-2 shrink-0 overflow-x-auto" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {tabs.map((tab) => (
            <button key={tab.id}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
              style={{
                backgroundColor: tab.id === "details" ? "rgba(0,191,165,0.15)" : "transparent",
                color: tab.id === "details" ? "#FFFFFF" : "rgba(255,255,255,0.45)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Properties section */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4">
          {/* Selection info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "rgba(0,191,165,0.5)" }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>Selection Info</span>
            </div>
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-1">
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{row.label}</span>
                <span className="text-[11px] font-medium" style={{ color: row.value !== "—" ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)" }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "rgba(0,191,165,0.5)" }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>Actions</span>
            </div>
            <div className="space-y-1">
              {["View Details", "Edit Properties", "View History", "Export Data"].map((action) => (
                <button key={action}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs transition-colors"
                  style={{ color: "rgba(255,255,255,0.5)", backgroundColor: "rgba(255,255,255,0.04)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Relationships */}
          <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "rgba(0,191,165,0.5)" }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>Relationships</span>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>No related entities selected</p>
            </div>
          </div>
        </div>

        {/* Bottom hint */}
        <div className="shrink-0 px-4 py-2.5 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>Select an item to inspect</p>
        </div>
      </div>
    </div>
  )
}
