"use client"

import { useState, useEffect } from "react"

interface Setting { id: string; key: string; value: string; category: string; type: string }

const CATEGORIES = ["general", "security", "email", "billing", "features", "upload"]

export default function AdminsettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [category, setCategory] = useState("general")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [edited, setEdited] = useState<Record<string, string>>({})

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/settings?category=${category}`).then((r) => r.json()).then((d) => { setSettings(d.settings || []); setLoading(false) }).catch(() => setLoading(false))
  }, [category])

  const handleSave = async () => {
    setSaving(true)
    const updates = settings.map((s) => ({ key: s.key, value: edited[s.key] ?? s.value, category: s.category, type: s.type }))
    try {
      await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: updates }) })
    } catch {}
    setSaving(false)
    setEdited({})
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">System Settings</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Configure system-wide settings</p>
        </div>
        {Object.keys(edited).length > 0 && (
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-50" style={{ backgroundColor: "var(--status-error)" }}>
            {saving ? "Saving..." : `Save Changes (${Object.keys(edited).length})`}
          </button>
        )}
      </div>

      <div className="flex gap-2 pb-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize" style={{ backgroundColor: category === c ? "var(--status-error)" : "var(--admin-surface)", color: category === c ? "white" : "rgba(255,255,255,0.5)", border: category === c ? "none" : "1px solid var(--admin-border)" }}>{c}</button>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-surface)" }}>
        {loading ? (
          <div className="px-4 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Loading...</div>
        ) : settings.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>No settings in this category</div>
        ) : settings.map((s) => (
          <div key={s.key} className="flex items-center justify-between px-4 py-3 border-b text-xs" style={{ borderColor: "var(--admin-border)" }}>
            <div className="flex-1">
              <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>{s.key.split(".").pop()?.replace(/_/g, " ")}</div>
              <div className="text-[10px] mt-0.5 font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{s.key}</div>
            </div>
            <div className="w-64">
              <input value={edited[s.key] ?? s.value} onChange={(e) => setEdited({ ...edited, [s.key]: e.target.value })} className="w-full px-3 py-1.5 rounded-lg border text-xs outline-none" style={{ backgroundColor: "var(--admin-surface)", borderColor: edited[s.key] !== undefined && edited[s.key] !== s.value ? "var(--status-error)" : "var(--admin-border)", color: "white" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
