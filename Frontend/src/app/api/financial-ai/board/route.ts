import { NextRequest, NextResponse } from "next/server"
import { apiBackend } from "@/lib/api-client"

export async function GET(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const res = await apiBackend("/financial-ai/board")
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({})
}
