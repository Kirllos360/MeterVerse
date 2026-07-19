"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuthRuntime } from "@/identity/auth/AuthRuntime"

export default function AdminLoginPage() {
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
    <div className="flex min-h-screen" style={{ backgroundColor: "#FAFAFA" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-16 relative overflow-hidden" style={{ backgroundColor: "var(--panel-accent)" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div whileHover={{ rotate: [0, -5, 5, 0] }} className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: "var(--brand-primary)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-3">MeterVerse</h1>
          <p className="text-base mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>Enterprise Utility Operating System</p>
          {["Role-based Access Control", "Multi-tenant Architecture", "Real-time Monitoring", "Advanced Analytics"].map((f, i) => (
            <motion.div key={f} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3 mb-2">
              <motion.svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2.5"
                whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{f}</span>
            </motion.div>
          ))}
          <div className="mt-12 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            <p>Version 8.0.0</p>
            <p className="mt-1">© 2026 MeterVerse. All rights reserved.</p>
          </div>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div key={mode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <motion.div whileHover={{ rotate: [0, -5, 5, 0] }} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--brand-primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </motion.div>
            <span className="text-lg font-bold" style={{ color: "var(--text-primary, #0A0A0A)" }}>MeterVerse</span>
          </div>

          <h2 className="text-xl font-semibold mb-1" style={{ color: "var(--text-primary, #0A0A0A)" }}>
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary, #737373)" }}>
            {mode === "login" ? "Sign in to the Enterprise Control Center" : "Register for a new workspace account"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.3 }}>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary, #737373)" }}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-[var(--brand-primary)]"
                  style={{ borderColor: "var(--border-default, #E5E5E5)", backgroundColor: "var(--surface-sunken, #F0F0F0)", color: "var(--text-primary, #0A0A0A)" }}
                  placeholder="Enter your name" required autoFocus />
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary, #737373)" }}>
                {mode === "login" ? "Username" : "Email Address"}
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-[var(--brand-primary)]"
                style={{ borderColor: "var(--border-default, #E5E5E5)", backgroundColor: "var(--surface-sunken, #F0F0F0)", color: "var(--text-primary, #0A0A0A)" }}
                placeholder={mode === "login" ? "Enter your email" : "Enter your email address"} required autoFocus={mode === "login"} />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary, #737373)" }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.password)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-[var(--brand-primary)]"
                style={{ borderColor: "var(--border-default, #E5E5E5)", backgroundColor: "var(--surface-sunken, #F0F0F0)", color: "var(--text-primary, #0A0A0A)" }}
                placeholder={mode === "login" ? "Enter your password" : "Create a password (min 6 chars)"} required />
            </div>

            {mode === "signup" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.3 }}>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary, #737373)" }}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-[var(--brand-primary)]"
                  style={{ borderColor: "var(--border-default, #E5E5E5)", backgroundColor: "var(--surface-sunken, #F0F0F0)", color: "var(--text-primary, #0A0A0A)" }}
                  placeholder="Confirm your password" required />
              </motion.div>
            )}

            {mode === "login" && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded" />
                  <span className="text-xs" style={{ color: "var(--text-secondary, #737373)" }}>Remember this device</span>
                </label>
                <button type="button" className="text-xs font-medium" style={{ color: "var(--brand-primary)" }}>Forgot password?</button>
              </div>
            )}

            {(error || localError) && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg text-xs" style={{ backgroundColor: "rgba(var(--status-error-rgb), 0.08)", color: "#DC2626" }}>
                {localError || error}
                {!localError && isLocked() && <span> ({remainingLockout()} min remaining)</span>}
              </motion.div>
            )}

            <motion.button type="submit" disabled={isLoading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all"
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

          <div className="mt-4 text-center">
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setLocalError(null) }}
              className="text-xs font-medium hover:underline" style={{ color: "var(--brand-primary)" }}>
              {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-6 pt-4 text-center" style={{ borderTop: "1px solid var(--border-default, #E5E5E5)" }}>
            <p className="text-[10px]" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>
              Unauthorized access is prohibited. All activities are monitored and logged.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
