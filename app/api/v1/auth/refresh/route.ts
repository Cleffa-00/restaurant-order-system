import { NextRequest } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { verifyRefreshToken, generateAccessToken } from '@/lib/api/services/auth'
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

    // 🔧 只生成新的 access token，保持原有的 refresh token
    const newAccessToken = await generateAccessToken({
      userId: user.id,
      phone: user.phone,
      role: user.role as Role
    })

    const response = Response.json(
      ApiResponseBuilder.success({
        accessToken: newAccessToken,
        // 🚫 不返回新的 refresh token
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role as Role,
          createdAt: user.createdAt
        }
      })
    )

    // 🔧 只设置新的 access token cookie，不触碰 refresh token
    response.headers.set('Set-Cookie', 
      `accessToken=${newAccessToken}; HttpOnly; Path=/; Max-Age=${15 * 60}; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`
    )
    
    return response
  } catch (error) {
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