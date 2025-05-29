// app/api/admin/orders/search/route.ts - 订单搜索

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Search query is required',
          code: 'MISSING_QUERY'
        }
      }, { status: 400 })
    }

    const searchTerm = query.trim()
    
    // 构建搜索条件 - 支持订单号、客户姓名、电话号码
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          {
            orderNumber: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            phone: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          // 如果搜索词是纯数字，也搜索电话号码的精确匹配
          ...(!/[^\d]/.test(searchTerm) ? [{
            phone: {
              equals: searchTerm
            }
          }] : [])
        ]
      },
      include: {
        items: {
          include: {
            options: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // 限制搜索结果数量
    })

    // 转换数据格式
    const formattedOrders = orders.map(order => ({
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
    }))

    console.log(`✅ Search completed for "${searchTerm}", found ${orders.length} orders`)

    return NextResponse.json({
      success: true,
      data: formattedOrders
    })

  } catch (error) {
    console.error('❌ Search orders API error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to search orders',
        code: 'SEARCH_ERROR'
      }
    }, { status: 500 })
  }
}