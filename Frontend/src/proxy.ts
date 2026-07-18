import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get("host") || ""
  const port = host.split(":")[1] || "7400"

  // === PORT 7500 (Admin Platform) ===
  if (port === "7500") {
    // Allow Next.js internals and static assets
    if (pathname.startsWith("/_next") || pathname.match(/\.\w+$/)) {
      return NextResponse.next()
    }
    // Admin login is always accessible (entry point)
    if (pathname === "/admin/login") {
      return NextResponse.next()
    }
    // All /admin/* routes pass through
    if (pathname.startsWith("/admin")) {
      return NextResponse.next()
    }
    // Everything else on port 7500 → redirect to admin login
    const loginUrl = new URL("/admin/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // === PORT 7400 (Main System) ===
  // Allow admin routes
  if (pathname.startsWith("/admin")) {
    return NextResponse.next()
  }
  // Root passes through
  if (pathname === "/") {
    return NextResponse.next()
  }
  // Everything else → redirect to /
  return NextResponse.redirect(new URL("/", request.url))
}

export const config = {
  matcher: ["/((?!_next|api|.*\\.[a-zA-Z0-9]+$).*)"],
}
