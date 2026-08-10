import { redirect } from "next/navigation"

// P57: single shared login. The old fake admin login (no auth, 800ms->/admin)
// is removed. All sign-in flows go through the real /login page (profile-aware).
export default function AdminLoginPage() {
  redirect("/login")
}
