"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface CrudField {
  name: string
  label: string
  type: "text" | "email" | "number" | "select" | "textarea" | "phone"
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
}

interface EntityCrudDialogProps {
  open: boolean
  onClose: () => void
  title: string
  fields: CrudField[]
  initialData?: Record<string, any>
  apiEndpoint: string
  onSaved: () => void
}

export function EntityCrudDialog({ open, onClose, title, fields, initialData, apiEndpoint, onSaved }: EntityCrudDialogProps) {
  const [form, setForm] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!initialData

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...initialData } : {})
      setError(null)
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const method = isEdit ? "PUT" : "POST"
      const url = isEdit ? `${apiEndpoint}/${initialData.id}` : apiEndpoint
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "X-Dev-Mode": "true" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData?.id) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${apiEndpoint}/${initialData.id}`, {
        method: "DELETE",
        headers: { "X-Dev-Mode": "true" },
      })
      if (!res.ok) throw new Error("Delete failed")
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const setVal = (name: string, value: any) => setForm((f) => ({ ...f, [name]: value }))

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ backgroundColor: "var(--surface-raised)", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border-default)" }}>
              <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                {isEdit ? `Edit ${title}` : `New ${title}`}
              </h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "var(--status-error)" }}>
                  {error}
                </div>
              )}

              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    {field.label}{field.required && <span className="ml-1" style={{ color: "var(--status-error)" }}>*</span>}
                  </label>
                  {field.type === "select" ? (
                    <select
                      value={form[field.name] || ""}
                      onChange={(e) => setVal(field.name, e.target.value)}
                      required={field.required}
                      className="w-full h-10 px-3 rounded-xl text-sm border outline-none"
                      style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-base)", color: "var(--text-primary)" }}
                    >
                      <option value="">Select...</option>
                      {field.options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      value={form[field.name] || ""}
                      onChange={(e) => setVal(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl text-sm border outline-none resize-none"
                      style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-base)", color: "var(--text-primary)" }}
                    />
                  ) : (
                    <input
                      type={field.type === "phone" ? "tel" : field.type}
                      value={form[field.name] || ""}
                      onChange={(e) => setVal(field.name, field.type === "number" ? Number(e.target.value) : e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full h-10 px-3 rounded-xl text-sm border outline-none"
                      style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-base)", color: "var(--text-primary)" }}
                    />
                  )}
                </div>
              ))}

              <div className="flex items-center gap-3 pt-2">
                {isEdit && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "var(--status-error)" }}
                  >
                    Delete
                  </button>
                )}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: submitting ? "rgba(var(--brand-rgb), 0.5)" : "var(--brand)" }}
                >
                  {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
