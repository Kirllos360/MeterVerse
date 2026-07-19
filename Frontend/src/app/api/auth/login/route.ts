import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { loginUser } from "@/identity/auth/api/auth-service"

export async function POST(request: NextRequest) {
  try {
    const { email, password, remember } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const data = await loginUser(email, password)
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
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Authentication failed"
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
