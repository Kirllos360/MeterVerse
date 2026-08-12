import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// P58: session restore must use the REAL backend /me. Previously this BFF only
// decoded mock `mv_access_` tokens — a real JWT cookie always fell through to 401,
// so restoreSession silently depended on the localStorage fallback. Now it forwards
// the httpOnly mv_session cookie as a Bearer token to the backend.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.PORTAL_MODE === "1" ? "http://localhost:3003" : "http://localhost:3131")

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get("mv_session")

  if (!session?.value) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${session.value}` },
      cache: "no-store",
    })
    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }
    if (res.status === 401) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 })
    }
    return NextResponse.json({ error: "Upstream error" }, { status: res.status })
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 })
  }
}
