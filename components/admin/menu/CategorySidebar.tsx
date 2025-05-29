"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/forms/button"
import { Plus } from "lucide-react"
import { CategoryItem } from "./CategoryItem"
import { AddCategoryModal } from "./AddCategoryModal"
import type { AdminCategory } from "@/types/admin"

interface CategorySidebarProps {
  categories: AdminCategory[]
  selectedCategoryId: string | null
  onSelectCategory: (categoryId: string) => void
  onToggleCategoryVisible: (categoryId: string, visible: boolean) => void
  onMoveCategoryUp: (categoryId: string) => void
  onMoveCategoryDown: (categoryId: string) => void
  onDeleteCategory: (categoryId: string) => void
  onReorderCategories: (categoryIds: string[]) => void
  onAddCategory: (categoryData: { name: string; visible: boolean }) => void
}

export function CategorySidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onToggleCategoryVisible,
  onMoveCategoryUp,
  onMoveCategoryDown,
  onDeleteCategory,
  onReorderCategories,
  onAddCategory,
}: CategorySidebarProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const reorderedCategories = [...categories]
    const [draggedCategory] = reorderedCategories.splice(draggedIndex, 1)
    reorderedCategories.splice(dropIndex, 0, draggedCategory)

    const categoryIds = reorderedCategories.map((cat) => cat.id)
    onReorderCategories(categoryIds)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="w-full md:w-72 lg:w-80 bg-white border-r border-gray-100 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className={`transition-all duration-200 ${
              draggedIndex === index ? "opacity-50 scale-105 z-10" : ""
            } ${dragOverIndex === index && draggedIndex !== index ? "border-t-2 border-black" : ""}`}
            draggable={window.innerWidth >= 768}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <CategoryItem
              category={category}
              isSelected={selectedCategoryId === category.id}
              isFirst={index === 0}
              isLast={index === categories.length - 1}
              onSelect={onSelectCategory}
              onToggleVisible={onToggleCategoryVisible}
              onMoveUp={onMoveCategoryUp}
              onMoveDown={onMoveCategoryDown}
              onDelete={onDeleteCategory}
              isDragging={draggedIndex === index}
            />
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-gray-100">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full bg-gray-900 text-white hover:bg-gray-800 text-sm font-medium px-4 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <AddCategoryModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={onAddCategory} />
    </div>
  )
}
