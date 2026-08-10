import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { logoutUser } from "@/identity/auth/api/auth-service"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  let refreshToken: string | undefined
  try {
    const body = await request.json()
    refreshToken = body?.refreshToken
  } catch {}

  // Forward the httpOnly session cookie as the Bearer token so the backend can
  // revoke the DB session (logout requires an authenticated request).
  const accessToken = cookieStore.get("mv_session")?.value
  await logoutUser(refreshToken, accessToken)

  cookieStore.delete("mv_session")

  return NextResponse.json({ success: true })
}
