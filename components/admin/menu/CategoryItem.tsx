"use client"

import { Button } from "@/components/ui/forms/button"
import { Switch } from "@/components/ui/forms/switch"
import { ChevronUp, ChevronDown, Trash2, GripVertical } from "lucide-react"
import type { AdminCategory } from "@/types/admin"

interface CategoryItemProps {
  category: AdminCategory
  isSelected: boolean
  isFirst: boolean
  isLast: boolean
  onSelect: (categoryId: string) => void
  onToggleVisible: (categoryId: string, visible: boolean) => void
  onMoveUp: (categoryId: string) => void
  onMoveDown: (categoryId: string) => void
  onDelete: (categoryId: string) => void
  isDragging?: boolean
}

export function CategoryItem({
  category,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onToggleVisible,
  onMoveUp,
  onMoveDown,
  onDelete,
  isDragging = false,
}: CategoryItemProps) {
  return (
    <div
      className={`p-5 border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 ${
        isSelected ? "bg-gray-900 border-gray-900 text-white" : "bg-white hover:bg-gray-50"
      } ${isDragging ? "opacity-50" : ""}`}
      onClick={() => onSelect(category.id)}
      draggable={false}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <GripVertical className="h-4 w-4 text-gray-400 cursor-grab flex-shrink-0 hidden md:block" />
          <h3 className={`font-semibold text-base truncate ${isSelected ? "text-white" : "text-gray-900"}`}>
            {category.name}
          </h3>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onMoveUp(category.id)
            }}
            disabled={isFirst}
            className="h-9 w-9 rounded-full p-0 text-gray-400 hover:bg-gray-100 hover:shadow-sm disabled:opacity-30"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onMoveDown(category.id)
            }}
            disabled={isLast}
            className="h-9 w-9 rounded-full p-0 text-gray-400 hover:bg-gray-100 hover:shadow-sm disabled:opacity-30"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(category.id)
            }}
            className="h-9 w-9 rounded-full p-0 text-gray-400 hover:shadow-sm hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${isSelected ? "text-gray-300" : "text-gray-500"}`}>
          {category.menuItems.length} items
        </span>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${isSelected ? "text-gray-300" : "text-gray-500"}`}>Visible</span>
          <Switch
            checked={category.visible}
            onCheckedChange={(checked) => {
              onToggleVisible(category.id, checked)
            }}
            onClick={(e) => e.stopPropagation()}
            className="scale-90 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
          />
        </div>
      </div>
    </div>
  )
}