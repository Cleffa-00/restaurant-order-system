// app/api/v1/menu/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const available = searchParams.get('available');

    // 获取所有分类及其菜单项
    const categories = await prisma.category.findMany({
      where: {
        visible: true,
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        menuItems: {
          where: {
            deleted: false,
            ...(available !== null && { available: available === 'true' }),
            ...(categoryId && { categoryId }),
          },
          include: {
            optionGroups: {
              where: {
                deleted: false,
              },
              include: {
                options: {
                  where: {
                    deleted: false,
                  },
                  orderBy: {
                    priceDelta: 'asc',
                  },
                },
              },
              orderBy: {
                required: 'desc', // 必选项放前面
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    // 转换 Decimal 类型为 number
    const processedCategories = categories.map(category => ({
      ...category,
      menuItems: category.menuItems.map(item => ({
        ...item,
        price: Number(item.price), // Decimal -> number
        optionGroups: item.optionGroups.map(group => ({
          ...group,
          options: group.options.map(option => ({
            ...option,
            priceDelta: Number(option.priceDelta), // Decimal -> number
          })),
        })),
      })),
    }));

    return NextResponse.json({
      success: true,
      data: processedCategories
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch menu data',
          code: 'INTERNAL_SERVER_ERROR',
        }
      },
      { status: 500 }
    );
  }
}
