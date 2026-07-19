import { NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/identity/auth/api/auth-service"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name required" }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const user = await registerUser({ email, password, name })
    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed"
    const status = message === "Email already registered" ? 409 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
