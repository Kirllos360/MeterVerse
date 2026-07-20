import { NextRequest, NextResponse } from "next/server"
import { apiBackend } from "@/lib/api-client"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const res = await apiBackend(`/admin/cache/${id}`, { method: "DELETE" })
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ success: true })
}
