// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken, verifyRefreshToken, generateTokenPair } from '@/lib/auth'
import { Role } from '@/types'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  if (pathname.startsWith('/admin')) {
    // console.log('🚀 Middleware: Protecting admin route:', pathname)
    
    // 获取tokens
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '') || 
                       request.cookies.get('accessToken')?.value
    const refreshToken = request.cookies.get('refreshToken')?.value

    // console.log('🎫 Access Token found:', !!accessToken)
    // console.log('🔄 Refresh Token found:', !!refreshToken)

    // 尝试验证access token
    if (accessToken) {
      try {
        const payload = await verifyAccessToken(accessToken)
        // console.log('🔓 Access token valid:', !!payload)
        
        if (payload && payload.role === Role.ADMIN) {
          // console.log('✅ Access granted with valid access token')
          return NextResponse.next()
        }
      } catch (error) {
        // console.log('❌ Access token verification failed:', error)
      }
    }

    // Access token无效或不存在，尝试用refresh token刷新
    if (refreshToken) {
      // console.log('🔄 Attempting to refresh access token...')
      
      try {
        const refreshPayload = await verifyRefreshToken(refreshToken)
        
        if (refreshPayload) {
          // console.log('✅ Refresh token valid, generating new access token...')
          
          // 使用内部API调用来刷新token（避免Prisma在middleware中的问题）
          const refreshResponse = await fetch(new URL('/api/auth/refresh', request.url), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          })

          if (refreshResponse.ok) {
            const result = await refreshResponse.json()
            // console.log('🎉 Refresh API successful')
            
            if (result.success && result.data.user.role === Role.ADMIN) {
              // 创建响应并设置新的cookies
              const response = NextResponse.next()
              response.cookies.set('accessToken', result.data.accessToken, {
                httpOnly: true,
                path: '/',
                maxAge: 15 * 60, // 15分钟
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
              })

              // console.log('✅ New tokens set in cookies, allowing access')
              return response
            } else {
              // console.log('❌ User not admin or refresh failed')
            }
          } else {
            console.log('❌ Refresh API failed:', refreshResponse.status)
          }
        } else {
          console.log('❌ Refresh token invalid')
        }
      } catch (error) {
        console.log('❌ Refresh token verification failed:', error)
      }
    }

    // 所有token都无效，重定向到登录页面
    console.log('🚨 All tokens invalid, redirecting to login')
    // 清除无效的cookies
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}