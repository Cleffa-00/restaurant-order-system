// app/api/admin/option-groups/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { ApiResponseBuilder, ApiErrorCode } from '@/types/api'
import { Role } from '@/types'

// GET /api/admin/option-groups/[id] - 获取单个选项组
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

    const optionGroup = await prisma.menuOptionGroup.findFirst({
      where: {
        id,
        deleted: false
      },
      include: {
        menuItem: true,
        options: {
          where: { deleted: false }
        }
      }
    })

    if (!optionGroup) {
      return Response.json(
        ApiResponseBuilder.error('Option group not found', ApiErrorCode.NOT_FOUND, 404),
        { status: 404 }
      )
    }

    return Response.json(ApiResponseBuilder.success(optionGroup))
  } catch (error) {
    return Response.json(
      ApiResponseBuilder.error('Internal server error', ApiErrorCode.INTERNAL_SERVER_ERROR, 500),
      { status: 500 }
    )
  }
}

// PUT /api/admin/option-groups/[id] - 更新选项组
export async function PUT(
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

    const updateData = await request.json()
    const { name, required, options } = updateData

    // 检查选项组是否存在
    const existingOptionGroup = await prisma.menuOptionGroup.findFirst({
      where: {
        id,
        deleted: false
      }
    })

    if (!existingOptionGroup) {
      return Response.json(
        ApiResponseBuilder.error('Option group not found', ApiErrorCode.NOT_FOUND, 404),
        { status: 404 }
      )
    }

    // 使用事务更新选项组和选项
    const updatedOptionGroup = await prisma.$transaction(async (tx) => {
      // 更新选项组基本信息
      const updateFields: any = {}

      if (name !== undefined && name?.trim()) {
        updateFields.name = name.trim()
      }

      if (required !== undefined) {
        updateFields.required = required
      }

      const optionGroup = await tx.menuOptionGroup.update({
        where: { id },
        data: updateFields
      })

      // 如果提供了选项数据，更新选项
      if (options && Array.isArray(options)) {
        // 先删除现有选项
        await tx.menuOptions.updateMany({
          where: { groupId: id },
          data: { deleted: true }
        })

        // 创建新选项
        for (const option of options) {
          if (!option.name?.trim()) continue

          await tx.menuOptions.create({
            data: {
              groupId: id,
              optionName: option.name.trim(),
              priceDelta: option.priceDelta || 0,
              deleted: false
            }
          })
        }
      }

      // 返回完整的选项组数据
      return await tx.menuOptionGroup.findUnique({
        where: { id },
        include: {
          menuItem: true,
          options: {
            where: { deleted: false }
          }
        }
      })
    })

    return Response.json(ApiResponseBuilder.success(updatedOptionGroup))
  } catch (error) {
    return Response.json(
      ApiResponseBuilder.error('Internal server error', ApiErrorCode.INTERNAL_SERVER_ERROR, 500),
      { status: 500 }
    )
  }
}

// DELETE /api/admin/option-groups/[id] - 删除选项组（软删除）
export async function DELETE(
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

    // 检查选项组是否存在
    const optionGroup = await prisma.menuOptionGroup.findFirst({
      where: {
        id,
        deleted: false
      }
    })

    if (!optionGroup) {
      return Response.json(
        ApiResponseBuilder.error('Option group not found', ApiErrorCode.NOT_FOUND, 404),
        { status: 404 }
      )
    }

    // 软删除选项组及其选项
    await prisma.$transaction(async (tx) => {
      // 软删除选项组
      await tx.menuOptionGroup.update({
        where: { id },
        data: { deleted: true }
      })

      // 软删除相关选项
      await tx.menuOptions.updateMany({
        where: { groupId: id },
        data: { deleted: true }
      })
    })

    return Response.json(ApiResponseBuilder.success({ message: 'Option group deleted successfully' }))
  } catch (error) {
    return Response.json(
      ApiResponseBuilder.error('Internal server error', ApiErrorCode.INTERNAL_SERVER_ERROR, 500),
      { status: 500 }
    )
  }
}