import { NextRequest, NextResponse } from "next/server"
import { apiBackend } from "@/lib/api-client"

export async function POST(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const body = await request.json()
      const res = await apiBackend("/business/pipeline/execute", { method: "POST", body: JSON.stringify(body) })
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ success: false })
}
