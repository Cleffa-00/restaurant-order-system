// app/api/v1/admin/categories/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { verifyAccessToken } from '@/lib/api/services/auth'
import { ApiResponseBuilder, ApiErrorCode } from '@/types/api'
import { Role } from '@/types'

// GET /api/v1/admin/categories - 获取所有分类
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('accessToken')?.value

    if (!token) {
      return Response.json(
        ApiResponseBuilder.error('Unauthorized', ApiErrorCode.UNAUTHORIZED, 401),
        { status: 401 }
      )
    }

    const payload = await verifyAccessToken(token)
    if (!payload || payload.role !== Role.ADMIN) {
      return Response.json(
        ApiResponseBuilder.error('Admin access required', ApiErrorCode.FORBIDDEN, 403),
        { status: 403 }
      )
    }

    // 获取分类及其菜单项
    const categories = await prisma.category.findMany({
      include: {
        menuItems: {
          where: { deleted: false },
          include: {
            optionGroups: {
              where: { deleted: false },
              include: {
                options: {
                  where: { deleted: false }
                }
              }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    })

    return Response.json(ApiResponseBuilder.success(categories))
  } catch (error) {
    return Response.json(
      ApiResponseBuilder.error('Internal server error', ApiErrorCode.INTERNAL_SERVER_ERROR, 500),
      { status: 500 }
    )
  }
}

// POST /api/v1/admin/categories - 创建新分类
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('accessToken')?.value

    if (!token) {
      return Response.json(
        ApiResponseBuilder.error('Unauthorized', ApiErrorCode.UNAUTHORIZED, 401),
        { status: 401 }
      )
    }

    const payload = await verifyAccessToken(token)
    if (!payload || payload.role !== Role.ADMIN) {
      return Response.json(
        ApiResponseBuilder.error('Admin access required', ApiErrorCode.FORBIDDEN, 403),
        { status: 403 }
      )
    }

    const { name, visible = true } = await request.json()

    if (!name?.trim()) {
      return Response.json(
        ApiResponseBuilder.error('Category name is required', ApiErrorCode.VALIDATION_ERROR, 400),
        { status: 400 }
      )
    }

    // 生成 slug
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    // 检查重复
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name: name.trim() },
          { slug }
        ]
      }
    })

    if (existingCategory) {
      return Response.json(
        ApiResponseBuilder.error('Category name or slug already exists', ApiErrorCode.ALREADY_EXISTS, 409),
        { status: 409 }
      )
    }

    // 获取最大排序值
    const maxOrder = await prisma.category.aggregate({
      _max: { order: true }
    })

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        order: (maxOrder._max.order || 0) + 1,
        visible
      },
      include: {
        menuItems: {
          where: { deleted: false },
          include: {
            optionGroups: {
              where: { deleted: false },
              include: {
                options: {
                  where: { deleted: false }
                }
              }
            }
          }
        }
      }
    })

    return Response.json(ApiResponseBuilder.success(newCategory))
  } catch (error) {
    return Response.json(
      ApiResponseBuilder.error('Internal server error', ApiErrorCode.INTERNAL_SERVER_ERROR, 500),
      { status: 500 }
    )
  }
}