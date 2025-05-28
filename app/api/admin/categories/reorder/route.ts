// app/api/admin/categories/reorder/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { ApiResponseBuilder, ApiErrorCode } from '@/types/api'
import { Role } from '@/types'

// POST /api/admin/categories/reorder - 重新排序分类
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

    const { categoryIds } = await request.json()

    if (!Array.isArray(categoryIds)) {
      return Response.json(
        ApiResponseBuilder.error('Category IDs must be an array', ApiErrorCode.VALIDATION_ERROR, 400),
        { status: 400 }
      )
    }

    // 批量更新排序
    const updatePromises = categoryIds.map((categoryId: string, index: number) =>
      prisma.category.update({
        where: { id: categoryId },
        data: { order: index + 1 }
      })
    )

    await Promise.all(updatePromises)

    return Response.json(ApiResponseBuilder.success({ message: 'Categories reordered successfully' }))
  } catch (error) {
    return Response.json(
      ApiResponseBuilder.error('Internal server error', ApiErrorCode.INTERNAL_SERVER_ERROR, 500),
      { status: 500 }
    )
  }
}