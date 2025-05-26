"use client"

import { useState, useEffect } from "react"
import { AdminTopbar } from "@/components/admin/AdminTopbar"
import { CategorySidebar } from "@/components/admin/menu/CategorySidebar"
import { MenuItemList } from "@/components/admin/menu/MenuItemList"
import { MenuPreview } from "@/components/admin/menu/MenuPreview"
import { EditMenuItemModal } from "@/components/admin/menu/EditMenuItemModal"
import { CreateMenuItemModal } from "@/components/admin/menu/CreateMenuItemModal"
import { ConfirmDeleteModal } from "@/components/admin/menu/ConfirmDeleteModal"
import {
  getAdminMenu,
  updateCategory,
  deleteCategory,
  updateMenuItem,
  deleteMenuItem,
  updateCategoryOrder,
  addCategory,
  type AdminCategory,
  type AdminMenuItem,
  reorderCategories,
  addMenuItem,
} from "@/lib/mock-data/admin-menu"

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<AdminMenuItem | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    type: "category" | "item"
    id: string
    name: string
  }>({
    isOpen: false,
    type: "category",
    id: "",
    name: "",
  })
  const [showCreateMenuItem, setShowCreateMenuItem] = useState(false)

  // Centralized refresh function to ensure UI stays in sync
  const refreshCategories = () => {
    const adminMenu = getAdminMenu()
    setCategories(adminMenu)
  }

  useEffect(() => {
    refreshCategories()
  }, [])

  useEffect(() => {
    // Auto-select first category if none selected and categories exist
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id)
    }
  }, [categories, selectedCategoryId])

  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId) || null

  const handleTogglePreview = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
  }

  const handleToggleCategoryVisible = (categoryId: string, visible: boolean) => {
    // TODO: replace with PATCH /api/admin/category/:id
    updateCategory(categoryId, { visible })
    refreshCategories() // ✅ Refresh after visibility toggle
  }

  const handleMoveCategoryUp = (categoryId: string) => {
    const currentIndex = categories.findIndex((cat) => cat.id === categoryId)
    if (currentIndex > 0) {
      // TODO: replace with PATCH /api/admin/categories/reorder
      reorderCategories(currentIndex, currentIndex - 1)
      refreshCategories() // ✅ Refresh after reorder
    }
  }

  const handleMoveCategoryDown = (categoryId: string) => {
    const currentIndex = categories.findIndex((cat) => cat.id === categoryId)
    if (currentIndex < categories.length - 1) {
      // TODO: replace with PATCH /api/admin/categories/reorder
      reorderCategories(currentIndex, currentIndex + 1)
      refreshCategories() // ✅ Refresh after reorder
    }
  }

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    if (category) {
      setDeleteModal({
        isOpen: true,
        type: "category",
        id: categoryId,
        name: category.name,
      })
    }
  }

  const handleEditMenuItem = (item: AdminMenuItem) => {
    setEditingItem(item)
  }

  const handleDeleteMenuItem = (itemId: string) => {
    const item = selectedCategory?.menuItems.find((item) => item.id === itemId)
    if (item) {
      setDeleteModal({
        isOpen: true,
        type: "item",
        id: itemId,
        name: item.name,
      })
    }
  }

  const handleToggleMenuItemAvailable = (itemId: string, available: boolean) => {
    // TODO: replace with PATCH /api/admin/menu-item/:id
    updateMenuItem(itemId, { available })
    refreshCategories() // ✅ Refresh after availability toggle
  }

  const handleNewMenuItem = () => {
    setShowCreateMenuItem(true)
  }

  const handleSaveMenuItem = (itemId: string, updates: { name: string; price: number; description: string }) => {
    // TODO: replace with PATCH /api/admin/menu-item/:id
    updateMenuItem(itemId, updates)
    refreshCategories() // ✅ Refresh after editing menu item
  }

  const handleReorderCategories = (categoryIds: string[]) => {
    // TODO: replace with PATCH /api/admin/categories/reorder
    updateCategoryOrder(categoryIds)
    refreshCategories() // ✅ Refresh after drag-and-drop reorder
  }

  const handleAddCategory = (categoryData: { name: string; visible: boolean }) => {
    // TODO: replace with POST /api/admin/category
    const newCategory = addCategory(categoryData)
    refreshCategories() // ✅ Refresh after adding new category
    setSelectedCategoryId(newCategory.id) // Auto-select new category
  }

  const handleCreateMenuItem = (itemData: {
    name: string
    description: string
    price: number
    image: string
    available: boolean
    optionGroups: any[]
  }) => {
    if (!selectedCategoryId) return

    // TODO: replace with POST /api/admin/menu-item
    const newMenuItem = addMenuItem(selectedCategoryId, {
      ...itemData,
      available: itemData.available,
    })
    refreshCategories() // ✅ Refresh after adding new menu item
  }

  const handleConfirmDelete = () => {
    if (deleteModal.type === "category") {
      // TODO: replace with DELETE /api/admin/category/:id
      deleteCategory(deleteModal.id)

      // Handle category selection after deletion
      if (selectedCategoryId === deleteModal.id) {
        refreshCategories() // Refresh first to get updated list
        const remainingCategories = getAdminMenu()
        setSelectedCategoryId(remainingCategories.length > 0 ? remainingCategories[0].id : null)
      } else {
        refreshCategories() // ✅ Refresh after deleting category
      }
    } else {
      // TODO: replace with DELETE /api/admin/menu-item/:id
      deleteMenuItem(deleteModal.id)
      refreshCategories() // ✅ Refresh after deleting menu item
    }

    setDeleteModal({ ...deleteModal, isOpen: false })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Admin Topbar */}
      <AdminTopbar isPreviewMode={isPreviewMode} onTogglePreview={handleTogglePreview} />

      {/* Main content area with slide-in animation */}
      <div className="animate-in slide-in-from-left-4 duration-300">
        <div className="pt-0">
          {isPreviewMode ? (
            <MenuPreview categories={categories} />
          ) : (
            <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]">
              <CategorySidebar
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={handleSelectCategory}
                onToggleCategoryVisible={handleToggleCategoryVisible}
                onMoveCategoryUp={handleMoveCategoryUp}
                onMoveCategoryDown={handleMoveCategoryDown}
                onDeleteCategory={handleDeleteCategory}
                onReorderCategories={handleReorderCategories}
                onAddCategory={handleAddCategory}
              />

              <MenuItemList
                category={selectedCategory}
                onEditMenuItem={handleEditMenuItem}
                onDeleteMenuItem={handleDeleteMenuItem}
                onToggleMenuItemAvailable={handleToggleMenuItemAvailable}
                onNewMenuItem={handleNewMenuItem}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditMenuItemModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveMenuItem}
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title={`Delete ${deleteModal.type === "category" ? "Category" : "Menu Item"}`}
        description={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
      />

      {selectedCategory && (
        <CreateMenuItemModal
          categoryId={selectedCategory.id}
          categoryName={selectedCategory.name}
          isOpen={showCreateMenuItem}
          onClose={() => setShowCreateMenuItem(false)}
          onCreate={handleCreateMenuItem}
        />
      )}
    </div>
  )
}
