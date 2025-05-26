"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CategoryOption {
  id: string
  name: string
  count?: number
  disabled?: boolean
}

export interface CategoryTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  categories: CategoryOption[]
  value: string
  onValueChange: (value: string) => void
  showAll?: boolean
  allLabel?: string
  variant?: "default" | "pills" | "underline"
  size?: "sm" | "default" | "lg"
}

export function CategoryTabs({
  className,
  categories,
  value,
  onValueChange,
  showAll = true,
  allLabel = "All",
  variant = "default",
  size = "default",
  ...props
}: CategoryTabsProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to selected category when it changes
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedButton = scrollContainerRef.current.querySelector(`[data-category="${value}"]`)
      if (selectedButton) {
        selectedButton.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        })
      }
    }
  }, [value])

  const getButtonClasses = (isSelected: boolean, disabled?: boolean) => {
    const baseClasses = cn(
      "flex-shrink-0 font-medium transition-colors whitespace-nowrap",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      {
        "px-3 py-1.5 text-xs": size === "sm",
        "px-4 py-2 text-sm": size === "default",
        "px-5 py-2.5 text-base": size === "lg",
      },
      disabled && "opacity-50 cursor-not-allowed",
    )

    if (variant === "pills") {
      return cn(
        baseClasses,
        "rounded-full border",
        isSelected
          ? "bg-gray-900 text-white shadow rounded-xl"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl",
      )
    }

    if (variant === "underline") {
      return cn(
        baseClasses,
        "border-b-2 pb-2",
        isSelected
          ? "text-gray-900 border-gray-900"
          : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300",
      )
    }

    // Default variant
    return cn(
      baseClasses,
      "rounded-xl border-0",
      isSelected ? "bg-gray-900 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    )
  }

  return (
    <div className={cn("bg-white", variant === "underline" && "border-b border-gray-200", className)} {...props}>
      <div
        ref={scrollContainerRef}
        className={cn("flex overflow-x-auto scrollbar-hide gap-2", variant === "underline" ? "px-4 py-0" : "px-4 py-3")}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {showAll && (
          <button
            data-category="all"
            onClick={() => onValueChange("all")}
            className={getButtonClasses(value === "all")}
          >
            {allLabel}
          </button>
        )}

        {categories.map((category) => (
          <button
            key={category.id}
            data-category={category.id}
            onClick={() => !category.disabled && onValueChange(category.id)}
            className={getButtonClasses(value === category.id, category.disabled)}
            disabled={category.disabled}
          >
            {category.name}
            {category.count !== undefined && <span className="ml-1 text-xs opacity-75">({category.count})</span>}
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
