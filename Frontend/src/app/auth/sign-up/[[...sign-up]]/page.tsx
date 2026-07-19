import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up - MeterVerse",
  description: "Create a MeterVerse account",
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: "var(--surface-base)" }}>
      <div className="w-full max-w-sm p-6 rounded-xl border" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
        <div className="text-center mb-6">
          <div className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: "var(--brand-primary)" }}>MV</div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Create account</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Get started with MeterVerse</p>
        </div>
        <div className="space-y-3">
          <input type="text" placeholder="Full name" className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-sunken)" }} />
          <input type="email" placeholder="Email" className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-sunken)" }} />
          <input type="password" placeholder="Password" className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-sunken)" }} />
          <button className="w-full py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "var(--brand-primary)" }}>Create Account</button>
        </div>
      </div>
    </div>
  )
}
