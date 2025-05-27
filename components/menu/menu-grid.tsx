"use client"

import { MenuCard } from "./menu-card"
// ✅ 使用统一的类型定义
import { MenuItemWithDetails } from "@/types"

interface MenuGridProps {
  items: MenuItemWithDetails[] // ✅ 使用正确的类型
  selectedCategory: string
  onItemClick: (item: MenuItemWithDetails) => void // ✅ 使用正确的类型
  onCartAnimation?: (element: HTMLElement, isDecrease?: boolean) => void
}

export function MenuGrid({ items, selectedCategory, onItemClick, onCartAnimation }: MenuGridProps) {
  if (!items || !Array.isArray(items)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading menu items...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No items found in this category</p>
      </div>
    )
  }

  // 👉 如果选中 All，则按分类分组
  if (selectedCategory === "all") {
    const groupedItems = items.reduce((acc, item) => {
      const categoryName = item.category?.name ?? "Uncategorized"
      if (!acc[categoryName]) acc[categoryName] = []
      acc[categoryName].push(item)
      return acc
    }, {} as Record<string, MenuItemWithDetails[]>)

    return (
      <div className="space-y-10">
        {Object.entries(groupedItems).map(([categoryName, groupItems]) => (
          <div key={categoryName} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">{categoryName}</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">
              {groupItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onClick={() => onItemClick(item)}
                  onCartAnimation={onCartAnimation}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 👉 普通分类：直接平铺渲染
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">
      {items.map((item) => (
        <MenuCard
          key={item.id}
          item={item}
          onClick={() => onItemClick(item)}
          onCartAnimation={onCartAnimation}
        />
      ))}
    </div>
  )
}