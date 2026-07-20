import { NextRequest, NextResponse } from "next/server"
import { apiBackend } from "@/lib/api-client"

export async function GET(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const res = await apiBackend("/business/pipeline/status")
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ stats: {}, recentRuns: [] })
}
