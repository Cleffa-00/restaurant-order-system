// app/api/v1/admin/menu-items/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { verifyAccessToken } from '@/lib/api/services/auth'
import { ApiResponseBuilder, ApiErrorCode } from '@/types/api'
import { Role } from '@/types'

// GET /api/v1/admin/menu-items - 获取所有菜单项
export async function GET(request: NextRequest) {
  try {
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

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const whereClause: any = {
      deleted: false
    }

    if (categoryId) {
      whereClause.categoryId = categoryId
    }

    const menuItems = await prisma.menuItem.findMany({
      where: whereClause,
      include: {
        category: true,
        optionGroups: {
          where: { deleted: false },
          include: {
            options: {
              where: { deleted: false }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return Response.json(ApiResponseBuilder.success(menuItems))
  } catch (error) {
    return Response.json(
      ApiResponseBuilder.error('Internal server error', ApiErrorCode.INTERNAL_SERVER_ERROR, 500),
      { status: 500 }
    )
  }
}

// POST /api/v1/admin/menu-items - 创建新菜单项
export async function POST(request: NextRequest) {
  try {
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

    const { name, description, price, imageUrl, available = true, categoryId, optionGroups = [] } = await request.json()

    // 验证必填字段
    if (!name?.trim()) {
      return Response.json(
        ApiResponseBuilder.error('Menu item name is required', ApiErrorCode.VALIDATION_ERROR, 400),
        { status: 400 }
      )
    }

    if (typeof price !== 'number' || price <= 0) {
      return Response.json(
        ApiResponseBuilder.error('Valid price is required', ApiErrorCode.VALIDATION_ERROR, 400),
        { status: 400 }
      )
    }

    // 如果指定了分类，验证分类是否存在
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        return Response.json(
          ApiResponseBuilder.error('Category not found', ApiErrorCode.NOT_FOUND, 404),
          { status: 404 }
        )
      }
    }

    // 使用事务创建菜单项和选项组
    const newMenuItem = await prisma.$transaction(async (tx) => {
      // 创建菜单项
      const menuItem = await tx.menuItem.create({
        data: {
          name: name.trim(),
          description: description?.trim() || '',
          price,
          imageUrl: imageUrl?.trim() || null,
          available,
          categoryId: categoryId || null,
          deleted: false
        }
      })

      // 创建选项组
      if (optionGroups.length > 0) {
        for (const group of optionGroups) {
          if (!group.name?.trim()) continue

          const optionGroup = await tx.menuOptionGroup.create({
            data: {
              menuItemId: menuItem.id,
              name: group.name.trim(),
              required: group.required || false,
              deleted: false
            }
          })

          // 创建选项
          if (group.options && group.options.length > 0) {
            for (const option of group.options) {
              if (!option.name?.trim()) continue

              await tx.menuOptions.create({
                data: {
                  groupId: optionGroup.id,
                  optionName: option.name.trim(),
                  priceDelta: option.priceDelta || 0,
                  deleted: false
                }
              })
            }
          }
        }
      }

      // 返回完整的菜单项数据
      return await tx.menuItem.findUnique({
        where: { id: menuItem.id },
        include: {
          category: true,
          optionGroups: {
            where: { deleted: false },
            include: {
              options: {
                where: { deleted: false }
              }
            }
          }
        }
      })
    })

    return Response.json(ApiResponseBuilder.success(newMenuItem))
  } catch (error) {
    return Response.json(
      ApiResponseBuilder.error('Internal server error', ApiErrorCode.INTERNAL_SERVER_ERROR, 500),
      { status: 500 }
    )
  }
}