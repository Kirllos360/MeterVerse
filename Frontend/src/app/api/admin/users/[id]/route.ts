import { NextRequest, NextResponse } from "next/server"
import { apiBackend } from "@/lib/api-client"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const res = await apiBackend(`/admin/users/${id}`)
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ user: null })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const body = await request.json()
      const res = await apiBackend(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(body) })
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ user: null })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const res = await apiBackend(`/admin/users/${id}`, { method: "DELETE" })
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ success: true })
}
