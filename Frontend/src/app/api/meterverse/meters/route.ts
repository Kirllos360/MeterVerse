import { NextRequest, NextResponse } from "next/server"
import { apiBackend } from "@/lib/api-client"

export async function GET(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const sp = request.nextUrl.searchParams.toString()
      const res = await apiBackend("/meters" + (sp ? "?" + sp : ""))
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ meters: [], total: 0, page: 1, limit: 10 })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      return NextResponse.json(await apiBackend("/meters", { method: "POST", body: JSON.stringify(body) }), { status: 201 })
    } catch {}
  }
  return NextResponse.json({ id: Date.now(), ...body }, { status: 201 })
}
