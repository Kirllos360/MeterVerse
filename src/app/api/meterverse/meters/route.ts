import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meters?${searchParams.toString()}`, {
        headers: { Authorization: request.headers.get("authorization") || "" },
      })
      if (res.ok) return NextResponse.json(await res.json())
    } catch {}
  }

  return NextResponse.json({
    meters: [],
    total: 0,
    page: Number(searchParams.get("page") ?? 1),
    limit: Number(searchParams.get("limit") ?? 10),
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meters`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: request.headers.get("authorization") || "" },
        body: JSON.stringify(body),
      })
      if (res.ok) return NextResponse.json(await res.json(), { status: 201 })
    } catch {}
  }

  return NextResponse.json({ id: Date.now(), ...body }, { status: 201 })
}
