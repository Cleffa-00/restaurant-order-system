// lib/api/menu.ts
import { MenuItemWithDetails, Category, MenuOptionGroupWithOptions } from '@/types';

// 错误处理辅助函数
function getErrorMessage(status: number): string {
  switch (status) {
    case 404:
      return 'Menu data not found';
    case 500:
      return 'Server is temporarily unavailable. Please try again in a moment.';
    case 503:
      return 'Service is temporarily down for maintenance';
    case 408:
      return 'Request timed out. Please check your connection.';
    default:
      return `Unable to load menu data (Error ${status})`;
  }
}

// 网络错误检测
function isNetworkError(error: any): boolean {
  return (
    error instanceof TypeError && 
    (error.message.includes('fetch') || error.message.includes('network'))
  );
}

// 客户端数据获取函数 - 改进版
export async function fetchMenuData() {
  try {
    const response = await fetch('/api/v1/menu', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 添加缓存控制
      next: { revalidate: 300 }, // 5分钟缓存
    });

    if (!response.ok) {
      const errorMessage = getErrorMessage(response.status);  
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    if (!result.success) {
      const errorMsg = result.error?.message || 'Failed to fetch menu data';
      throw new Error(errorMsg);
    }

    // 验证返回的数据结构
    if (!result.data) {
      throw new Error('Invalid menu data format received');
    }

    return result.data;
  } catch (error) {
    
    // 提供更友好的错误消息
    if (isNetworkError(error)) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    
    // 重新抛出其他错误
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
      const errorMessage = getErrorMessage(response.status);  
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    if (!result.success) {
      const errorMsg = result.error?.message || 'Failed to fetch menu items';
      throw new Error(errorMsg);
    }

    return result.data;
  } catch (error) {
    
    if (isNetworkError(error)) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    
    throw error;
  }
}

// 服务端数据获取函数 (用于 SSR/SSG) - 改进版
export async function getMenuDataServer(): Promise<{
  categories: Category[];
  menuItems: MenuItemWithDetails[];
}> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    const [categoriesRes, menuItemsRes] = await Promise.all([
      fetch(`${baseUrl}/api/v1/menu`, { 
        headers: { 'Content-Type': 'application/json' },
        // 服务端缓存
        next: { revalidate: 600 } // 10分钟
      }),
      fetch(`${baseUrl}/api/menu-items?available=true`, { 
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 600 }
      }),
    ]);

    // 检查响应状态
    // if (!categoriesRes.ok) {
    //   console.error(`Categories API error: ${categoriesRes.status}`);
    // }
    // if (!menuItemsRes.ok) {
    //   console.error(`Menu Items API error: ${menuItemsRes.status}`);
    // }

    // 如果任一请求失败，返回空数据而不是抛出错误
    if (!categoriesRes.ok || !menuItemsRes.ok) {
      return {
        categories: [],
        menuItems: [],
      };
    }

    const [categoriesData, menuItemsData] = await Promise.all([
      categoriesRes.json(),
      menuItemsRes.json(),
    ]);

    // 检查 API 响应格式
    if (!categoriesData.success || !menuItemsData.success) {
      return {
        categories: [],
        menuItems: [],
      };
    }

    return {
      categories: categoriesData.data || [],
      menuItems: menuItemsData.data || [],
    };
  } catch (error) {
    // 返回空数据而不是抛出错误，避免整个页面崩溃
    return {
      categories: [],
      menuItems: [],
    };
  }
}

// 新增：带重试机制的数据获取函数
export async function fetchMenuDataWithRetry(maxRetries: number = 3): Promise<any> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchMenuData();
    } catch (error) {
      lastError = error as Error;
      
      // 如果是最后一次尝试，或者是非网络错误，直接抛出
      if (attempt === maxRetries || !isNetworkError(error)) {
        throw error;
      }
      
      // 等待一段时间再重试（指数退避）
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// 数据转换工具函数 - 添加错误处理
export function transformMenuData(categories: any[]) {
  try {
    if (!Array.isArray(categories)) {
      return { categories: [], menuItems: [] };
    }

    return {
      categories: categories,
      // 扁平化所有菜单项，添加 category 信息
      menuItems: categories.flatMap(category => {
        if (!category.menuItems || !Array.isArray(category.menuItems)) {
          return [];
        }
        
        return category.menuItems.map((item: any) => ({
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
        }));
      }),
    };
  } catch (error) {
    return { categories: [], menuItems: [] };
  }
}
