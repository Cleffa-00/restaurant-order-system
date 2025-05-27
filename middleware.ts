import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if it's a protected path
  const isAdminPath = path.startsWith("/admin")

  // For now, allow all requests to pass through
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
}
