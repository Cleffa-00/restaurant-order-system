// app/api/v1/orders/number/[orderNumber]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { ApiResponseBuilder } from '@/types/api'
import { 
  ERROR_MESSAGES,
  API_RESPONSE_CODES,
  REGEX_PATTERNS
} from '@/types/constants'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderNumber: string }> }
) {
  try {
    // 验证 context 是否存在
    if (!context || !context.params) {
      return NextResponse.json(
        ApiResponseBuilder.error(
          'Invalid request parameters',
          'INVALID_REQUEST',
          API_RESPONSE_CODES.BAD_REQUEST
        ),
        { status: API_RESPONSE_CODES.BAD_REQUEST }
      )
    }

    // 在 Next.js 15 中需要 await params
    const params = await context.params
    const { orderNumber } = params

    if (!orderNumber) {
      return NextResponse.json(
        ApiResponseBuilder.error(
          'Order number is required',
          'INVALID_REQUEST',
          API_RESPONSE_CODES.BAD_REQUEST
        ),
        { status: API_RESPONSE_CODES.BAD_REQUEST }
      )
    }

    // 验证订单号格式
    if (!REGEX_PATTERNS.ORDER_NUMBER.test(orderNumber)) {
      return NextResponse.json(
        ApiResponseBuilder.error(
          'Invalid order number format',
          'INVALID_ORDER_NUMBER',
          API_RESPONSE_CODES.BAD_REQUEST,
          { 
            expectedFormat: 'R + YYMMDD + - + XXXX (e.g., R250527-1234)',
            providedOrderNumber: orderNumber 
          }
        ),
        { status: API_RESPONSE_CODES.BAD_REQUEST }
      )
    }

    const order = await prisma.order.findUnique({
      where: {
        orderNumber: orderNumber
      },
      include: {
        items: {
          include: {
            options: {
              include: {
                menuOption: true
              }
            },
            menuItem: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        ApiResponseBuilder.error(
          ERROR_MESSAGES.ORDER_NOT_FOUND,
          'ORDER_NOT_FOUND',
          API_RESPONSE_CODES.NOT_FOUND,
          { orderNumber }
        ),
        { status: API_RESPONSE_CODES.NOT_FOUND }
      )
    }

    return NextResponse.json(
      ApiResponseBuilder.success(order, 'Order retrieved successfully')
    )

  } catch (error) {
    return NextResponse.json(
      ApiResponseBuilder.error(
        ERROR_MESSAGES.SERVER_ERROR,
        'INTERNAL_SERVER_ERROR',
        API_RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        process.env.NODE_ENV === 'development' ? { 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        } : undefined
      ),
      { status: API_RESPONSE_CODES.INTERNAL_SERVER_ERROR }
    )
  }
}