"use client"

import { useState, useEffect, useRef } from "react"
import { MenuSidebar } from "./menu-sidebar"
import { MenuCategoryTabs } from "./menu-category-tabs"
import { MenuGrid } from "./menu-grid"
import { MenuHeader } from "./menu-header"
import { MenuItemModal } from "./menu-item-modal"
import { fetchMenuData, transformMenuData } from "@/lib/menu-api"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { Category, MenuItemWithDetails } from "@/types"

// Loading 组件
function MenuLoading() {
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

// Error 组件
function MenuError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Menu</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

export function MenuLayout() {
  const router = useRouter()
  const { addItem } = useCart()
  
  // 数据状态
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItemWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI 状态
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItemWithDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const headerRef = useRef<any>(null)

  // 加载菜单数据
  const loadMenuData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const rawData = await fetchMenuData()
      const { categories: loadedCategories, menuItems: loadedMenuItems } = transformMenuData(rawData)
      
      setCategories(loadedCategories)
      setMenuItems(loadedMenuItems)
    } catch (err) {
      console.error('Error loading menu data:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadMenuData()
  }, [])

  // 检测屏幕尺寸
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // 处理购物车点击
  const handleCartClick = () => {
    router.push("/cart")
  }

  // 处理分类选择
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  // 过滤菜单项
  const filteredItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter((item) => item.categoryId === selectedCategory)

  // 处理菜单项点击
  const handleMenuItemClick = (item: MenuItemWithDetails) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  // 处理购物车动画
  const handleCartAnimation = (element: HTMLElement, isDecrease = false) => {
    if (headerRef.current?.triggerAnimation) {
      headerRef.current.triggerAnimation(isDecrease)
    }
  }

  // 重试加载
  const handleRetry = () => {
    loadMenuData()
  }

  // 如果加载中，显示加载状态
  if (isLoading) {
    return <MenuLoading />
  }

  // 如果出错，显示错误状态
  if (error) {
    return <MenuError error={error} onRetry={handleRetry} />
  }

  // 如果没有数据，显示空状态
  if (categories.length === 0 && menuItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-gray-400 text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Menu Available</h2>
          <p className="text-gray-600 mb-6">The menu is currently being updated. Please check back later.</p>
          <button
            onClick={handleRetry}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Refresh Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MenuHeader
        ref={headerRef}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onCartClick={handleCartClick}
        showMenuButton={!isMobile}
      />

      {/* Mobile: Horizontal Category Tabs */}
      <div className="block md:hidden">
        <MenuCategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      <div className="flex relative">
        {/* Desktop: Sidebar with overlay for mobile (when needed) */}
        <div className="hidden md:block">
          <>
            {/* Mobile overlay */}
            {isSidebarOpen && (
              <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <div
              className={cn(
                "fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-50",
                "md:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full",
              )}
            >
              <MenuSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
              />
            </div>
          </>
        </div>

        {/* Main content */}
        <main className={cn("flex-1 w-full", !isMobile && "md:ml-0")}>
          <div className="container mx-auto max-w-screen-xl px-4 py-6 md:px-6 lg:px-8">
            <MenuGrid
              items={filteredItems}
              selectedCategory={selectedCategory}
              onItemClick={handleMenuItemClick}
              onCartAnimation={handleCartAnimation}
            />
          </div>
        </main>
      </div>

      {/* Menu Item Modal */}
      <MenuItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCartAnimation={handleCartAnimation}
      />
    </div>
  )
}