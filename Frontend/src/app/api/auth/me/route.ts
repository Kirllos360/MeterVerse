import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get("mv_session")

  if (!session?.value) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Decode the mock token to get user info
  try {
    const token = session.value
    if (token.startsWith("mv_access_")) {
      const payload = JSON.parse(atob(token.slice(10)))
      const user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split("@")[0],
        role: payload.role || "viewer",
        permissions:
          payload.role === "admin"
            ? ["read", "write", "delete", "admin", "export", "approve"]
            : payload.role === "operator"
              ? ["read", "write", "export"]
              : ["read"],
        area: "October",
        project: "Phase 1",
        tenant: "Palm Hills",
        language: "en",
        theme: "adaptive",
        mfaEnabled: false,
      }
      return NextResponse.json({ user })
    }
  } catch {}

  return NextResponse.json({ error: "Invalid session" }, { status: 401 })
}
