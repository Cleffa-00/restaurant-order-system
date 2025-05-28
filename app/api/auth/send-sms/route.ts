// app/api/auth/send-sms/route.ts
import { NextRequest } from 'next/server'
import { ApiResponseBuilder, ApiErrorCode } from '@/types/api'
import { smsCodeStore } from '@/lib/sms-store'

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

    // 开发阶段在控制台输出验证码
    console.log(`📱 SMS Code for ${phone}: ${code}`)

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