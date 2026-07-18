"use client"

import { type ReactNode } from "react"

export interface FieldDef {
  id: string
  label: string
  type: "text" | "number" | "email" | "password" | "textarea" | "phone" | "currency" | "date" | "switch" | "checkbox" | "select" | "tags" | "file" | "color"
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  hidden?: boolean
  placeholder?: string
  options?: { label: string; value: string }[]
  width?: "full" | "half" | "third"
  validation?: { pattern?: string; message?: string; min?: number; max?: number }
}

interface FormRuntimeProps {
  fields: FieldDef[]
  values: Record<string, unknown>
  onChange: (id: string, value: unknown) => void
  errors?: Record<string, string>
  layout?: "single" | "two-column" | "three-column"
}

export function FormRuntime({ fields, values, onChange, errors, layout = "two-column" }: FormRuntimeProps) {
  const cols = layout === "single" ? 1 : layout === "two-column" ? 2 : 3

  return (
    <div className="space-y-5" style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "16px" }}>
      {fields
        .filter((f) => !f.hidden)
        .map((field) => {
          const span = field.width === "full" ? cols : field.width === "half" ? Math.max(1, Math.floor(cols / 2)) : 1
          return (
            <div key={field.id} style={{ gridColumn: `span ${span}` }}>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary, #737373)" }}>
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
              </label>
              <FieldInput field={field} value={values[field.id]} onChange={(v) => onChange(field.id, v)} error={errors?.[field.id]} />
              {errors?.[field.id] && <p className="text-[11px] mt-1 text-red-500">{errors[field.id]}</p>}
            </div>
          )
        })}
    </div>
  )
}

function FieldInput({ field, value, onChange, error }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void; error?: string }) {
  const baseStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    border: `1px solid ${error ? "#DC2626" : "var(--border-default, #E5E5E5)"}`,
    backgroundColor: field.disabled ? "var(--surface-base, #FAFAFA)" : "var(--surface-sunken, #F0F0F0)",
    color: "var(--text-primary, #0A0A0A)",
    outline: "none",
    transition: "border-color 0.15s",
  } as React.CSSProperties

  if (field.type === "select") {
    return (
      <select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} disabled={field.disabled}
        className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#00BFA5] transition-colors"
        style={{ ...baseStyle, appearance: "auto" as any }}
      >
        <option value="">Select...</option>
        {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    )
  }

  if (field.type === "textarea") {
    return <textarea value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} disabled={field.disabled} placeholder={field.placeholder} rows={4} style={baseStyle} />
  }

  if (field.type === "switch") {
    return (
      <button
        onClick={() => !field.disabled && onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-[#00BFA5]" : "bg-gray-300"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    )
  }

  if (field.type === "color") {
    return <input type="color" value={String(value ?? "#000000")} onChange={(e) => onChange(e.target.value)} disabled={field.disabled} className="w-10 h-10 rounded cursor-pointer" />
  }

  return (
    <input
      type={field.type === "currency" ? "text" : field.type}
      value={String(value ?? "")}
      onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
      disabled={field.disabled}
      readOnly={field.readonly}
      placeholder={field.placeholder}
      onFocus={(e) => (e.target.style.borderColor = "#00BFA5")}
      onBlur={(e) => (e.target.style.borderColor = error ? "#DC2626" : "var(--border-default, #E5E5E5)")}
      style={baseStyle}
    />
  )
}
