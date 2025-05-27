import type { Metadata } from "next"
import { MenuLayout } from "@/components/menu/menu-layout"
import { getMenuDataServer } from "@/lib/menu-api"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Menu | Restaurant Ordering System",
  description: "Browse our delicious menu items",
}

// 可选：预加载数据的 SSR 版本
export default async function MenuPage() {
  // 选项 1: 完全客户端渲染（当前方案）
  return (
    <Suspense fallback={<MenuPageLoading />}>
      <MenuLayout />
    </Suspense>
  )

  // 选项 2: 服务端预加载数据（可选，需要修改 MenuLayout 接受 props）
  /*
  try {
    const { categories, menuItems } = await getMenuDataServer()
    
    return (
      <Suspense fallback={<MenuPageLoading />}>
        <MenuLayout 
          initialCategories={categories}
          initialMenuItems={menuItems}
        />
      </Suspense>
    )
  } catch (error) {
    console.error('Failed to load menu data on server:', error)
    // 降级到客户端渲染
    return (
      <Suspense fallback={<MenuPageLoading />}>
        <MenuLayout />
      </Suspense>
    )
  }
  */
}

// Loading 组件
function MenuPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      
      <div className="block md:hidden">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex">
        <div className="hidden md:block w-64 h-[calc(100vh-4rem)] border-r border-gray-200">
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex bg-white rounded-xl p-0 overflow-hidden">
                <div className="w-36 h-36 bg-gray-200 animate-pulse"></div>
                <div className="flex-1 p-4 space-y-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}