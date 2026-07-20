import { NextRequest, NextResponse } from "next/server"
import { apiBackend } from "@/lib/api-client"

export async function GET(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const res = await apiBackend("/security/audit/secrets")
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ findings: [], summary: { total: 0, high: 0, medium: 0, info: 0 } })
}
