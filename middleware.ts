import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if it's a protected path
  const isAdminPath = path.startsWith('/admin')
  
  // If it's not a protected path, allow the request
  
  // if (!isAdminPath) {
  //   return NextResponse.next()
  // }
  return NextResponse.next()

  // Get the token from cookies
  const token = request.cookies.get('admin-token')?.value

  // If no token is present and trying to access protected route, redirect to login
  if (!token && isAdminPath) {
    const url = new URL('/auth/login', request.url)
    return NextResponse.redirect(url)
  }

  // In a real app, this would verify the JWT token and check the admin role
  // For now, we'll just allow the request if a token exists
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 