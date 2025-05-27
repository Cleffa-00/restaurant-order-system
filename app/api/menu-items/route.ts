import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ApiResponseBuilder } from '@/types/api';

const prisma = new PrismaClient();

// app/api/menu-items/route.ts
export async function GET_MENU_ITEMS(request: NextRequest) {
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
  
      return NextResponse.json(ApiResponseBuilder.success(processedItems));
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return NextResponse.json(
        ApiResponseBuilder.error(
          'Failed to fetch menu items',
          'INTERNAL_SERVER_ERROR',
          500
        ),
        { status: 500 }
      );
    }
  }