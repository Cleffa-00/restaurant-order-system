import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isAdmin } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 保护管理员路径
  if (path.startsWith("/admin")) {
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    const adminCheck = await isAdmin(token)
    
    if (!adminCheck) {
      // 如果是 API 请求，返回 401
      if (path.startsWith('/admin/api')) {
        return NextResponse.json(
          { error: 'Unauthorized' }, 
          { status: 401 }
        )
      }
      
      // 页面请求重定向到登录
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    // 可以添加其他需要保护的路径
  ],
}