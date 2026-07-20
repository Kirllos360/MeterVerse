"use client"

import { useState } from "react"
import { RuntimeEngine, sampleEntities, EntityMetadata } from "@/admin/runtime/RuntimeEngine"

export default function AdminRuntimePage() {
  const [entityName, setEntityName] = useState("customer")
  const [tab, setTab] = useState("demo")

  const metadata = sampleEntities[entityName]

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-white">Runtime Engine</h1><p className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Metadata-driven app generation — define entities in JSON, get full CRUD automatically</p></div>
      </div>

      <div className="flex gap-1 pb-2">
        {[{id:"demo",label:"Live Demo"},{id:"metadata",label:"Entity Definitions"},{id:"schema",label:"Schema Reference"}].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{backgroundColor:tab===t.id?"var(--status-error)":"var(--admin-surface)",color:tab===t.id?"white":"rgba(255,255,255,0.5)",border:tab===t.id?"none":"1px solid var(--admin-border)"}}>{t.label}</button>
        ))}
      </div>

      {/* ─── Entity selector ─────────────────────────────────────────────── */}
      <div className="flex gap-2">
        {Object.keys(sampleEntities).map(key => (
          <button key={key} onClick={() => setEntityName(key)} className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize"
            style={{backgroundColor:entityName===key?"var(--status-error)":"var(--admin-surface)",color:entityName===key?"white":"rgba(255,255,255,0.5)",border:entityName===key?"none":"1px solid var(--admin-border)"}}>
            {sampleEntities[key].labelPlural}
          </button>
        ))}
      </div>

      {tab === "demo" && metadata && <RuntimeEngine metadata={metadata} key={entityName} />}

      {tab === "metadata" && (
        <div className="rounded-xl border overflow-hidden" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
          <div className="px-4 py-3 border-b text-xs font-semibold" style={{borderColor:"var(--admin-border)",color:"rgba(255,255,255,0.7)"}}>{metadata.label} — Entity Definition</div>
          <pre className="p-4 text-xs font-mono overflow-auto max-h-96" style={{color:"rgba(255,255,255,0.7)"}}>{JSON.stringify(metadata, null, 2)}</pre>
        </div>
      )}

      {tab === "schema" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border p-4" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
            <div className="text-xs font-semibold mb-3" style={{color:"rgba(255,255,255,0.7)"}}>FieldDef</div>
            <pre className="text-xs font-mono" style={{color:"rgba(255,255,255,0.5)"}}>{`{
  name: string         // field key
  label: string        // display label
  type: string         // string | number | boolean | date | email | enum | textarea
  required?: boolean
  readonly?: boolean
  placeholder?: string
  defaultValue?: any
  options?: {label, value}[]  // for enum
  min?: number         // for number
  max?: number
  pattern?: string     // regex
  description?: string
}`}</pre>
          </div>
          <div className="rounded-xl border p-4" style={{borderColor:"var(--admin-border)",backgroundColor:"var(--admin-surface)"}}>
            <div className="text-xs font-semibold mb-3" style={{color:"rgba(255,255,255,0.7)"}}>EntityMetadata</div>
            <pre className="text-xs font-mono" style={{color:"rgba(255,255,255,0.5)"}}>{`{
  name: string         // entity key
  label: string        // singular
  labelPlural: string
  description?: string
  fields: FieldDef[]
  columns?: string[]   // table columns
  formFields?: string[]// form fields
  actions?: ActionDef[]
  permissions?: {create, read, update, delete}
  defaultSort?: string
}

ActionDef: {
  name, label, icon?, color?,
  confirm?, requirePermission?,
  handler: "delete"|"approve"|"export"|"custom"
}`}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
