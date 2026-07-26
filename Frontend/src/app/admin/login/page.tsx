"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuthRuntime } from "@/identity/auth/AuthRuntime"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@meterverse.com")
  const [password, setPassword] = useState("")
  const [redirecting, setRedirecting] = useState(false)
  const { login, isLoading, error } = useAuthRuntime()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await login(email, password, true)
    if (ok) { setRedirecting(true); setTimeout(() => { window.location.href = "/admin" }, 500) }
  }

  if (redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#0A0A0A" }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-8 z-10">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--brand)", boxShadow: "0 0 20px rgba(var(--brand-rgb),0.3)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          </motion.div>
          <h2 className="text-xl font-semibold text-white mb-2">Access Granted</h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Redirecting to admin panel...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden" style={{ backgroundColor: "#0A0A0A" }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-sm p-8">
        <div className="rounded-2xl p-8" style={{ backgroundColor: "rgba(15,15,25,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(var(--brand-rgb),0.12)", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
          <div className="flex flex-col items-center mb-8">
            <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: "var(--brand)", boxShadow: "0 0 25px rgba(var(--brand-rgb),0.3)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </motion.div>
            <h1 className="text-xl font-bold text-white">Admin Login</h1>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>MeterVerse Administration</p>
          </div>
          {error && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-2.5 rounded-lg text-xs text-white" style={{ backgroundColor: "rgba(var(--brand-rgb),0.12)", border: "1px solid rgba(var(--brand-rgb),0.2)" }}>
              {error}
            </motion.div>
          )}
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
            <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--brand)", boxShadow: "0 0 15px rgba(var(--brand-rgb),0.2)" }}>
              {isLoading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>MeterVerse <span style={{ color: "var(--brand)" }}>v8.0.0</span> · Administration Panel</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
