import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In - MeterVerse",
  description: "Sign in to MeterVerse",
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: "var(--surface-base, #FAFAFA)" }}>
      <div className="w-full max-w-sm p-6 rounded-xl border" style={{ backgroundColor: "var(--surface-raised, #FFFFFF)", borderColor: "var(--border-default, #E5E5E5)" }}>
        <div className="text-center mb-6">
          <div className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: "#00BFA5" }}>MV</div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary, #0A0A0A)" }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary, #737373)" }}>Sign in to MeterVerse</p>
        </div>
        <div className="space-y-3">
          <input type="email" placeholder="Email" className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "var(--border-default, #E5E5E5)", backgroundColor: "var(--surface-sunken, #F0F0F0)" }} />
          <input type="password" placeholder="Password" className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "var(--border-default, #E5E5E5)", backgroundColor: "var(--surface-sunken, #F0F0F0)" }} />
          <button className="w-full py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#00BFA5" }}>Sign In</button>
        </div>
      </div>
    </div>
  )
}
