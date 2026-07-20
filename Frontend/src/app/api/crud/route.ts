import { NextRequest, NextResponse } from "next/server"
import { apiBackend } from "@/lib/api-client"

export async function POST(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const body = await request.json()
      const res = await apiBackend("/crud/" + body.modelName + "/" + (body.action || "import"), { method: "POST", body: JSON.stringify(body) })
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ success: false })
}

export async function PUT(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const body = await request.json()
      const res = await apiBackend("/crud/" + body.modelName + "/bulk-update", { method: "POST", body: JSON.stringify(body) })
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ success: false })
}

export async function GET(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const sp = request.nextUrl.searchParams.toString()
      const modelName = request.nextUrl.searchParams.get("modelName") || "auditEntry"
      const id = request.nextUrl.searchParams.get("id") || ""
      const path = id ? "/crud/" + modelName + "/" + id + "/history" : "/crud/" + modelName + "/export?" + sp
      const res = await apiBackend(path)
      return NextResponse.json(res)
    }
  } catch {}
  return NextResponse.json({ data: [] })
}
