// app/api/admin/orders/[id]/payment/route.ts - 更新支付状态

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const VALID_PAYMENT_STATUSES = ['UNPAID', 'PAID']

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { paymentStatus } = body

    // 验证支付状态值
    if (!paymentStatus || !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json({
        success: false,
        error: {
          message: `Invalid payment status. Must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}`,
          code: 'INVALID_PAYMENT_STATUS'
        }
      }, { status: 400 })
    }

    // 验证订单是否存在
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    })

    if (!existingOrder) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Order not found',
          code: 'ORDER_NOT_FOUND'
        }
      }, { status: 404 })
    }

    // 更新支付状态
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { paymentStatus },
      include: {
        items: {
          include: {
            options: true
          }
        }
      }
    })

    // 转换数据格式
    const formattedOrder = {
      ...updatedOrder,
      subtotal: Number(updatedOrder.subtotal),
      taxAmount: Number(updatedOrder.taxAmount),
      serviceFee: Number(updatedOrder.serviceFee),
      total: Number(updatedOrder.total),
      createdAt: updatedOrder.createdAt.toISOString(),
      items: updatedOrder.items.map(item => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        finalPrice: Number(item.finalPrice),
        options: item.options.map(option => ({
          ...option,
          priceDelta: Number(option.priceDelta)
        }))
      }))
    }

    console.log(`✅ Order ${id} payment status updated to ${paymentStatus}`)

    return NextResponse.json({
      success: true,
      data: formattedOrder
    })

  } catch (error) {
    console.error('❌ Update payment status API error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to update payment status',
        code: 'UPDATE_PAYMENT_ERROR'
      }
    }, { status: 500 })
  }
}