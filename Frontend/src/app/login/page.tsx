"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuthRuntime } from "@/identity/auth/AuthRuntime"

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}

function KpiCard({ label, value, trend }: { label: string; value: string; trend?: "up" | "down" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-xl font-semibold text-white">{value}</span>
        {trend && (
          <span className="text-[11px]" style={{ color: trend === "up" ? "var(--status-success)" : "var(--status-error)" }}>
            {trend === "up" ? "↑" : "↓"} 3.2%
          </span>
        )}
      </div>
      <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: trend === "up" ? "78%" : "45%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full rounded-full" style={{ backgroundColor: "var(--brand-primary)" }}
        />
      </div>
    </motion.div>
  )
}

function MiniChart() {
  const bars = [35, 55, 42, 68, 51, 72, 88, 65, 78, 92, 85, 74]
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="flex items-end gap-1.5 h-20 px-2"
    >
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: 0.8 + i * 0.05, duration: 0.4, ease: "easeOut" }}
          className="w-3 rounded-t-sm"
          style={{ backgroundColor: i === bars.length - 1 ? "var(--brand-primary)" : "rgba(255,255,255,0.15)" }}
        />
      ))}
    </motion.div>
  )
}

export default function LoginPage() {
  const { login, isLoading, error, loginAttempts, isLocked, remainingLockout, rememberDevice } = useAuthRuntime()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("admin@meterverse.com")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [remember, setRemember] = useState(false)
  const [success, setSuccess] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (mode === "signup") {
      if (!name.trim()) { setLocalError("Name is required"); return }
      if (password !== confirmPassword) { setLocalError("Passwords do not match"); return }
      if (password.length < 6) { setLocalError("Password must be at least 6 characters"); return }
      setIsLoading(true); await new Promise((r) => setTimeout(r, 1000)); setSuccess(true); return
    }

    const result = await login(email, password, remember)
    if (result) setSuccess(true)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--panel-accent)" }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-center p-8">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--brand-primary)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          </motion.div>
          <h2 className="text-xl font-semibold text-white mb-2">{mode === "login" ? "Access Granted" : "Account Created"}</h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            {mode === "login" ? "Redirecting to workspace..." : "You can now sign in with your credentials"}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* LEFT PANEL — Brand / Features (45%) */}
      <div className="w-[45%] flex flex-col justify-between px-12 py-10 relative overflow-hidden" style={{ backgroundColor: "var(--panel-accent)" }}>
        <AnimatedGrid />

        {/* Top: Logo + Brand */}
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-8">
              <motion.div whileHover={{ rotate: [0, -5, 5, 0] }} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--brand-primary)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-white">MeterVerse</h1>
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Enterprise Utility OS</p>
              </div>
            </div>
          </motion.div>

          {/* Feature list */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }} className="space-y-4">
            {[
              { icon: "M12 2a10 10 0 1010 10M12 12l4-4M12 2v10", label: "Real-time Meter Monitoring", desc: "Live consumption data across all utilities" },
              { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: "Automated Billing", desc: "Smart invoice generation and payment tracking" },
              { icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z", label: "Enterprise Security", desc: "Role-based access with audit trails" },
              { icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", label: "Multi-tenant Architecture", desc: "Manage multiple sites from one platform" },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(var(--brand-primary-rgb), 0.12)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="1.8" strokeLinecap="round">
                    <path d={f.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{f.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom: Version + Copyright */}
        <div className="relative z-10">
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
            Version 8.0.0 — © 2026 MeterVerse. All rights reserved.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — Login Form + Dashboard Preview (55%) */}
      <div className="w-[55%] flex flex-col justify-center items-center p-8 relative overflow-hidden" style={{ backgroundColor: "var(--surface-base)" }}>
        {/* Background ambient effect */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(var(--brand-primary-rgb), 0.04) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(var(--brand-primary-rgb), 0.03) 0%, transparent 70%)", transform: "translate(-20%, 20%)" }} />

        <div className="flex items-start gap-16 w-full max-w-5xl relative z-10">
          {/* Login Form */}
          <motion.div key={mode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
            className="w-[480px] shrink-0"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {mode === "login" ? "Sign in to the Enterprise Control Center" : "Register for a new workspace account"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.3 }}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                    style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-sunken)", color: "var(--text-primary)", "--tw-ring-color": "var(--brand-primary)" } as React.CSSProperties}
                    placeholder="Enter your name" required autoFocus />
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  {mode === "login" ? "Email" : "Email Address"}
                </label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                  style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-sunken)", color: "var(--text-primary)", "--tw-ring-color": "var(--brand-primary)" } as React.CSSProperties}
                  placeholder={mode === "login" ? "admin@meterverse.com" : "Enter your email address"} required autoFocus={mode === "login"} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                  style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-sunken)", color: "var(--text-primary)", "--tw-ring-color": "var(--brand-primary)" } as React.CSSProperties}
                  placeholder={mode === "login" ? "Enter your password" : "Create a password (min 6 chars)"} required />
              </div>

              {mode === "signup" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.3 }}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                    style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-sunken)", color: "var(--text-primary)", "--tw-ring-color": "var(--brand-primary)" } as React.CSSProperties}
                    placeholder="Confirm your password" required />
                </motion.div>
              )}

              {mode === "login" && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                      className="rounded" style={{ accentColor: "var(--brand-primary)" }} />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Remember this device</span>
                  </label>
                  <button type="button" className="text-sm font-medium hover:underline" style={{ color: "var(--brand-primary)" }}>Forgot password?</button>
                </div>
              )}

              {(error || localError) && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(var(--status-error-rgb), 0.08)", color: "var(--status-error)" }}>
                  {localError || error}
                  {!localError && isLocked() && <span> ({remainingLockout()} min remaining)</span>}
                </motion.div>
              )}

              <motion.button type="submit" disabled={isLoading}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ backgroundColor: isLoading ? "rgba(var(--brand-primary-rgb), 0.5)" : "var(--brand-primary)" }}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" opacity="0.25" />
                      <path d="M12 2a10 10 0 019.95 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {mode === "login" ? "Authenticating..." : "Creating account..."}
                  </span>
                ) : mode === "login" ? "Sign In" : "Create Account"}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setLocalError(null) }}
                className="text-sm font-medium hover:underline" style={{ color: "var(--brand-primary)" }}>
                {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            <div className="mt-8 pt-6 text-center" style={{ borderTop: "1px solid var(--border-default)" }}>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                Unauthorized access is prohibited. All activities are monitored and logged.
              </p>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex-1 min-w-0 hidden xl:block"
          >
            <div className="rounded-2xl overflow-hidden backdrop-blur-sm" style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)", boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}>
              {/* Preview header */}
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-default)" }}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--status-error)" }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--status-warning)" }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--status-success)" }} />
                  </div>
                  <span className="text-[11px] font-medium ml-2" style={{ color: "var(--text-tertiary)" }}>dashboard.meterverse.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-3 rounded" style={{ backgroundColor: "var(--border-default)" }} />
                  <div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: "rgba(var(--brand-primary-rgb), 0.1)" }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
                  </div>
                </div>
              </div>

              {/* Preview body */}
              <div className="p-5 space-y-4">
                {/* KPI row */}
                <div className="grid grid-cols-2 gap-3">
                  <KpiCard label="Active Meters" value="12,847" trend="up" />
                  <KpiCard label="Collection Rate" value="94.2%" trend="up" />
                  <KpiCard label="Revenue (MTD)" value="$2.4M" trend="up" />
                  <KpiCard label="Avg Response" value="1.8s" trend="down" />
                </div>

                {/* Mini chart */}
                <div className="rounded-xl p-4" style={{ backgroundColor: "var(--surface-sunken)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Consumption Trend (30 days)</span>
                    <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>+12.4% vs last month</span>
                  </div>
                  <MiniChart />
                </div>

                {/* Status row */}
                <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-tertiary)" }}>
                  <span>System Status</span>
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-1.5 font-medium" style={{ color: "var(--status-success)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--status-success)" }} />
                    All Systems Operational
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
