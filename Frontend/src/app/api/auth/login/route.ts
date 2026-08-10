import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { loginUser } from "@/identity/auth/api/auth-service"

export async function POST(request: NextRequest) {
  try {
    const { email, password, remember } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    // P57 profile-aware login: derive system_type from the request port so the
    // SAME login UI hits the correct backend system (user=portal, admin=console).
    const host = request.headers.get("host") || ""
    const port = host.split(":")[1] || ""
    const systemType = port === "3030" ? "user" : "admin"

    const data = await loginUser(email, password, systemType)
    const cookieStore = await cookies()

    // Set access token as httpOnly cookie
    cookieStore.set("mv_session", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: remember ? 86400 * 30 : 3600,
    })

    return NextResponse.json({
      user: data.user,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      redirect: data.redirect,
      system: data.system,
      portal: data.portal,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Authentication failed"
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
