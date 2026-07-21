"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"

export default function AdminLoginPage() {
  const [hydrated, setHydrated] = useState(false)
  const [email, setEmail] = useState("admin@meterverse.com")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => { setHydrated(true) }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")
      localStorage.setItem("mv-identity", JSON.stringify({ state: { user: data.user, tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken, expiresAt: data.expiresAt }, isAuthenticated: true } }))
      window.location.href = "/admin"
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden" style={{ backgroundColor: "#0A0A0A" }}>
      {/* Rain effect (red-tinted) */}
      {hydrated && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
          {Array.from({ length: 80 }, (_, i) => (
            <motion.div key={i} className="absolute"
              style={{ left: `${Math.random() * 100}%`, top: "-5%", width: 1, height: 15 + Math.random() * 20,
                background: "linear-gradient(to bottom, rgba(220,38,38,0.15), rgba(220,38,38,0.03))",
                borderRadius: "0 0 2px 2px" }}
              animate={{ y: ["0vh", "105vh"] }}
              transition={{ duration: 0.3 + Math.random() * 0.4, delay: Math.random() * 4, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </div>
      )}

      {/* Login card */}
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-sm p-8">
        <div className="rounded-2xl p-8" style={{ backgroundColor: "rgba(15,15,25,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(220,38,38,0.15)", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
          
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: "#DC2626", boxShadow: "0 0 20px rgba(220,38,38,0.3)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <h1 className="text-xl font-bold text-white">Admin Login</h1>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>MeterVerse Administration</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-2 rounded-lg text-xs text-white" style={{ backgroundColor: "rgba(220,38,38,0.2)", border: "1px solid rgba(220,38,38,0.3)" }}>
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }}
                placeholder="admin@meterverse.com" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }}
                placeholder="Enter password" />
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "#DC2626", boxShadow: "0 0 15px rgba(220,38,38,0.2)" }}>
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>MeterVerse v8.0.0 · Administration Panel</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
