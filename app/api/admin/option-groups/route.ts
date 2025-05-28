// app/api/admin/option-groups/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { ApiResponseBuilder, ApiErrorCode } from '@/types/api'
import { Role } from '@/types'

// GET /api/admin/option-groups
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

    const { searchParams } = new URL(request.url)
    const menuItemId = searchParams.get('menuItemId')

    const whereClause: any = {
      deleted: false
    }

    if (menuItemId) {
      whereClause.menuItemId = menuItemId
    }

    const optionGroups = await prisma.menuOptionGroup.findMany({
      where: whereClause,
      include: {
        menuItem: true,
        options: {  // 这对应 schema 中的 options 字段
          where: { deleted: false }
        }
      },
      orderBy: { id: 'asc' }  // 修复：使用 id 而不是 createdAt
    })

    return Response.json(ApiResponseBuilder.success(optionGroups))
  } catch (error) {
    return Response.json(
      ApiResponseBuilder.error('Internal server error', ApiErrorCode.INTERNAL_SERVER_ERROR, 500),
      { status: 500 }
    )
  }
}

// POST /api/admin/option-groups
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

    const { menuItemId, name, required = false, options = [] } = await request.json()

    if (!menuItemId) {
      return Response.json(
        ApiResponseBuilder.error('Menu item ID is required', ApiErrorCode.VALIDATION_ERROR, 400),
        { status: 400 }
      )
    }

    if (!name?.trim()) {
      return Response.json(
        ApiResponseBuilder.error('Option group name is required', ApiErrorCode.VALIDATION_ERROR, 400),
        { status: 400 }
      )
    }

    const menuItem = await prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        deleted: false
      }
    })

    if (!menuItem) {
      return Response.json(
        ApiResponseBuilder.error('Menu item not found', ApiErrorCode.NOT_FOUND, 404),
        { status: 404 }
      )
    }

    const newOptionGroup = await prisma.$transaction(async (tx) => {
      const optionGroup = await tx.menuOptionGroup.create({
        data: {
          menuItemId,
          name: name.trim(),
          required,
          deleted: false
        }
      })

      if (options.length > 0) {
        for (const option of options) {
          if (!option.name?.trim()) continue

          await tx.menuOptions.create({  // 修复：使用 menuOptions
            data: {
              groupId: optionGroup.id,
              optionName: option.name.trim(),
              priceDelta: option.priceDelta || 0,
              deleted: false
            }
          })
        }
      }

      return await tx.menuOptionGroup.findUnique({
        where: { id: optionGroup.id },
        include: {
          menuItem: true,
          options: {
            where: { deleted: false }
          }
        }
      })
    })

    return Response.json(ApiResponseBuilder.success(newOptionGroup))
  } catch (error) {
    return Response.json(
      ApiResponseBuilder.error('Internal server error', ApiErrorCode.INTERNAL_SERVER_ERROR, 500),
      { status: 500 }
    )
  }
}