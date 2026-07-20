import { NextRequest, NextResponse } from "next/server"
import { apiBackend } from "@/lib/api-client"

async function handleRequest(request: NextRequest, method: string, path: string) {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const sp = request.nextUrl.searchParams.toString()
      const url = path + (sp && method === "GET" ? "?" + sp : "")
      const opts: RequestInit = { method }
      if (method !== "GET" && method !== "DELETE") {
        opts.body = JSON.stringify(await request.json())
      }
      const res = await apiBackend(url, opts)
      return NextResponse.json(res)
    }
  } catch {}
  return method === "GET"
    ? NextResponse.json({ entries: [], total: 0, page: 1, limit: 20 })
    : NextResponse.json({ success: true })
}

export async function GET(request: NextRequest) { return handleRequest(request, "GET", "/admin/audit") }
export async function POST(request: NextRequest) { return handleRequest(request, "POST", "/admin/audit") }

