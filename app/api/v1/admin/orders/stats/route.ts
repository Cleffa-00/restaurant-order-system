// app/api/v1/admin/orders/stats/route.ts - 订单统计信息

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // YYYY-MM-DD 格式，可选

    // 构建 where 条件
    const where: any = {}
    
    // 如果指定了日期，只统计该日期的订单
    if (date) {
      const startDate = new Date(date + 'T00:00:00.000Z')
      const endDate = new Date(date + 'T23:59:59.999Z')
      
      where.createdAt = {
        gte: startDate,
        lte: endDate
      }
    }

    // 并行执行多个统计查询
    const [
      totalOrders,
      totalRevenueResult,
      pendingOrders,
      preparingOrders,
      readyOrders,
      completedOrders,
      cancelledOrders,
      unpaidOrders,
      paidOrders
    ] = await Promise.all([
      // 总订单数
      prisma.order.count({ where }),
      
      // 总收入 (只计算已完成的订单)
      prisma.order.aggregate({
        where: {
          ...where,
          status: 'COMPLETED'
        },
        _sum: {
          total: true
        }
      }),
      
      // 各种状态的订单数量
      prisma.order.count({ where: { ...where, status: 'PENDING' } }),
      prisma.order.count({ where: { ...where, status: 'PREPARING' } }),
      prisma.order.count({ where: { ...where, status: 'READY' } }),
      prisma.order.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.order.count({ where: { ...where, status: 'CANCELLED' } }),
      
      // 支付状态统计
      prisma.order.count({ where: { ...where, paymentStatus: 'UNPAID' } }),
      prisma.order.count({ where: { ...where, paymentStatus: 'PAID' } })
    ])

    const totalRevenue = Number(totalRevenueResult._sum.total || 0)

    const stats = {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      unpaidOrders,
      
      // 额外的详细统计
      ordersByStatus: {
        PENDING: pendingOrders,
        PREPARING: preparingOrders,
        READY: readyOrders,
        COMPLETED: completedOrders,
        CANCELLED: cancelledOrders
      },
      
      ordersByPayment: {
        UNPAID: unpaidOrders,
        PAID: paidOrders
      },
      
      // 计算百分比
      completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
      paymentRate: totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0,
      
      // 平均订单价值
      averageOrderValue: completedOrders > 0 ? Math.round((totalRevenue / completedOrders) * 100) / 100 : 0
    }

    console.log(`✅ Order stats calculated for ${date || 'all time'}:`, stats)

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('❌ Get order stats API error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to fetch order statistics',
        code: 'FETCH_STATS_ERROR'
      }
    }, { status: 500 })
  }
}