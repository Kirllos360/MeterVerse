import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/") && request.nextUrl.pathname !== "/admin") {
    return NextResponse.redirect(new URL("/admin", request.url))
  }
  return NextResponse.next()
}
