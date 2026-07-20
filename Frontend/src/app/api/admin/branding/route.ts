import { NextRequest, NextResponse } from "next/server"
import { apiBackend } from "@/lib/api-client"

export async function GET(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const sp = request.nextUrl.searchParams.toString()
      const res = await apiBackend("/admin/branding" + (sp ? "?" + sp : ""))
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ branding: [], total: 0 })
}
export async function PUT(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const body = await request.json()
      const res = await apiBackend("/admin/branding", { method: "PUT", body: JSON.stringify(body) })
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ success: true })
}
