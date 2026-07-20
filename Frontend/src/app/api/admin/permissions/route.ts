import { NextRequest, NextResponse } from "next/server"
import { apiBackend } from "@/lib/api-client"

export async function GET(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const sp = request.nextUrl.searchParams.toString()
      const res = await apiBackend("/admin/permissions" + (sp ? "?" + sp : ""))
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ permissions: [], total: 0 })
}
