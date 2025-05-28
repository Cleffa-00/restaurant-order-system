// app/api/auth/register/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTokenPair, hashPassword } from '@/lib/auth'
import { ApiResponseBuilder, ApiErrorCode } from '@/types/api'
import { Role } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { phone, password, name, code } = await request.json()

    // 只要求手机号和密码，验证码是可选的
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

    // 如果提供了验证码，则验证SMS
    if (code) {
      try {
        const smsVerifyResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, code }),
        })

        if (!smsVerifyResponse.ok) {
          let errorMessage = 'Invalid verification code'
          try {
            const errorData = await smsVerifyResponse.json()
            errorMessage = errorData.error?.message || errorMessage
          } catch (parseError) {
            console.error('Failed to parse SMS verification error:', parseError)
          }
          
          return Response.json(
            ApiResponseBuilder.error(
              errorMessage,
              ApiErrorCode.INVALID_CREDENTIALS,
              400
            ),
            { status: 400 }
          )
        }
        
        console.log('✅ SMS verification successful')
      } catch (smsError) {
        console.error('SMS verification failed:', smsError)
        return Response.json(
          ApiResponseBuilder.error(
            'SMS verification service unavailable',
            ApiErrorCode.EXTERNAL_SERVICE_ERROR,
            500
          ),
          { status: 500 }
        )
      }
    } else {
      console.log('⚠️  Registration without SMS verification (development mode)')
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
        role: Role.USER // 默认为普通用户，管理员需要在数据库手动设置
      }
    })

    console.log('✅ User created successfully:', user.phone)

    // 生成 JWT
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



    // 设置 HttpOnly cookie
    response.headers.set('Set-Cookie', [
      `accessToken=${tokenPair.accessToken}; HttpOnly; Path=/; Max-Age=${15 * 60}; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`,
      `refreshToken=${tokenPair.refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`
    ].join(', '))

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