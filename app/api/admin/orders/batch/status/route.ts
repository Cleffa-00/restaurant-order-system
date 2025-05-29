// app/api/admin/orders/batch/status/route.ts - 批量更新订单状态

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const VALID_ORDER_STATUSES = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderIds, status } = body

    // 验证输入
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'orderIds must be a non-empty array',
          code: 'INVALID_ORDER_IDS'
        }
      }, { status: 400 })
    }

    if (!status || !VALID_ORDER_STATUSES.includes(status)) {
      return NextResponse.json({
        success: false,
        error: {
          message: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS'
        }
      }, { status: 400 })
    }

    // 验证订单ID数量限制
    if (orderIds.length > 100) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Cannot update more than 100 orders at once',
          code: 'TOO_MANY_ORDERS'
        }
      }, { status: 400 })
    }

    // 首先检查所有订单是否存在
    const existingOrders = await prisma.order.findMany({
      where: {
        id: {
          in: orderIds
        }
      },
      select: {
        id: true
      }
    })

    const existingOrderIds = existingOrders.map(order => order.id)
    const notFoundOrderIds = orderIds.filter(id => !existingOrderIds.includes(id))

    if (notFoundOrderIds.length > 0) {
      return NextResponse.json({
        success: false,
        error: {
          message: `Orders not found: ${notFoundOrderIds.join(', ')}`,
          code: 'ORDERS_NOT_FOUND'
        }
      }, { status: 404 })
    }

    // 批量更新订单状态
    const updateResult = await prisma.order.updateMany({
      where: {
        id: {
          in: orderIds
        }
      },
      data: {
        status
      }
    })

    console.log(`✅ Batch update completed: ${updateResult.count} orders updated to ${status}`)

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: updateResult.count,
        updatedOrderIds: orderIds,
        newStatus: status,
        message: `Successfully updated ${updateResult.count} orders to ${status}`
      }
    })

  } catch (error) {
    console.error('❌ Batch update orders API error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to batch update orders',
        code: 'BATCH_UPDATE_ERROR'
      }
    }, { status: 500 })
  }
}