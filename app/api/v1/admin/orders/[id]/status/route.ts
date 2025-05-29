// app/api/v1/admin/orders/[id]/status/route.ts - 更新订单状态

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const VALID_ORDER_STATUSES = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    // 验证状态值
    if (!status || !VALID_ORDER_STATUSES.includes(status)) {
      return NextResponse.json({
        success: false,
        error: {
          message: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS'
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

    // 更新订单状态
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
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

    // console.log(`✅ Order ${id} status updated to ${status}`)

    return NextResponse.json({
      success: true,
      data: formattedOrder
    })

  } catch (error) {
    // console.error('❌ Update order status API error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to update order status',
        code: 'UPDATE_STATUS_ERROR'
      }
    }, { status: 500 })
  }
}