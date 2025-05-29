// app/api/v1/admin/orders/route.ts - 订单列表 API

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 获取查询参数
    const date = searchParams.get('date') // YYYY-MM-DD 格式
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // 构建 where 条件
    const where: any = {}
    
    // 日期筛选 - 使用与前端一致的美东时区处理
    if (date) {
      // 🔥 与前端 date-utils.ts 保持一致的时区处理
      // 用户选择的日期字符串 (YYYY-MM-DD) 代表美东时间的某一天
      
      // 创建美东时间的开始和结束时间
      // 注意：JavaScript 的 Date 构造函数会将 "YYYY-MM-DD" 解释为 UTC 时间
      // 所以我们需要明确指定时区
      
      const startOfDayEastern = new Date(date + 'T00:00:00')
      const endOfDayEastern = new Date(date + 'T23:59:59.999')
      
      // 转换为美东时区的实际 UTC 时间
      // 使用与前端相同的时区转换逻辑
      const easternTZ = 'America/New_York'
      
      // 方法1：使用 toLocaleString 进行时区转换（与前端一致）
      const startEasternStr = startOfDayEastern.toLocaleString('en-US', { timeZone: easternTZ })
      const endEasternStr = endOfDayEastern.toLocaleString('en-US', { timeZone: easternTZ })
      
      // 方法2：更直接的方式 - 手动计算偏移量
      const now = new Date()
      const easternOffset = new Date().toLocaleString('en-US', { timeZone: easternTZ })
      
      // 方法3：最简单准确的方式
      // 直接构造美东时间的 ISO 字符串，然后让 Date 处理时区
      const startDate = new Date(date + 'T00:00:00-05:00') // EST
      const endDate = new Date(date + 'T23:59:59.999-05:00') // EST
      
      // 检查是否为夏令时期间（3-11月）
      const month = parseInt(date.split('-')[1])
      const isDST = month >= 3 && month <= 10 // 大致的夏令时期间
      
      const finalStartDate = isDST 
        ? new Date(date + 'T00:00:00-04:00') // EDT
        : new Date(date + 'T00:00:00-05:00') // EST
        
      const finalEndDate = isDST 
        ? new Date(date + 'T23:59:59.999-04:00') // EDT  
        : new Date(date + 'T23:59:59.999-05:00') // EST
      
      where.createdAt = {
        gte: finalStartDate,
        lte: finalEndDate
      }
      
      console.log(`🕐 Querying orders for Eastern date ${date}:`, {
        selectedDate: date,
        timezone: isDST ? 'EDT (UTC-4)' : 'EST (UTC-5)',
        utcRange: `${finalStartDate.toISOString()} - ${finalEndDate.toISOString()}`,
        easternRange: `${date} 00:00:00 - ${date} 23:59:59 Eastern`
      })
    }
    
    // 状态筛选
    if (status) {
      where.status = status
    }
    
    if (paymentStatus) {
      where.paymentStatus = paymentStatus
    }

    // 计算分页
    const skip = (page - 1) * limit

    // 获取订单总数
    const total = await prisma.order.count({ where })

    // 获取订单列表（包含关联数据）
    const orders = await prisma.order.findMany({
      where,
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
        createdAt: 'desc' // 最新的订单在前
      },
      skip,
      take: limit
    })

    // 转换数据格式以匹配前端期望的类型
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

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        orders: formattedOrders,
        total,
        page,
        limit,
        totalPages
      }
    })

  } catch (error) {
    console.error('❌ Get orders API error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to fetch orders',
        code: 'FETCH_ORDERS_ERROR'
      }
    }, { status: 500 })
  }
}

// 创建新订单 (如果需要的话)
export async function POST(request: NextRequest) {
  try {
    // TODO: 实现创建订单逻辑
    return NextResponse.json({
      success: false,
      error: {
        message: 'Create order not implemented yet',
        code: 'NOT_IMPLEMENTED'
      }
    }, { status: 501 })
    
  } catch (error) {
    console.error('❌ Create order API error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to create order',
        code: 'CREATE_ORDER_ERROR'
      }
    }, { status: 500 })
  }
}