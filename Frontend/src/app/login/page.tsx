"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useAuthRuntime } from "@/identity/auth/AuthRuntime"

function HeavyRain() {
  const drops = useMemo(() => Array.from({ length: 120 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 4,
    speed: 0.2 + Math.random() * 0.3, length: 20 + Math.random() * 30
  })), [])
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {drops.map((d) => (
        <motion.div key={d.id}
          className="absolute"
          style={{
            left: `${d.x}%`, top: "-5%", width: 1.5, height: d.length,
            background: "linear-gradient(to bottom, rgba(174,194,224,0.3), rgba(174,194,224,0.05))",
            borderRadius: "0 0 2px 2px"
          }}
          animate={{ y: ["0vh", "105vh"] }}
          transition={{ duration: d.speed, delay: d.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
      {/* Water splash particles */}
      {drops.slice(0, 30).map((d) => (
        <motion.div key={`splash-${d.id}`}
          className="absolute rounded-full"
          style={{ left: `${d.x}%`, width: 2, height: 2, backgroundColor: "rgba(174,194,224,0.2)" }}
          animate={{ y: ["0vh", "3vh"], opacity: [0, 0.4, 0] }}
          transition={{ duration: 0.4, delay: d.delay + 0.3, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  )
}

function Particles() {
  const items = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    id: i, y: 20 + Math.random() * 60, delay: Math.random() * 10, size: 3 + Math.random() * 3
  })), [])
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
      {items.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ top: `${p.y}%`, width: p.size, height: p.size, backgroundColor: "rgba(var(--brand-rgb), 0.12)" }}
          animate={{ x: ["-5%", "105%"] }}
          transition={{ duration: 12 + p.id * 2, delay: p.delay, repeat: Infinity, ease: "linear" }} />
      ))}
    </div>
  )
}

export default function LoginPage() {
  const { login, isLoading, error, isLocked, remainingLockout } = useAuthRuntime()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("admin@meterverse.com")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [remember, setRemember] = useState(false)
  const [success, setSuccess] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [signingUp, setSigningUp] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    if (mode === "signup") {
      if (!name.trim()) { setLocalError("Name is required"); return }
      if (password !== confirmPassword) { setLocalError("Passwords do not match"); return }
      if (password.length < 6) { setLocalError("Password must be at least 6 characters"); return }
      setSigningUp(true); await new Promise((r) => setTimeout(r, 1000)); setSigningUp(false); setSuccess(true)
      return
    }
    const result = await login(email, password, remember)
    if (result) setSuccess(true)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--panel-accent)" }}>
        <HeavyRain /><Particles />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-8 z-10">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          </motion.div>
          <h2 className="text-xl font-semibold text-white mb-2">Access Granted</h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Redirecting to workspace...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: "var(--panel-accent)" }}>
      <HeavyRain /><Particles />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(var(--brand-rgb), 0.08) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full" style={{ maxWidth: 520 }}>
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "var(--brand)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-1" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>MeterVerse</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)", textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>Enterprise Utility OS</p>
          </div>
          <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>Full name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                    style={{ borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)", color: "white" }}
                    placeholder="Enter your name" required autoFocus />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                  style={{ borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)", color: "white" }}
                  placeholder="admin@meterverse.com" required autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                  style={{ borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)", color: "white" }}
                  placeholder="Enter your password" required />
              </div>
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>Confirm password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                    style={{ borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)", color: "white" }}
                    placeholder="Confirm your password" required />
                </div>
              )}
              {mode === "login" && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded" style={{ accentColor: "var(--brand)" }} />
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>Remember this device</span>
                  </label>
                  <button type="button" className="text-sm font-medium hover:underline" style={{ color: "var(--brand)", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>Forgot password?</button>
                </div>
              )}
              {(error || localError) && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(220,38,38,0.15)", color: "#EF4444" }}>
                  {localError || error}
                  {!localError && isLocked() && <span> ({remainingLockout()} min remaining)</span>}
                </motion.div>
              )}
              <motion.button type="submit" disabled={isLoading || signingUp}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="w-full h-12 rounded-xl text-sm font-semibold transition-all"
                style={{ backgroundColor: (isLoading || signingUp) ? "rgba(var(--brand-rgb), 0.5)" : "var(--brand)", color: "white", boxShadow: "0 4px 15px rgba(0,0,0,0.15)", textShadow: "0 1px 2px rgba(0,0,0,0.15)" }}>
                {(isLoading || signingUp) ? "Signing in..." : "Sign in"}
              </motion.button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setLocalError(null) }}
                className="text-sm font-medium hover:underline" style={{ color: "var(--brand)", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
                {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
            <div className="mt-8 pt-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)", textShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>Unauthorized access is prohibited.</p>
              <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.15)", textShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>Version 8.0.0-RC1</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
