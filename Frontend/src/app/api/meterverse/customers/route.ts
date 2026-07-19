import { NextRequest, NextResponse } from "next/server"
import { apiBackend } from "@/lib/api-client"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      return NextResponse.json(await apiBackend(`/customers?${searchParams.toString()}`))
    } catch {}
  }

  return NextResponse.json({
    customers: [],
    total: 0,
    page: Number(searchParams.get("page") ?? 1),
    limit: Number(searchParams.get("limit") ?? 10),
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      return NextResponse.json(await apiBackend("/customers", { method: "POST", body: JSON.stringify(body) }), { status: 201 })
    } catch {}
  }

  return NextResponse.json({ id: Date.now(), ...body }, { status: 201 })
}
