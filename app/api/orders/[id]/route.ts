// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { OrderStatus, PaymentStatus } from '@/types'
import { ApiResponseBuilder } from '@/types/api'
import { 
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  API_RESPONSE_CODES
} from '@/types/constants'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // 验证 context 和 params 是否存在
    if (!context || !context.params) {
      console.error('Missing context or params in route handler')
      return NextResponse.json(
        ApiResponseBuilder.error(
          'Invalid request parameters',
          'INVALID_REQUEST',
          API_RESPONSE_CODES.BAD_REQUEST
        ),
        { status: API_RESPONSE_CODES.BAD_REQUEST }
      )
    }

    const { id } = context.params

    if (!id) {
      return NextResponse.json(
        ApiResponseBuilder.error(
          'Order ID is required',
          'INVALID_REQUEST',
          API_RESPONSE_CODES.BAD_REQUEST
        ),
        { status: API_RESPONSE_CODES.BAD_REQUEST }
      )
    }

    console.log('Fetching order by ID:', id)

    const order = await prisma.order.findUnique({
      where: {
        id: id
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
          API_RESPONSE_CODES.NOT_FOUND
        ),
        { status: API_RESPONSE_CODES.NOT_FOUND }
      )
    }

    console.log('Order found:', order.orderNumber)

    return NextResponse.json(
      ApiResponseBuilder.success(order, 'Order retrieved successfully')
    )

  } catch (error) {
    console.error('Error fetching order by ID:', error)
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

// 更新订单状态
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // 验证 context 和 params 是否存在
    if (!context || !context.params) {
      console.error('Missing context or params in route handler')
      return NextResponse.json(
        ApiResponseBuilder.error(
          'Invalid request parameters',
          'INVALID_REQUEST',
          API_RESPONSE_CODES.BAD_REQUEST
        ),
        { status: API_RESPONSE_CODES.BAD_REQUEST }
      )
    }

    const { id } = context.params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        ApiResponseBuilder.error(
          'Order ID is required',
          'INVALID_REQUEST',
          API_RESPONSE_CODES.BAD_REQUEST
        ),
        { status: API_RESPONSE_CODES.BAD_REQUEST }
      )
    }

    // 验证请求体
    const allowedUpdates = ['status', 'paymentStatus']
    const updates = Object.keys(body)
    const isValidUpdate = updates.every(update => allowedUpdates.includes(update))

    if (!isValidUpdate) {
      return NextResponse.json(
        ApiResponseBuilder.error(
          'Invalid update fields',
          'INVALID_REQUEST',
          API_RESPONSE_CODES.BAD_REQUEST,
          { allowedFields: allowedUpdates }
        ),
        { status: API_RESPONSE_CODES.BAD_REQUEST }
      )
    }

    // 验证状态值
    if (body.status && !Object.values(OrderStatus).includes(body.status)) {
      return NextResponse.json(
        ApiResponseBuilder.error(
          ERROR_MESSAGES.INVALID_ORDER_STATUS,
          'INVALID_REQUEST',
          API_RESPONSE_CODES.BAD_REQUEST,
          { allowedStatuses: Object.values(OrderStatus) }
        ),
        { status: API_RESPONSE_CODES.BAD_REQUEST }
      )
    }

    if (body.paymentStatus && !Object.values(PaymentStatus).includes(body.paymentStatus)) {
      return NextResponse.json(
        ApiResponseBuilder.error(
          'Invalid payment status',
          'INVALID_REQUEST',
          API_RESPONSE_CODES.BAD_REQUEST,
          { allowedStatuses: Object.values(PaymentStatus) }
        ),
        { status: API_RESPONSE_CODES.BAD_REQUEST }
      )
    }

    console.log('Updating order:', id, 'with data:', body)

    // 检查订单是否存在
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    })

    if (!existingOrder) {
      return NextResponse.json(
        ApiResponseBuilder.error(
          ERROR_MESSAGES.ORDER_NOT_FOUND,
          'ORDER_NOT_FOUND',
          API_RESPONSE_CODES.NOT_FOUND
        ),
        { status: API_RESPONSE_CODES.NOT_FOUND }
      )
    }

    // 状态转换验证
    if (body.status) {
      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PENDING]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
        [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
        [OrderStatus.READY]: [OrderStatus.COMPLETED],
        [OrderStatus.COMPLETED]: [], // 已完成不能再改变
        [OrderStatus.CANCELLED]: [], // 已取消不能再改变
      }

      const allowedNextStatuses = validTransitions[existingOrder.status as OrderStatus] || []
      
      if (!allowedNextStatuses.includes(body.status)) {
        return NextResponse.json(
          ApiResponseBuilder.error(
            `Cannot change order status from ${existingOrder.status} to ${body.status}`,
            'INVALID_STATUS_TRANSITION',
            API_RESPONSE_CODES.BAD_REQUEST,
            { 
              currentStatus: existingOrder.status, 
              requestedStatus: body.status,
              allowedStatuses: allowedNextStatuses 
            }
          ),
          { status: API_RESPONSE_CODES.BAD_REQUEST }
        )
      }
    }

    // 更新订单
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...body,
        // 如果状态更新为 COMPLETED，可以添加完成时间等
        ...(body.status === OrderStatus.COMPLETED && {
          // completedAt: new Date() // 如果你在 schema 中有这个字段
        })
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

    console.log('Order updated successfully:', updatedOrder.orderNumber)

    return NextResponse.json(
      ApiResponseBuilder.success(updatedOrder, SUCCESS_MESSAGES.ORDER_UPDATED)
    )

  } catch (error) {
    console.error('Error updating order:', error)
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