// app/api/auth/refresh/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRefreshToken, generateTokenPair } from '@/lib/auth'
import { ApiResponseBuilder, ApiErrorCode } from '@/types/api'
import { Role } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return Response.json(
        ApiResponseBuilder.error(
          'Refresh token is required',
          ApiErrorCode.MISSING_REQUIRED_FIELD,
          400
        ),
        { status: 400 }
      )
    }

    // 验证refresh token
    const payload = await verifyRefreshToken(refreshToken)
    
    if (!payload) {
      return Response.json(
        ApiResponseBuilder.error(
          'Invalid or expired refresh token',
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

    // 生成新的token对
    const newTokenPair = await generateTokenPair({
      userId: user.id,
      phone: user.phone,
      role: user.role as Role
    })

    const response = Response.json(
      ApiResponseBuilder.success({
        accessToken: newTokenPair.accessToken,
        refreshToken: newTokenPair.refreshToken,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role as Role,
          createdAt: user.createdAt
        }
      })
    )

    // 设置新的cookies
    response.headers.set('Set-Cookie', [
      `accessToken=${newTokenPair.accessToken}; HttpOnly; Path=/; Max-Age=${15 * 60}; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`,
      `refreshToken=${newTokenPair.refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`
    ].join(', '))
    
    return response
  } catch (error) {
    console.error('Refresh token error:', error)
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