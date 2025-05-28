"use client"

import { useState, useRef } from "react"
import { MenuHeader } from "@/components/menu/menu-header"
import { MenuCategoryTabs } from "@/components/menu/menu-category-tabs"
import { MenuGrid } from "@/components/menu/menu-grid"
import { MenuItemModal } from "@/components/menu/menu-item-modal"
import type { AdminCategory } from "@/types/admin"

interface MenuPreviewProps {
  categories: AdminCategory[]
}

function transformAdminDataForMenu(adminCategories: AdminCategory[]) {
  return adminCategories
    .filter((category) => category.visible)
    .sort((a, b) => a.order - b.order)
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.name.toLowerCase().replace(/\s+/g, "-"),
      visible: category.visible,
      order: category.order,
      menuItems: category.menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number(item.price), // 确保价格是数字类型
        imageUrl: item.imageUrl,
        available: item.available,
        categoryId: item.categoryId,
        category: null, // 添加缺失的字段
        deleted: item.deleted,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        optionGroups: (item.optionGroups || []).map((group) => ({
          id: group.id,
          menuItemId: item.id, // 添加缺失的字段
          name: group.name,
          required: group.required,
          deleted: group.deleted || false, // 添加缺失的字段
          options: (group.options || [])
            // 移除 available 过滤，因为数据库中没有这个字段
            .map((option) => ({
              id: option.id,
              groupId: group.id, // 添加缺失的字段
              optionName: option.name,
              priceDelta: Number(option.priceDelta), // 确保价格差异是数字类型
              deleted: option.deleted || false, // 添加缺失的字段
            })),
        })),
      })),
    }))
}

export function MenuPreview({ categories }: MenuPreviewProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all")
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const menuCategories = transformAdminDataForMenu(categories)

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId)

    if (categoryId === "all") {
      scrollContainerRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    } else {
      const categoryElement = document.getElementById(`category-${categoryId}`)
      if (categoryElement && scrollContainerRef.current) {
        const containerTop = scrollContainerRef.current.offsetTop
        const elementTop = categoryElement.offsetTop
        const scrollPosition = elementTop - containerTop - 20

        scrollContainerRef.current.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        })
      }
    }
  }

  const handleMenuItemClick = (item: any) => {
    if (item.available) {
      setSelectedMenuItem(item)
    }
  }

  const handleCloseModal = () => {
    setSelectedMenuItem(null)
  }

  const getDisplayItems = () => {
    if (selectedCategoryId === "all") {
      return menuCategories
    } else {
      return menuCategories.filter((cat) => cat.id === selectedCategoryId)
    }
  }

  const displayCategories = getDisplayItems()

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">👁️</span>
            <span className="text-blue-700 text-sm font-medium">Menu Preview - Customer View</span>
            <span className="text-blue-500 text-xs">
              ({menuCategories.length} visible categories, includes sold out items)
            </span>
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-7rem)] overflow-hidden">
        {menuCategories.length > 0 ? (
          <div className="h-full flex flex-col">
            <MenuHeader onMenuClick={() => {}} />

            <div className="border-b border-gray-200 sticky top-0 z-20 bg-white">
              <MenuCategoryTabs
                categories={menuCategories}
                selectedCategory={selectedCategoryId}
                onSelectCategory={handleCategorySelect}
              />
            </div>

            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-8">
                {displayCategories.map((category) => (
                  <div key={category.id} id={`category-${category.id}`} className="scroll-mt-4">
                    {selectedCategoryId === "all" && menuCategories.length > 1 && (
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h2>
                        <div className="h-px bg-gray-200"></div>
                      </div>
                    )}

                    <MenuGrid 
                      items={category.menuItems} 
                      selectedCategory={selectedCategoryId}
                      onItemClick={handleMenuItemClick} 
                    />

                    {category.menuItems.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No items in {category.name}</p>
                      </div>
                    )}
                  </div>
                ))}

                {displayCategories.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg font-medium">No items to display</p>
                    <p className="text-sm">Add some menu items to see them here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium">No visible categories</p>
              <p className="text-sm">Make some categories visible to see the menu preview</p>
            </div>
          </div>
        )}
      </div>

      {selectedMenuItem && selectedMenuItem.available && (
        <div className="relative">
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            🔍 Preview Mode - Testing Customer Experience
          </div>

          <MenuItemModal
            item={selectedMenuItem}
            isOpen={!!selectedMenuItem}
            onClose={handleCloseModal}
            onCartAnimation={() => {
            }}
          />
        </div>
      )}
    </div>
  )
}

export default MenuPreview