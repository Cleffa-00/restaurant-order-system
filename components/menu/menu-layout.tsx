"use client"

import { useState, useEffect, useRef } from "react"
import { MenuSidebar } from "./menu-sidebar"
import { MenuCategoryTabs } from "./menu-category-tabs"
import { MenuGrid } from "./menu-grid"
import { MenuHeader } from "./menu-header"
import { MenuItemModal } from "./menu-item-modal"
import { fetchMenuData, fetchMenuDataWithRetry, transformMenuData } from "@/lib/api/menu"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { Category, MenuItemWithDetails } from "@/types"
import { MenuHeaderRef } from "./menu-header"
import { AlertCircle, RefreshCw, RotateCcw, Loader2 } from "lucide-react"

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

// 改进的错误组件
function MenuError({ 
  error, 
  onRetry, 
  onRetryWithBackoff, 
  isLoading 
}: { 
  error: string
  onRetry: () => void
  onRetryWithBackoff?: () => void
  isLoading: boolean
}) {
  const isServerError = error.includes('Server is temporarily unavailable') || error.includes('500')
  const isNetworkError = error.includes('connect') || error.includes('network') || error.includes('internet')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to Load Menu
        </h2>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          {error}
        </p>
        <div className="space-y-3">
          <button
            onClick={onRetry}
            disabled={isLoading}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </>
            )}
          </button>
          
          {(isServerError || isNetworkError) && onRetryWithBackoff && (
            <button
              onClick={onRetryWithBackoff}
              disabled={isLoading}
              className="w-full border border-gray-300 hover:border-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed text-gray-700 disabled:text-gray-400 px-6 py-3 rounded-lg transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry with Backoff
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="w-full text-sm text-gray-500 hover:text-gray-700 px-6 py-2 transition-colors"
          >
            Refresh Page
          </button>
        </div>
        
        {/* 错误类型提示 */}
        {isNetworkError && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-left">
            <p className="text-xs text-orange-800">
              <strong>Network Issue:</strong> Please check your internet connection and try again.
            </p>
          </div>
        )}
        
        {isServerError && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <p className="text-xs text-blue-800">
              <strong>Server Issue:</strong> Our servers are experiencing temporary difficulties. Please try again in a moment.
            </p>
          </div>
        )}

        {/* 调试信息 (仅开发环境) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
              Debug Info
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded text-left overflow-auto max-h-32">
              {JSON.stringify({ 
                error: error, 
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent.slice(0, 100) + '...'
              }, null, 2)}
            </pre>
          </details>
        )}
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
  
  const headerRef = useRef<MenuHeaderRef>(null)

  // 改进的加载菜单数据函数
  const loadMenuData = async (useRetry: boolean = false) => {
    try {
      setIsLoading(true)
      setError(null)
      
      let rawData;
      if (useRetry) {
        rawData = await fetchMenuDataWithRetry(3)
      } else {
        rawData = await fetchMenuData()
      }
      
      const { categories: loadedCategories, menuItems: loadedMenuItems } = transformMenuData(rawData)
      
      setCategories(loadedCategories || [])
      setMenuItems(loadedMenuItems || [])
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while loading the menu'
      setError(errorMessage)
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

  // 普通重试
  const handleRetry = () => {
    loadMenuData(false)
  }

  // 带退避机制的重试
  const handleRetryWithBackoff = () => {
    loadMenuData(true)
  }

  // 如果加载中，显示加载状态
  if (isLoading) {
    return <MenuLoading />
  }

  // 如果出错，显示错误状态
  if (error) {
    return (
      <MenuError 
        error={error} 
        onRetry={handleRetry}
        onRetryWithBackoff={handleRetryWithBackoff}
        isLoading={isLoading}
      />
    )
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
            disabled={isLoading}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors inline-flex items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Menu
              </>
            )}
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