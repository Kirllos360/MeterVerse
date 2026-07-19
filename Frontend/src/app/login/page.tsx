"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useAuthRuntime } from "@/identity/auth/AuthRuntime"

function SignalWave() {
  return (
    <motion.svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 800" preserveAspectRatio="none"
      animate={{ opacity: [0.04, 0.1, 0.04] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="var(--brand)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d="M0,350 C300,150 600,550 1200,350" fill="none" stroke="url(#wg)" strokeWidth="2" />
      <path d="M0,400 C300,200 600,600 1200,400" fill="none" stroke="url(#wg)" strokeWidth="1.5" opacity="0.6" />
      <path d="M0,450 C300,250 600,650 1200,450" fill="none" stroke="url(#wg)" strokeWidth="1" opacity="0.3" />
    </motion.svg>
  )
}

function WaterDroplets() {
  const drops = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 8, size: 2 + Math.random() * 4, speed: 3 + Math.random() * 4
  })), [])
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {drops.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full"
          style={{ left: `${d.x}%`, width: d.size, height: d.size * 1.5, backgroundColor: "rgba(255,255,255,0.15)" }}
          animate={{ y: ["-5%", "105%"], opacity: [0, 0.6, 0] }}
          transition={{ duration: d.speed, delay: d.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  )
}

function Particles() {
  const particles = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    id: i, y: 20 + Math.random() * 60, delay: Math.random() * 10, size: 3 + Math.random() * 3
  })), [])
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ top: `${p.y}%`, width: p.size, height: p.size, backgroundColor: "rgba(var(--brand-rgb), 0.2)" }}
          animate={{ x: ["-5%", "105%"] }}
          transition={{ duration: 12 + p.id * 2, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  )
}

export default function LoginPage() {
  const { login, isLoading, error, loginAttempts, isLocked, remainingLockout } = useAuthRuntime()
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
      <div className="flex min-h-screen items-center justify-center relative overflow-hidden" style={{ backgroundColor: "var(--panel-accent)" }}>
        <SignalWave /><WaterDroplets /><Particles />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-8 z-10">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          </motion.div>
          <h2 className="text-xl font-semibold text-white mb-2">{mode === "login" ? "Access Granted" : "Account Created"}</h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            {mode === "login" ? "Redirecting to workspace..." : "You can now sign in"}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex h-screen relative overflow-hidden" style={{ backgroundColor: "var(--panel-accent)" }}>
      <SignalWave /><WaterDroplets /><Particles />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(var(--brand-rgb), 0.08) 0%, transparent 70%)" }} />

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "var(--brand)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">MeterVerse</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>Enterprise Utility OS</p>
          </div>

          <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>Full name</label>
                  <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border text-sm outline-none transition-all focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    style={{ borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)", color: "white", }}
                    placeholder="Enter your name" required autoFocus />
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border text-sm outline-none transition-all focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  style={{ borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)", color: "white", }}
                  placeholder={mode === "login" ? "admin@meterverse.com" : "Enter your email"} required autoFocus={mode === "login"} />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>Password</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border text-sm outline-none transition-all focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  style={{ borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)", color: "white", }}
                  placeholder={mode === "login" ? "Enter your password" : "Min 6 characters"} required />
              </div>
              {mode === "signup" && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>Confirm password</label>
                  <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border text-sm outline-none transition-all focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    style={{ borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)", color: "white", }}
                    placeholder="Confirm your password" required />
                </div>
              )}
              {mode === "login" && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded" style={{ accentColor: "var(--brand)" }} />
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Remember this device</span>
                  </label>
                  <button type="button" className="text-sm font-medium hover:underline" style={{ color: "var(--brand)" }}>Forgot password?</button>
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
                className="w-full h-12 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ backgroundColor: (isLoading || signingUp) ? "rgba(var(--brand-rgb), 0.5)" : "var(--brand)" }}>
                {(isLoading || signingUp) ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" opacity="0.25" />
                      <path d="M12 2a10 10 0 019.95 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </span>
                ) : mode === "login" ? "Sign in" : "Create account"}
              </motion.button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setLocalError(null) }}
                className="text-sm font-medium hover:underline" style={{ color: "var(--brand)" }}>
                {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
            <div className="mt-8 pt-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                Unauthorized access is prohibited. All activities are monitored and logged.
              </p>
              <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.15)" }}>Version 8.0.0-RC1</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

    </div>
  )
}
