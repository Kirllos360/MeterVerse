"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"

interface Field {
  name: string
  label: string
  type: "text" | "email" | "number" | "select" | "date"
  options?: { value: string; label: string }[]
}

interface EditDialogProps {
  entity: string
  id: string
  fields: Field[]
  initialData: Record<string, any>
  onClose: () => void
  onSaved: () => void
}

export function EditDialog({ entity, id, fields, initialData, onClose, onSaved }: EditDialogProps) {
  const [data, setData] = useState({ ...initialData })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await apiClient(`/api/${entity}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      })
      onSaved()
    } catch (e) {
      console.error("Save failed", e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit {entity}</h2>
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium mb-1">{f.label}</label>
              {f.type === "select" ? (
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={data[f.name] || ""}
                  onChange={(e) => setData({ ...data, [f.name]: e.target.value })}
                >
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type}
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={data[f.name] || ""}
                  onChange={(e) => setData({ ...data, [f.name]: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </div>
      </div>
    </div>
  )
}
