import { NextRequest, NextResponse } from "next/server"
import { apiBackend } from "@/lib/api-client"

export async function GET(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const sp = request.nextUrl.searchParams.toString()
      const res = await apiBackend("/services/activity" + (sp ? "?" + sp : ""))
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ activity: [], total: 0 })
}
export async function POST(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const body = await request.json()
      const res = await apiBackend("/services/activity", { method: "POST", body: JSON.stringify(body) })
      return NextResponse.json(res, { status: 201 })
    }
  } catch {}
  return NextResponse.json({ success: true }, { status: 201 })
}
