"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuthRuntime } from "@/identity/auth/AuthRuntime"

function SignalWave() {
  return (
    <motion.svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]" viewBox="0 0 1200 800" preserveAspectRatio="none"
      animate={{ opacity: [0.04, 0.08, 0.04] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="wave-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="var(--brand)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d="M0,400 C200,200 400,600 600,400 C800,200 1000,600 1200,400" fill="none" stroke="url(#wave-grad)" strokeWidth="2" />
      <path d="M0,450 C200,250 400,650 600,450 C800,250 1000,650 1200,450" fill="none" stroke="url(#wave-grad)" strokeWidth="1.5" opacity="0.6" />
      <path d="M0,500 C200,300 400,700 600,500 C800,300 1000,700 1200,500" fill="none" stroke="url(#wave-grad)" strokeWidth="1" opacity="0.3" />
    </motion.svg>
  )
}

function Heartbeat() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.svg width="120" height="120" viewBox="0 0 100 100" className="opacity-[0.06]">
        <motion.path d="M50,30 C50,20 35,10 25,25 C15,40 20,55 50,80 C80,55 85,40 75,25 C65,10 50,20 50,30Z"
          fill="var(--brand)"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} />
      </motion.svg>
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
        <SignalWave />
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
    <div className="flex min-h-screen relative overflow-hidden" style={{ backgroundColor: "var(--panel-accent)" }}>
      {/* Full screen brand background */}
      <AnimatedGrid />
      <SignalWave />
      <Heartbeat />

      {/* Ambient glow */}
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(var(--brand-rgb), 0.1) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(var(--brand-rgb), 0.06) 0%, transparent 70%)" }} />

      {/* Centered login */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "var(--brand)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">MeterVerse</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>Enterprise Utility OS</p>
          </div>

          <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>Full name</label>
                  <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                    style={{ borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)", color: "white", "--tw-ring-color": "var(--brand)" } as React.CSSProperties}
                    placeholder="Enter your name" required autoFocus />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                  style={{ borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)", color: "white", "--tw-ring-color": "var(--brand)" } as React.CSSProperties}
                  placeholder={mode === "login" ? "admin@meterverse.com" : "Enter your email"} required autoFocus={mode === "login"} />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>Password</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                  style={{ borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)", color: "white", "--tw-ring-color": "var(--brand)" } as React.CSSProperties}
                  placeholder={mode === "login" ? "Enter your password" : "Min 6 characters"} required />
              </div>

              {mode === "signup" && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>Confirm password</label>
                  <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                    style={{ borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)", color: "white", "--tw-ring-color": "var(--brand)" } as React.CSSProperties}
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

function AnimatedGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]">
      <defs>
        <pattern id="login-grid" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M 64 0 L 0 0 0 64" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#login-grid)" />
    </svg>
  )
}
