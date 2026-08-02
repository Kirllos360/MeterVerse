"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.06, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

export default function LoginPage() {
  const [email, setEmail] = useState("admin@meterverse.com")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { window.location.href = "/admin" }, 800)
  }

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "#0A0A0A" }}>
      
      {/* Animated background */}
      <motion.div className="absolute inset-0 opacity-20"
        animate={{ background: ["radial-gradient(600px circle at 30% 50%, #DC2626 0%, transparent 60%)", "radial-gradient(600px circle at 70% 50%, #DC2626 0%, transparent 60%)", "radial-gradient(600px circle at 30% 50%, #DC2626 0%, transparent 60%)"] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} />

      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-sm p-6">
        
        <div className="rounded-2xl p-8 backdrop-blur-xl border"
          style={{ backgroundColor: "rgba(20,20,25,0.9)", borderColor: "rgba(220,38,38,0.15)", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>
          
          <div className="flex flex-col items-center mb-8">
            <motion.div animate={waveAnim} className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "#DC2626", boxShadow: "0 0 30px rgba(220,38,38,0.3)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </motion.div>
            <h1 className="text-xl font-bold text-white mb-1">MeterVerse OS</h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Administration Panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
            </div>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all"
              style={{ backgroundColor: "#DC2626", boxShadow: "0 0 20px rgba(220,38,38,0.2)" }}>
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>MeterVerse OS v10.0 · Administration</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
