// app/api/auth/send-sms/route.ts
import { NextRequest } from 'next/server'
import { ApiResponseBuilder, ApiErrorCode } from '@/types/api'

// 临时存储验证码 (生产环境请使用 Redis)
const smsCodeStore = new Map<string, { code: string; expires: number }>()

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return Response.json(
        ApiResponseBuilder.error(
          'Phone number is required',
          ApiErrorCode.MISSING_REQUIRED_FIELD,
          400
        ),
        { status: 400 }
      )
    }

    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = Date.now() + 5 * 60 * 1000 // 5分钟后过期

    // 存储验证码
    smsCodeStore.set(phone, { code, expires })

    // 这里应该调用真实的短信服务
    // 开发阶段我们只是在控制台输出
    console.log(`SMS Code for ${phone}: ${code}`)

    return Response.json(
      ApiResponseBuilder.success({ 
        message: 'SMS code sent successfully',
        // 开发环境返回验证码，生产环境不要返回
        ...(process.env.NODE_ENV === 'development' && { code })
      })
    )
  } catch (error) {
    console.error('Send SMS error:', error)
    return Response.json(
      ApiResponseBuilder.error(
        'Failed to send SMS',
        ApiErrorCode.EXTERNAL_SERVICE_ERROR,
        500
      ),
      { status: 500 }
    )
  }
}