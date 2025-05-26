"use client"

import { useState, useEffect, useRef } from "react"
import { MenuSidebar } from "./menu-sidebar"
import { MenuCategoryTabs } from "./menu-category-tabs"
import { MenuGrid } from "./menu-grid"
import { MenuHeader } from "./menu-header"
import { MenuItemModal } from "./menu-item-modal"
// TODO: replace mockCategories with API data from /api/menu
// Note: API data structure differences:
// - Category.menuItems will be relation (may need include or separate query)
// - MenuItem.price will be Decimal (convert to number)
// - API has additional fields: createdAt, updatedAt, deleted
import { mockCategories, menuItems } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"

interface Option {
  id: string
  name: string
  priceDelta: number
}

interface OptionGroup {
  id: string
  name: string
  required: boolean
  options: Option[]
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  available: boolean
  optionGroups: OptionGroup[]
}

export function MenuLayout() {
  const router = useRouter()
  const { addItem } = useCart()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const headerRef = useRef<any>(null)

  // Detect screen size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)

    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // Handle cart click - navigate to cart page
  const handleCartClick = () => {
    router.push("/cart")
  }

  // Close sidebar when category is selected on mobile
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  // Filter menu items based on selected category
  const filteredItems =
    selectedCategory === "all" ? menuItems : menuItems.filter((item) => item.categoryId === selectedCategory)

  // Handle menu item click
  const handleMenuItemClick = (item: MenuItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  // Handle cart animation from menu cards or modal
  const handleCartAnimation = (element: HTMLElement, isDecrease = false) => {
    // Trigger cart icon animation
    if (headerRef.current?.triggerAnimation) {
      headerRef.current.triggerAnimation(isDecrease)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MenuHeader
        ref={headerRef}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onCartClick={handleCartClick}
        showMenuButton={!isMobile} // Hide menu button on mobile since we use tabs
      />

      {/* Mobile: Horizontal Category Tabs */}
      <div className="block md:hidden">
        <MenuCategoryTabs
          // TODO: replace mockCategories with API data from /api/menu
          // Remember to handle data structure differences (see import comment)
          categories={mockCategories}
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
                // TODO: replace mockCategories with API data from /api/menu
                // Remember to handle data structure differences (see import comment)
                categories={mockCategories}
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
              selectedCategory={selectedCategory} // 👈 新增这一行
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
