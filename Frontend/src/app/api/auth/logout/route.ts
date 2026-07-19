import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { logoutUser } from "@/identity/auth/api/auth-service"

export async function POST() {
  const cookieStore = await cookies()

  await logoutUser()

  cookieStore.delete("mv_session")

  return NextResponse.json({ success: true })
}
