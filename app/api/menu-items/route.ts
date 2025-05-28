
// app/api/menu-items/route.ts  
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const available = searchParams.get('available');

    const menuItems = await prisma.menuItem.findMany({
      where: {
        deleted: false,
        ...(available !== null && { available: available === 'true' }),
        ...(categoryId && categoryId !== 'all' && { categoryId }),
      },
      include: {
        category: true,
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
            required: 'desc',
          },
        },
      },
      orderBy: [
        { category: { order: 'asc' } },
        { name: 'asc' },
      ],
    });

    // 转换数据类型
    const processedItems = menuItems.map(item => ({
      ...item,
      price: Number(item.price),
      categoryId: item.categoryId || undefined,
      optionGroups: item.optionGroups.map(group => ({
        ...group,
        options: group.options.map(option => ({
          ...option,
          optionName: option.optionName, // 确保字段名一致
          priceDelta: Number(option.priceDelta),
        })),
      })),
    }));

    return NextResponse.json({
      success: true,
      data: processedItems
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch menu items',
          code: 'INTERNAL_SERVER_ERROR',
        }
      },
      { status: 500 }
    );
  }
}