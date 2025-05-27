// lib/menu-api.ts
import { MenuItemWithDetails, Category, MenuOptionGroupWithOptions } from '@/types';

// 客户端数据获取函数
export async function fetchMenuData() {
  try {
    const response = await fetch('/api/menu', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 添加缓存控制
      next: { revalidate: 300 }, // 5分钟缓存
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch menu data');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching menu data:', error);
    throw error;
  }
}

export async function fetchMenuItems(categoryId?: string) {
  try {
    const params = new URLSearchParams();
    if (categoryId && categoryId !== 'all') {
      params.append('categoryId', categoryId);
    }
    params.append('available', 'true');

    const response = await fetch(`/api/menu-items?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch menu items');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
}

// 服务端数据获取函数 (用于 SSR/SSG)
export async function getMenuDataServer(): Promise<{
  categories: Category[];
  menuItems: MenuItemWithDetails[];
}> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    const [categoriesRes, menuItemsRes] = await Promise.all([
      fetch(`${baseUrl}/api/menu`, { 
        headers: { 'Content-Type': 'application/json' },
        // 服务端缓存
        next: { revalidate: 600 } // 10分钟
      }),
      fetch(`${baseUrl}/api/menu-items?available=true`, { 
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 600 }
      }),
    ]);

    if (!categoriesRes.ok || !menuItemsRes.ok) {
      throw new Error('Failed to fetch menu data from server');
    }

    const [categoriesData, menuItemsData] = await Promise.all([
      categoriesRes.json(),
      menuItemsRes.json(),
    ]);

    if (!categoriesData.success || !menuItemsData.success) {
      throw new Error('API returned error response');
    }

    return {
      categories: categoriesData.data,
      menuItems: menuItemsData.data,
    };
  } catch (error) {
    console.error('Error in getMenuDataServer:', error);
    // 返回空数据而不是抛出错误，避免整个页面崩溃
    return {
      categories: [],
      menuItems: [],
    };
  }
}

// 数据转换工具函数
export function transformMenuData(categories: any[]) {
  return {
    categories: categories,
    // 扁平化所有菜单项，添加 category 信息
    menuItems: categories.flatMap(category => 
      category.menuItems.map((item: any) => ({
        ...item,
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
        },
        // 确保选项数据结构正确
        optionGroups: item.optionGroups?.map((group: any) => ({
          ...group,
          options: group.options?.map((option: any) => ({
            ...option,
            // 统一字段名
            name: option.optionName,
          })) || [],
        })) || [],
      }))
    ),
  };
}