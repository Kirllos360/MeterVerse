import { NextRequest, NextResponse } from "next/server"
import { apiBackend } from "@/lib/api-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const res = await apiBackend("/meters/" + params.id)
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ meters: null, error: "Not found" }, { status: 404 })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    if (process.env.NEXT_PUBLIC_API_URL) {
      const res = await apiBackend("/meters/" + params.id, { method: "PUT", body: JSON.stringify(body) })
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ meters: null, error: "Update failed" }, { status: 500 })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const res = await apiBackend("/meters/" + params.id, { method: "DELETE" })
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 })
}