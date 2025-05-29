// app/api/v1/admin/categories/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import { verifyAccessToken } from '@/lib/api/services/auth'
import { ApiResponseBuilder, ApiErrorCode } from '@/types/api'
import { Role } from '@/types'

// GET /api/v1/admin/categories/[id] - 获取单个分类
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

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

    const category = await prisma.category.findUnique({
      where: { id },
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

    if (!category) {
      return Response.json(
        ApiResponseBuilder.error('Category not found', ApiErrorCode.NOT_FOUND, 404),
        { status: 404 }
      )
    }

    return Response.json(ApiResponseBuilder.success(category))
  } catch (error) {
    return Response.json(
      ApiResponseBuilder.error('Internal server error', ApiErrorCode.INTERNAL_SERVER_ERROR, 500),
      { status: 500 }
    )
  }
}

// PUT /api/v1/admin/categories/[id] - 更新分类
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

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

    const updateData = await request.json()
    const { name, visible, order } = updateData

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return Response.json(
        ApiResponseBuilder.error('Category not found', ApiErrorCode.NOT_FOUND, 404),
        { status: 404 }
      )
    }

    // 构建更新数据
    const updateFields: any = {}

    if (name !== undefined && name?.trim()) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      // 检查名称重复（排除当前分类）
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                { name: name.trim() },
                { slug }
              ]
            }
          ]
        }
      })

      if (duplicateCategory) {
        return Response.json(
          ApiResponseBuilder.error('Category name or slug already exists', ApiErrorCode.ALREADY_EXISTS, 409),
          { status: 409 }
        )
      }

      updateFields.name = name.trim()
      updateFields.slug = slug
    }

    if (visible !== undefined) {
      updateFields.visible = visible
    }

    if (order !== undefined) {
      updateFields.order = order
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateFields,
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

    return Response.json(ApiResponseBuilder.success(updatedCategory))
  } catch (error) {
    return Response.json(
      ApiResponseBuilder.error('Internal server error', ApiErrorCode.INTERNAL_SERVER_ERROR, 500),
      { status: 500 }
    )
  }
}

// DELETE /api/v1/admin/categories/[id] - 删除分类
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

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

    // 检查分类是否存在
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { deleted: false }
        }
      }
    })

    if (!category) {
      return Response.json(
        ApiResponseBuilder.error('Category not found', ApiErrorCode.NOT_FOUND, 404),
        { status: 404 }
      )
    }

    // 检查是否有菜单项
    if (category.menuItems.length > 0) {
      return Response.json(
        ApiResponseBuilder.error('Cannot delete category with menu items', ApiErrorCode.CONFLICT, 409),
        { status: 409 }
      )
    }

    await prisma.category.delete({
      where: { id }
    })

    return Response.json(ApiResponseBuilder.success({ message: 'Category deleted successfully' }))
  } catch (error) {
    return Response.json(
      ApiResponseBuilder.error('Internal server error', ApiErrorCode.INTERNAL_SERVER_ERROR, 500),
      { status: 500 }
    )
  }
}