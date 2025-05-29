// app/api/v1/admin/orders/[id]/route.ts - 单个订单详情和更新

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取单个订单详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            options: true,
            menuItem: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                category: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Order not found',
          code: 'ORDER_NOT_FOUND'
        }
      }, { status: 404 })
    }

    // 转换数据格式
    const formattedOrder = {
      ...order,
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      serviceFee: Number(order.serviceFee),
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      items: order.items.map(item => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        finalPrice: Number(item.finalPrice),
        options: item.options.map(option => ({
          ...option,
          priceDelta: Number(option.priceDelta)
        }))
      }))
    }

    return NextResponse.json({
      success: true,
      data: formattedOrder
    })

  } catch (error) {
    console.error('❌ Get order detail API error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to fetch order',
        code: 'FETCH_ORDER_ERROR'
      }
    }, { status: 500 })
  }
}

// 更新订单 (通用更新)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

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

    // 更新订单
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...body,
        // 如果更新了价格相关字段，确保转换为 Decimal
        ...(body.subtotal && { subtotal: body.subtotal }),
        ...(body.taxAmount && { taxAmount: body.taxAmount }),
        ...(body.serviceFee && { serviceFee: body.serviceFee }),
        ...(body.total && { total: body.total }),
      },
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

    return NextResponse.json({
      success: true,
      data: formattedOrder
    })

  } catch (error) {
    // console.error('❌ Update order API error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to update order',
        code: 'UPDATE_ORDER_ERROR'
      }
    }, { status: 500 })
  }
}

// 删除订单
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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

    // 删除订单（硬删除，包括相关的 items 和 options）
    await prisma.order.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      data: {
        message: 'Order deleted successfully'
      }
    })

  } catch (error) {
    // console.error('❌ Delete order API error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to delete order',
        code: 'DELETE_ORDER_ERROR'
      }
    }, { status: 500 })
  }
}