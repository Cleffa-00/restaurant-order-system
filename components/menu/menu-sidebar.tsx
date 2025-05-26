"use client"

import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  slug: string
  order: number
  visible: boolean
}

interface MenuSidebarProps {
  categories: Category[]
  selectedCategory: string
  onSelectCategory: (categoryId: string) => void
}

export function MenuSidebar({ categories, selectedCategory, onSelectCategory }: MenuSidebarProps) {
  return (
    <nav className="h-full overflow-y-auto">
      <div className="p-4 space-y-1">
        <button
          onClick={() => onSelectCategory("all")}
          className={cn(
            "w-full text-left px-4 py-3 rounded-lg font-medium transition-colors",
            "hover:bg-gray-100",
            selectedCategory === "all" ? "bg-gray-900 text-white hover:bg-gray-800" : "text-gray-700",
          )}
        >
          All Categories
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-lg font-medium transition-colors",
              "hover:bg-gray-100",
              selectedCategory === category.id ? "bg-gray-900 text-white hover:bg-gray-800" : "text-gray-700",
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
    </nav>
  )
}
