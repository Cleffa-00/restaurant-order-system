// app/api/auth/register/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, hashPassword } from '@/lib/auth'
import { ApiResponseBuilder, ApiErrorCode } from '@/types/api'
import { Role } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { phone, code, password, name } = await request.json()

    if (!phone || !code || !password) {
      return Response.json(
        ApiResponseBuilder.error(
          'Phone, code and password are required',
          ApiErrorCode.MISSING_REQUIRED_FIELD,
          400
        ),
        { status: 400 }
      )
    }

    // 先验证SMS码
    const smsVerifyResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    })

    if (!smsVerifyResponse.ok) {
      const errorData = await smsVerifyResponse.json()
      return Response.json(errorData, { status: smsVerifyResponse.status })
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    })

    if (existingUser) {
      return Response.json(
        ApiResponseBuilder.error(
          'User already exists',
          ApiErrorCode.ALREADY_EXISTS,
          409
        ),
        { status: 409 }
      )
    }

    // 哈希密码
    const hashedPassword = await hashPassword(password)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        name: name || null,
        role: Role.USER // 默认为普通用户，管理员在数据库手动设置
      }
    })

    // 生成 JWT
    const token = await signToken({
      userId: user.id,
      phone: user.phone,
      role: user.role as Role
    })

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

    response.headers.set(
      'Set-Cookie', 
      `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`
    )
    
    return response
  } catch (error) {
    console.error('Registration error:', error)
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