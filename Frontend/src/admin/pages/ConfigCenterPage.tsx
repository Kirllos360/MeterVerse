"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const CONFIG_TABS = [
  { id: "smtp", label: "SMTP Email", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" },
  { id: "sms", label: "SMS Gateway", icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" },
  { id: "firebase", label: "Firebase Push", icon: "M12 2a10 10 0 0110 10c0 2-1 4-2 5M12 2a10 10 0 00-10 10c0 2 1 4 2 5" },
  { id: "symbiot", label: "Symbiot Connections", icon: "M4 7v10c2 0 3 1 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "api-keys", label: "API Keys", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { id: "permissions", label: "Permissions", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
]

function ConfigForm({ title, fields, configKey, testEndpoint }: { title: string; fields: { name: string; label: string; type: string; placeholder?: string; required?: boolean }[]; configKey: string; testEndpoint?: string }) {
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/config/${configKey}`, { headers: { "X-Dev-Mode": "true" } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.config) setForm(data.config) })
      .catch(() => {})
  }, [configKey])

  const save = async () => {
    setSaving(true); setMessage(null)
    try {
      const res = await fetch(`/api/admin/config/${configKey}`, {
        method: "POST", headers: { "Content-Type": "application/json", "X-Dev-Mode": "true" },
        body: JSON.stringify({ config: form }),
      })
      if (!res.ok) throw new Error("Save failed")
      setMessage({ type: "success", text: `${title} configuration saved successfully.` })
    } catch (e: any) { setMessage({ type: "error", text: e.message }) }
    setSaving(false)
  }

  const test = async () => {
    if (!testEndpoint) { setMessage({ type: "error", text: "No test endpoint configured for this service." }); return }
    setTesting(true); setMessage(null)
    try {
      const res = await fetch(testEndpoint, {
        method: "POST", headers: { "Content-Type": "application/json", "X-Dev-Mode": "true" },
        body: JSON.stringify({ config: form }),
      })
      const data = await res.json()
      if (res.ok) setMessage({ type: "success", text: data.message || `${title} connection successful!` })
      else setMessage({ type: "error", text: data.error || "Connection failed" })
    } catch (e: any) { setMessage({ type: "error", text: e.message }) }
    setTesting(false)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)" }}>
      <button onClick={() => setExpanded(!expanded)} className="flex items-center justify-between w-full px-5 py-3.5 text-sm font-semibold" style={{ color: "var(--text-primary)", borderBottom: expanded ? "1px solid var(--border-default)" : "none" }}>
        {title}
        <motion.svg animate={{ rotate: expanded ? 180 : 0 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></motion.svg>
      </button>
      {expanded && (
        <div className="p-5 space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>{f.label}{f.required && " *"}</label>
              {f.type === "password" ? (
                <input type="password" value={form[f.name] || ""} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none border" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-base)", color: "var(--text-primary)" }} />
              ) : f.type === "textarea" ? (
                <textarea value={form[f.name] || ""} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} placeholder={f.placeholder} rows={3}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none border resize-none" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-base)", color: "var(--text-primary)" }} />
              ) : (
                <input type={f.type} value={form[f.name] || ""} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none border" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-base)", color: "var(--text-primary)" }} />
              )}
            </div>
          ))}
          {message && (
            <div className="px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: message.type === "success" ? "rgba(5,150,105,0.1)" : "rgba(var(--brand-rgb),0.1)", color: message.type === "success" ? "#059669" : "#dc2626" }}>
              {message.text}
            </div>
          )}
          <div className="flex items-center gap-3 pt-1">
            <motion.button onClick={save} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: saving ? "rgba(var(--brand-rgb),0.5)" : "var(--brand)" }}>
              {saving ? "Saving..." : "Save Configuration"}
            </motion.button>
            {testEndpoint && (
              <motion.button onClick={test} disabled={testing} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--surface-base)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                {testing ? "Testing..." : "Test Connection"}
              </motion.button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

function SymbiotConnections() {
  const [connections, setConnections] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetch("/api/admin/config/symbiot", { headers: { "X-Dev-Mode": "true" } })
      .then(r => r.ok ? r.json() : { connections: [] })
      .then(data => setConnections(data.connections || []))
      .catch(() => {})
  }, [])

  const addConnection = () => {
    setConnections(p => [...p, { id: Date.now().toString(), projectName: "", ip: "", port: "8080", apiKey: "", username: "", status: "inactive" }])
  }

  const updateConnection = (id: string, field: string, value: string) => {
    setConnections(p => p.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const removeConnection = (id: string) => {
    setConnections(p => p.filter(c => c.id !== id))
  }

  const saveAll = async () => {
    setSaving(true); setMessage(null)
    try {
      const res = await fetch("/api/admin/config/symbiot", {
        method: "POST", headers: { "Content-Type": "application/json", "X-Dev-Mode": "true" },
        body: JSON.stringify({ connections }),
      })
      if (!res.ok) throw new Error("Save failed")
      setMessage({ type: "success", text: `${connections.length} Symbiot connection(s) saved.` })
    } catch (e: any) { setMessage({ type: "error", text: e.message }) }
    setSaving(false)
  }

  const testConnection = async (conn: any) => {
    setMessage(null)
    try {
      const res = await fetch("/api/admin/config/symbiot/test", {
        method: "POST", headers: { "Content-Type": "application/json", "X-Dev-Mode": "true" },
        body: JSON.stringify({ connection: conn }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: "success", text: `Connection to ${conn.projectName} (${conn.ip}) successful!` })
        updateConnection(conn.id, "status", "active")
      } else {
        setMessage({ type: "error", text: data.error || `Connection to ${conn.projectName} failed` })
        updateConnection(conn.id, "status", "error")
      }
    } catch (e: any) { setMessage({ type: "error", text: e.message }) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)" }}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "var(--border-default)" }}>
        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Symbiot Per-Project Connections</span>
        <motion.button onClick={addConnection} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>+ Add Connection</motion.button>
      </div>
      <div className="p-5 space-y-4">
        {connections.length === 0 && (
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No Symbiot connections configured. Click "Add Connection" to configure a project's Symbiot server.</p>
        )}
        {connections.map((conn, idx) => (
          <div key={conn.id} className="p-4 rounded-lg space-y-3" style={{ backgroundColor: "var(--surface-base)", border: "1px solid var(--border-default)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Connection #{idx + 1}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: conn.status === "active" ? "rgba(5,150,105,0.15)" : conn.status === "error" ? "rgba(var(--brand-rgb),0.15)" : "rgba(107,114,128,0.15)", color: conn.status === "active" ? "#059669" : conn.status === "error" ? "#dc2626" : "#6b7280" }}>
                  {conn.status || "inactive"}
                </span>
                <button onClick={() => removeConnection(conn.id)} className="text-[10px] px-2 py-0.5 rounded" style={{ color: "#dc2626" }}>Remove</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[10px] font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Project Name *</label>
                <input value={conn.projectName} onChange={e => updateConnection(conn.id, "projectName", e.target.value)} placeholder="Palm Hills October" className="w-full px-2.5 py-1.5 rounded text-xs border outline-none" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-raised)", color: "var(--text-primary)" }} /></div>
              <div><label className="block text-[10px] font-medium mb-1" style={{ color: "var(--text-secondary)" }}>IP Address *</label>
                <input value={conn.ip} onChange={e => updateConnection(conn.id, "ip", e.target.value)} placeholder="192.168.1.100" className="w-full px-2.5 py-1.5 rounded text-xs border outline-none" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-raised)", color: "var(--text-primary)" }} /></div>
              <div><label className="block text-[10px] font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Port</label>
                <input value={conn.port} onChange={e => updateConnection(conn.id, "port", e.target.value)} placeholder="8080" className="w-full px-2.5 py-1.5 rounded text-xs border outline-none" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-raised)", color: "var(--text-primary)" }} /></div>
              <div><label className="block text-[10px] font-medium mb-1" style={{ color: "var(--text-secondary)" }}>API Key *</label>
                <input type="password" value={conn.apiKey} onChange={e => updateConnection(conn.id, "apiKey", e.target.value)} placeholder="symbiot-api-key" className="w-full px-2.5 py-1.5 rounded text-xs border outline-none" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-raised)", color: "var(--text-primary)" }} /></div>
              <div><label className="block text-[10px] font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Username</label>
                <input value={conn.username} onChange={e => updateConnection(conn.id, "username", e.target.value)} placeholder="admin" className="w-full px-2.5 py-1.5 rounded text-xs border outline-none" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-raised)", color: "var(--text-primary)" }} /></div>
              <div><label className="block text-[10px] font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Password</label>
                <input type="password" value={conn.password || ""} onChange={e => updateConnection(conn.id, "password", e.target.value)} placeholder="password" className="w-full px-2.5 py-1.5 rounded text-xs border outline-none" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-raised)", color: "var(--text-primary)" }} /></div>
            </div>
            <motion.button onClick={() => testConnection(conn)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--surface-raised)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
              Test Connection
            </motion.button>
          </div>
        ))}
        {connections.length > 0 && (
          <motion.button onClick={saveAll} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: saving ? "rgba(var(--brand-rgb),0.5)" : "var(--brand)" }}>
            {saving ? "Saving..." : `Save All Connections (${connections.length})`}
          </motion.button>
        )}
        {message && (
          <div className="px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: message.type === "success" ? "rgba(5,150,105,0.1)" : "rgba(var(--brand-rgb),0.1)", color: message.type === "success" ? "#059669" : "#dc2626" }}>
            {message.text}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ThirdPartyPermissions() {
  const [services, setServices] = useState<any[]>([])
  const [perms, setPerms] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/permissions", { headers: { "X-Dev-Mode": "true" } })
      const data = await res.json()
      setServices(data.services || [])
      setPerms(data.permissions || {})
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggle = async (serviceId: string, grant: boolean) => {
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/permissions/${serviceId}/${grant ? "grant" : "revoke"}`, {
        method: "POST", headers: { "X-Dev-Mode": "true" },
      })
      const data = await res.json()
      if (res.ok) { setPerms(data.permissions || {}); setMessage({ type: "success", text: data.message }) }
      else setMessage({ type: "error", text: data.error })
    } catch (e: any) { setMessage({ type: "error", text: e.message }) }
  }

  if (loading) return <div className="p-4 text-xs" style={{ color: "var(--text-tertiary)" }}>Loading permissions...</div>

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
        Grant or revoke access for third-party services. Each service requires explicit admin approval before the system can use it. This prevents unauthorized external API calls.
      </p>

      {message && (
        <div className="px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: message.type === "success" ? "rgba(5,150,105,0.1)" : "rgba(var(--brand-rgb),0.1)", color: message.type === "success" ? "#059669" : "#dc2626" }}>
          {message.text}
        </div>
      )}

      {services.map((svc) => {
        const grant = perms[svc.id]
        const isGranted = grant?.granted === true

        return (
          <div key={svc.id} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: "var(--surface-base)", border: "1px solid var(--border-default)" }}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{svc.icon}</span>
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{svc.label}</div>
                <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{svc.description}</div>
                {isGranted && (
                  <div className="text-[10px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    Granted by {grant.grantedBy} — {new Date(grant.grantedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            <motion.button
              onClick={() => toggle(svc.id, !isGranted)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-14 h-7 rounded-full transition-colors outline-none"
              style={{ backgroundColor: isGranted ? "#059669" : "rgba(107,114,128,0.3)" }}
            >
              <motion.div
                animate={{ x: isGranted ? 28 : 2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
              />
            </motion.button>
          </div>
        )
      })}
    </motion.div>
  )
}

export function ConfigCenterPage() {
  const [activeTab, setActiveTab] = useState("smtp")

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Configuration Center</h1>
      <p className="text-xs mt-1 mb-5" style={{ color: "var(--text-secondary)" }}>Configure all external service connections. Each form saves independently.</p>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {CONFIG_TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
            style={{ backgroundColor: activeTab === tab.id ? "var(--brand)" : "var(--surface-raised)", color: activeTab === tab.id ? "white" : "var(--text-secondary)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={tab.icon} /></svg>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "smtp" && (
        <ConfigForm title="SMTP Email Server" configKey="smtp" testEndpoint="/api/admin/config/smtp/test"
          fields={[
            { name: "host", label: "SMTP Host", type: "text", placeholder: "smtp.gmail.com", required: true },
            { name: "port", label: "Port", type: "text", placeholder: "587", required: true },
            { name: "username", label: "Username", type: "text", placeholder: "user@gmail.com", required: true },
            { name: "password", label: "Password", type: "password", placeholder: "app-password", required: true },
            { name: "fromEmail", label: "From Email", type: "text", placeholder: "noreply@meterverse.com", required: true },
            { name: "secure", label: "Secure (TLS)", type: "text", placeholder: "true" },
          ]} />
      )}

      {activeTab === "sms" && (
        <ConfigForm title="SMS Gateway (Twilio/Vonage)" configKey="sms" testEndpoint="/api/admin/config/sms/test"
          fields={[
            { name: "provider", label: "Provider", type: "text", placeholder: "twilio | vonage", required: true },
            { name: "accountSid", label: "Account SID / API Key", type: "text", placeholder: "ACxxxxxxxxxx", required: true },
            { name: "authToken", label: "Auth Token / API Secret", type: "password", placeholder: "auth-token", required: true },
            { name: "fromNumber", label: "From Phone Number", type: "text", placeholder: "+12025551234", required: true },
          ]} />
      )}

      {activeTab === "firebase" && (
        <ConfigForm title="Firebase Cloud Messaging" configKey="firebase" testEndpoint="/api/admin/config/firebase/test"
          fields={[
            { name: "projectId", label: "Project ID", type: "text", placeholder: "meter-verse-push", required: true },
            { name: "apiKey", label: "Web API Key", type: "password", placeholder: "AIzaSy...", required: true },
            { name: "serviceAccount", label: "Service Account JSON", type: "textarea", placeholder: "Paste service account JSON here..." },
            { name: "vapidKey", label: "VAPID Key", type: "text", placeholder: "BEls2d..." },
          ]} />
      )}

      {activeTab === "symbiot" && <SymbiotConnections />}

      {activeTab === "api-keys" && (
        <ConfigForm title="External API Keys" configKey="api-keys"
          fields={[
            { name: "cloudflare", label: "Cloudflare AI Token", type: "password", placeholder: "cfut_...", required: true },
            { name: "vercel", label: "Vercel Token", type: "password", placeholder: "vck_...", required: true },
            { name: "openai", label: "OpenAI API Key", type: "password", placeholder: "sk-..." },
            { name: "clerk", label: "Clerk Secret Key", type: "password", placeholder: "sk_..." },
            { name: "sentry", label: "Sentry DSN", type: "text", placeholder: "https://...@...ingest.sentry.io/..." },
            { name: "googleMaps", label: "Google Maps API Key", type: "password", placeholder: "AIza..." },
          ]} />
      )}

      {activeTab === "permissions" && <ThirdPartyPermissions />}

      <div className="mt-6 p-4 rounded-lg text-xs" style={{ backgroundColor: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)", color: "#059669" }}>
        <strong>⚠️ Security Layer:</strong> Every third-party service requires explicit admin approval before it can be used. Go to the <strong>Permissions</strong> tab to activate services. This prevents unauthorized external calls.
      </div>
    </div>
  )
}
