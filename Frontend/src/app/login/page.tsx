"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuthRuntime } from "@/identity/auth/AuthRuntime"

function AnimatedGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]" style={{ filter: "blur(0.5px)" }}>
      <defs>
        <pattern id="login-grid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#login-grid)" />
    </svg>
  )
}

function FloatingCard({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      {children}
    </motion.div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  const isUp = sub?.startsWith("+")
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4"
      style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
      <p className="text-2xl font-bold mt-1 text-white">{value}</p>
      {sub && <p className="text-[11px] mt-1" style={{ color: isUp ? "var(--status-success)" : "var(--status-error)" }}>{sub}</p>}
    </motion.div>
  )
}

function MiniChart() {
  const bars = [35, 55, 42, 68, 51, 72, 88, 65, 78, 92, 85, 74]
  return (
    <div className="flex items-end gap-1 h-24">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: 1 + i * 0.04, duration: 0.4, ease: "easeOut" }}
          className="w-3 rounded-t-sm"
          style={{ backgroundColor: i === bars.length - 1 ? "var(--brand)" : "rgba(255,255,255,0.15)" }}
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
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

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
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-8">
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
    <div className="flex min-h-screen">
      {/* LEFT: Brand (45% desktop, hidden mobile) */}
      <div className="hidden md:flex w-[45%] flex-col relative overflow-hidden" style={{ backgroundColor: "var(--panel-accent)" }}>
        <AnimatedGrid />

        {/* Ambient glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(var(--brand-rgb), 0.12) 0%, transparent 70%)" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full px-12 py-10">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={mounted ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">MeterVerse</h1>
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Enterprise Utility OS</p>
              </div>
            </div>
          </motion.div>

          {/* Center: Floating preview cards */}
          <div className="space-y-4">
            <FloatingCard index={0}>
              <div className="rounded-xl p-5 backdrop-blur-sm" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Active Meters" value="12,847" sub="+3.2%" />
                  <StatCard label="Collection Rate" value="94.2%" sub="+1.1%" />
                </div>
              </div>
            </FloatingCard>

            <FloatingCard index={1}>
              <div className="rounded-xl p-5 backdrop-blur-sm" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[11px] font-medium mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Consumption (30d)</p>
                <MiniChart />
              </div>
            </FloatingCard>

            <FloatingCard index={2}>
              <div className="flex items-center gap-3 rounded-xl px-5 py-3 backdrop-blur-sm" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <motion.div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--status-success)" }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                <span className="text-xs text-white">All Systems Operational</span>
                <span className="text-[10px] ml-auto" style={{ color: "rgba(255,255,255,0.35)" }}>99.97% uptime</span>
              </div>
            </FloatingCard>
          </div>

          {/* Bottom */}
          <div>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>Version 8.0.0-RC1 — &copy; 2026 MeterVerse</p>
          </div>
        </div>
      </div>

      {/* RIGHT: Auth (55% desktop, 100% mobile/tablet) */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 lg:p-12 relative overflow-hidden" style={{ backgroundColor: "var(--surface-base)" }}>
        {/* Ambient */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(var(--brand-rgb), 0.04) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(var(--brand-rgb), 0.03) 0%, transparent 70%)", transform: "translate(-20%, 20%)" }} />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
            <div>
              <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>MeterVerse</span>
              <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Enterprise Utility OS</p>
            </div>
          </div>

          <motion.div key={mode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
              {mode === "login" ? "Sign in to your workspace" : "Register for a new workspace"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Full name</label>
                  <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border text-sm outline-none transition-all focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50"
                    style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-sunken)", color: "var(--text-primary)" }}
                    placeholder="Enter your name" required autoFocus />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                  style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-sunken)", color: "var(--text-primary)", "--tw-ring-color": "var(--brand)" } as React.CSSProperties}
                  placeholder={mode === "login" ? "admin@meterverse.com" : "Enter your email"} required autoFocus={mode === "login"} />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Password</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                  style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-sunken)", color: "var(--text-primary)", "--tw-ring-color": "var(--brand)" } as React.CSSProperties}
                  placeholder={mode === "login" ? "Enter your password" : "Min 6 characters"} required />
              </div>

              {mode === "signup" && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Confirm password</label>
                  <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border text-sm outline-none transition-all focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50"
                    style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-sunken)", color: "var(--text-primary)" }}
                    placeholder="Confirm your password" required />
                </div>
              )}

              {mode === "login" && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded" style={{ accentColor: "var(--brand)" }} />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Remember this device</span>
                  </label>
                  <button type="button" className="text-sm font-medium hover:underline" style={{ color: "var(--brand)" }}>Forgot password?</button>
                </div>
              )}

              {(error || localError) && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(var(--status-error-rgb), 0.08)", color: "var(--status-error)" }}>
                  {localError || error}
                  {!localError && isLocked() && <span> ({remainingLockout()} min remaining)</span>}
                </motion.div>
              )}

              <motion.button type="submit" disabled={isLoading || signingUp}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all"
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

            <div className="mt-8 pt-6 text-center" style={{ borderTop: "1px solid var(--border-default)" }}>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                Unauthorized access is prohibited. All activities are monitored and logged.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
