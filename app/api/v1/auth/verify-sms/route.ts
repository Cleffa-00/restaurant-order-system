// app/api/auth/verify-sms/route.ts
import { NextRequest } from 'next/server'
import { ApiResponseBuilder, ApiErrorCode } from '@/types/api'
import { smsCodeStore } from '@/lib/api/services/sms-store'

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return Response.json(
        ApiResponseBuilder.error(
          'Phone and code are required',
          ApiErrorCode.MISSING_REQUIRED_FIELD,
          400
        ),
        { status: 400 }
      )
    }

    const storedData = smsCodeStore.get(phone)

    if (!storedData) {
      return Response.json(
        ApiResponseBuilder.error(
          'No SMS code found for this phone',
          ApiErrorCode.NOT_FOUND,
          404
        ),
        { status: 404 }
      )
    }

    if (Date.now() > storedData.expires) {
      smsCodeStore.delete(phone)
      return Response.json(
        ApiResponseBuilder.error(
          'SMS code has expired',
          ApiErrorCode.TOKEN_EXPIRED,
          400
        ),
        { status: 400 }
      )
    }

    if (storedData.code !== code) {
      return Response.json(
        ApiResponseBuilder.error(
          'Invalid SMS code',
          ApiErrorCode.INVALID_CREDENTIALS,
          400
        ),
        { status: 400 }
      )
    }

    // 验证成功，删除验证码
    smsCodeStore.delete(phone)

    return Response.json(
      ApiResponseBuilder.success({ 
        message: 'SMS code verified successfully' 
      })
    )
  } catch (error) {
    console.error('Verify SMS error:', error)
    return Response.json(
      ApiResponseBuilder.error(
        'Failed to verify SMS code',
        ApiErrorCode.INTERNAL_SERVER_ERROR,
        500
      ),
      { status: 500 }
    )
  }
}