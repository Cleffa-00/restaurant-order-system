// app/api/admin/menu-items/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { ApiResponseBuilder, ApiErrorCode } from '@/types/api'
import { Role } from '@/types'

// GET /api/admin/menu-items/[id] - 获取单个菜单项
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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

    const menuItem = await prisma.menuItem.findFirst({
      where: {
        id,
        deleted: false
      },
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

    if (!menuItem) {
      return Response.json(
        ApiResponseBuilder.error('Menu item not found', ApiErrorCode.NOT_FOUND, 404),
        { status: 404 }
      )
    }

    return Response.json(ApiResponseBuilder.success(menuItem))
  } catch (error) {

    return Response.json(
      ApiResponseBuilder.error('Internal server error', ApiErrorCode.INTERNAL_SERVER_ERROR, 500),
      { status: 500 }
    )
  }
}

// PUT /api/admin/menu-items/[id] - 更新菜单项（包括选项组）
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

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
    
    const { name, description, price, imageUrl, available, categoryId, optionGroups } = updateData

    // 检查菜单项是否存在
    const existingMenuItem = await prisma.menuItem.findFirst({
      where: {
        id,
        deleted: false
      }
    })

    if (!existingMenuItem) {
      return Response.json(
        ApiResponseBuilder.error('Menu item not found', ApiErrorCode.NOT_FOUND, 404),
        { status: 404 }
      )
    }

    // 🔥 使用事务进行简化的替换策略
    const updatedMenuItem = await prisma.$transaction(async (tx) => {
      // 1. 更新菜单项基本信息
      const updateFields: any = {}

      if (name !== undefined && name?.trim()) {
        updateFields.name = name.trim()
      }

      if (description !== undefined) {
        updateFields.description = description?.trim() || ''
      }

      if (price !== undefined) {
        if (typeof price !== 'number' || price <= 0) {
          throw new Error('Valid price is required')
        }
        updateFields.price = price
      }

      if (imageUrl !== undefined) {
        updateFields.imageUrl = imageUrl?.trim() || null
      }

      if (available !== undefined) {
        updateFields.available = available
      }

      if (categoryId !== undefined) {
        if (categoryId) {
          const category = await tx.category.findUnique({
            where: { id: categoryId }
          })

          if (!category) {
            throw new Error('Category not found')
          }
        }
        updateFields.categoryId = categoryId || null
      }

      updateFields.updatedAt = new Date()

      const updatedItem = await tx.menuItem.update({
        where: { id },
        data: updateFields
      })

      // 2. 🔥 简化的选项组处理：删除所有旧数据，创建新数据
      if (optionGroups !== undefined) {

        // 步骤 1: 软删除所有现有的选项
        // 🔥 修复：使用正确的关联查询
        const existingOptionGroups = await tx.menuOptionGroup.findMany({
          where: {
            menuItemId: id,
            deleted: false
          },
          select: { id: true }
        })

        // 删除所有相关选项
        for (const group of existingOptionGroups) {
          await tx.menuOptions.updateMany({
            where: { 
              groupId: group.id,
              deleted: false 
            },
            data: { deleted: true }
          })
        }

        // 步骤 2: 软删除所有现有的选项组
        await tx.menuOptionGroup.updateMany({
          where: { 
            menuItemId: id,
            deleted: false 
          },
          data: { deleted: true }
        })

        // 步骤 3: 创建新的选项组和选项
        for (const groupData of optionGroups) {

          const newGroup = await tx.menuOptionGroup.create({
            data: {
              menuItemId: id,
              name: groupData.name,
              required: groupData.required || false,
              deleted: false
            }
          })

          // 创建该组的所有选项
          if (groupData.options && Array.isArray(groupData.options)) {
            for (const optionData of groupData.options) {

              await tx.menuOptions.create({
                data: {
                  groupId: newGroup.id,
                  optionName: optionData.name,
                  priceDelta: optionData.priceDelta || 0,
                  deleted: false
                }
              })
            }
          }
        }
      }

      // 返回更新后的完整菜单项数据
      return await tx.menuItem.findUnique({
        where: { id },
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

    return Response.json(ApiResponseBuilder.success(updatedMenuItem))

  } catch (error) {
    return Response.json(
      ApiResponseBuilder.error(
        error instanceof Error ? error.message : 'Internal server error', 
        ApiErrorCode.INTERNAL_SERVER_ERROR, 
        500
      ),
      { status: 500 }
    )
  }
}

// DELETE /api/admin/menu-items/[id] - 删除菜单项（软删除）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

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

    // 检查菜单项是否存在
    const menuItem = await prisma.menuItem.findFirst({
      where: {
        id,
        deleted: false
      }
    })

    if (!menuItem) {
      return Response.json(
        ApiResponseBuilder.error('Menu item not found', ApiErrorCode.NOT_FOUND, 404),
        { status: 404 }
      )
    }

    // 软删除菜单项及其相关选项组和选项
    await prisma.$transaction(async (tx) => {
      // 软删除菜单项
      await tx.menuItem.update({
        where: { id },
        data: { 
          deleted: true,
          updatedAt: new Date()
        }
      })

      // 软删除相关的选项组
      await tx.menuOptionGroup.updateMany({
        where: { menuItemId: id },
        data: { deleted: true }
      })

      // 软删除相关的选项
      const optionGroups = await tx.menuOptionGroup.findMany({
        where: { menuItemId: id },
        select: { id: true }
      })

      for (const group of optionGroups) {
        await tx.menuOptions.updateMany({
          where: { groupId: group.id },
          data: { deleted: true }
        })
      }
    })

    return Response.json(ApiResponseBuilder.success({ message: 'Menu item deleted successfully' }))
  } catch (error) {
    return Response.json(
      ApiResponseBuilder.error('Internal server error', ApiErrorCode.INTERNAL_SERVER_ERROR, 500),
      { status: 500 }
    )
  }
}