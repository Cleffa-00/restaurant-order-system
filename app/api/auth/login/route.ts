// app/api/auth/login/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, verifyPassword } from '@/lib/auth'
import { ApiResponseBuilder, ApiErrorCode } from '@/types/api'
import { LoginRequest, Role } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { phone, password } = body

    // 验证输入
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

    // 查找用户
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

    // 验证密码 - 使用我们的 Web Crypto API 函数
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

    // 生成 JWT
    const token = await signToken({
      userId: user.id,
      phone: user.phone,
      role: user.role as Role
    })

    // 创建响应
    const response = Response.json(
      ApiResponseBuilder.success({
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role as Role,
          createdAt: user.createdAt
        }
      })
    )

    // 设置 HttpOnly cookie
    response.headers.set(
      'Set-Cookie', 
      `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`
    )
    
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