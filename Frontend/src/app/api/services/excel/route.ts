import { NextRequest, NextResponse } from "next/server"
import { apiBackend } from "@/lib/api-client"

export async function GET(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const res = await apiBackend("/services/excel")
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ excel: [], total: 0 })
}

export async function POST(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const body = await request.json()
      const res = await apiBackend("/services/excel", { method: "POST", body: JSON.stringify(body) })
      return NextResponse.json(res, { status: 201 })
    }
  } catch {}
  return NextResponse.json({ success: true }, { status: 201 })
}
