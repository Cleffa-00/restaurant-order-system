// app/api/auth/login/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTokenPair, verifyPassword } from '@/lib/auth'
import { ApiResponseBuilder, ApiErrorCode } from '@/types/api'
import { LoginRequest, Role } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { phone, password } = body

    if (!phone || !password) {
      return Response.json(
        ApiResponseBuilder.error(
          'Phone and password are required',
          ApiErrorCode.MISSING_REQUIRED_FIELD,
          400
        ),
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { phone }
    })

    if (!user) {
      return Response.json(
        ApiResponseBuilder.error(
          'Invalid credentials',
          ApiErrorCode.INVALID_CREDENTIALS,
          401
        ),
        { status: 401 }
      )
    }

    const isPasswordValid = await verifyPassword(password, user.password)
    
    if (!isPasswordValid) {
      return Response.json(
        ApiResponseBuilder.error(
          'Invalid credentials',
          ApiErrorCode.INVALID_CREDENTIALS,
          401
        ),
        { status: 401 }
      )
    }

    // 生成双token
    const tokenPair = await generateTokenPair({
      userId: user.id,
      phone: user.phone,
      role: user.role as Role
    })

    const response = Response.json(
      ApiResponseBuilder.success({
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role as Role,
          createdAt: user.createdAt
        }
      })
    )

    // 设置双cookie
    response.headers.set('Set-Cookie', [
      `accessToken=${tokenPair.accessToken}; HttpOnly; Path=/; Max-Age=${15 * 60}; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`,
      `refreshToken=${tokenPair.refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`
    ].join(', '))
    
    return response
  } catch (error) {
    console.error('Login error:', error)
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