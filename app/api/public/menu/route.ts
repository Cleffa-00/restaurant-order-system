// app/api/public/menu/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponseBuilder, ApiErrorCode } from '@/types/api'

// GET /api/public/menu - 获取公开菜单（客户端使用）
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: { visible: true },
      include: {
        menuItems: {
          where: {
            deleted: false,
            available: true  // 只返回可用的菜单项
          },
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

    // 转换为前端需要的格式
    const menuData = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      visible: category.visible,
      order: category.order,
      menuItems: category.menuItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        available: item.available,
        categoryId: item.categoryId,
        optionGroups: item.optionGroups.map(group => ({
          id: group.id,
          name: group.name,
          required: group.required,
          options: group.options.map(option => ({
            id: option.id,
            optionName: option.optionName,
            priceDelta: option.priceDelta,
          }))
        }))
      }))
    }))

    return Response.json(ApiResponseBuilder.success(menuData))
  } catch (error) {
    return Response.json(
      ApiResponseBuilder.error('Internal server error', ApiErrorCode.INTERNAL_SERVER_ERROR, 500),
      { status: 500 }
    )
  }
}