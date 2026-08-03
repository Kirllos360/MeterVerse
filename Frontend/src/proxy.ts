import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get("host") || ""
  const port = host.split(":")[1] || "3535"
  const isPortal = process.env.PORTAL_MODE === "1"

  // === ADMIN FRONTEND (:3535) ===
  if (!isPortal) {
    // Allow Next.js internals and static assets
    if (pathname.startsWith("/_next") || pathname.match(/\.\w+$/)) {
      return NextResponse.next()
    }
    // Admin routes + root pass through
    if (pathname.startsWith("/admin") || pathname === "/") {
      return NextResponse.next()
    }
    // Everything else → redirect to /
    return NextResponse.redirect(new URL("/", request.url))
  }

  // === PORTAL FRONTEND (:3030) ===
  // Allow portal routes, auth, assets
  if (
    pathname.startsWith("/user") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/" ||
    pathname.match(/\.\w+$/)
  ) {
    return NextResponse.next()
  }
  // Everything else on portal → redirect to /
  return NextResponse.redirect(new URL("/", request.url))
}

export const config = {
  matcher: ["/((?!_next|api|.*\\.[a-zA-Z0-9]+$).*)"],
}
