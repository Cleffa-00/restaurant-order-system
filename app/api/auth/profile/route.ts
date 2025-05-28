// app/api/auth/profile/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { ApiResponseBuilder, ApiErrorCode } from '@/types/api'
import { Role } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // 从 Authorization header 获取 token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    // 也可以从 cookies 获取 token（如果没有 Authorization header）
    const cookieToken = request.cookies.get('token')?.value

    const tokenToUse = token || cookieToken

    if (!tokenToUse) {
      return Response.json(
        ApiResponseBuilder.error(
          'Authorization token required',
          ApiErrorCode.UNAUTHORIZED,
          401
        ),
        { status: 401 }
      )
    }

    // 验证 token
    const payload = await verifyToken(tokenToUse)
    
    if (!payload) {
      return Response.json(
        ApiResponseBuilder.error(
          'Invalid or expired token',
          ApiErrorCode.TOKEN_INVALID,
          401
        ),
        { status: 401 }
      )
    }

    // 从数据库获取最新的用户信息
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        createdAt: true
        // 不返回密码
      }
    })

    if (!user) {
      return Response.json(
        ApiResponseBuilder.error(
          'User not found',
          ApiErrorCode.NOT_FOUND,
          404
        ),
        { status: 404 }
      )
    }

    // 返回用户信息
    return Response.json(
      ApiResponseBuilder.success({
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role as Role,
        createdAt: user.createdAt
      })
    )
  } catch (error) {
    console.error('Profile API error:', error)
    return Response.json(
      ApiResponseBuilder.error(
        'Internal server error',
        ApiErrorCode.INTERNAL_SERVER_ERROR,
        500
      ),
      { status: 500 }
    )
  }
}