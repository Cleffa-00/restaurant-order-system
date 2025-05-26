"use client"

import { cn } from "@/lib/utils"
import { useRef, useEffect } from "react"

interface Category {
  id: string
  name: string
  slug: string
  order: number
  visible: boolean
}

interface MenuCategoryTabsProps {
  categories: Category[]
  selectedCategory: string
  onSelectCategory: (categoryId: string) => void
}

export function MenuCategoryTabs({ categories, selectedCategory, onSelectCategory }: MenuCategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to selected category when it changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedButton = scrollContainerRef.current.querySelector(`[data-category="${selectedCategory}"]`)
      if (selectedButton) {
        selectedButton.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        })
      }
    }
  }, [selectedCategory])

  return (
    <div className="bg-white border-b border-gray-200">
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide px-4 py-3 gap-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <button
          data-category="all"
          onClick={() => onSelectCategory("all")}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
            "border border-gray-200",
            selectedCategory === "all"
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300",
          )}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            data-category={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
              "border border-gray-200",
              selectedCategory === category.id
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300",
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Hide scrollbar with CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
