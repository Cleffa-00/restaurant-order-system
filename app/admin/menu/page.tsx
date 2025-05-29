"use client"

import { useState, useEffect } from "react"
import { AdminTopbar } from "@/components/admin/AdminTopbar"
import { CategorySidebar } from "@/components/admin/menu/CategorySidebar"
import { MenuItemList } from "@/components/admin/menu/MenuItemList"
import { MenuPreview } from "@/components/admin/menu/MenuPreview"
import { CreateMenuItemModal } from "@/components/admin/menu/CreateMenuItemModal"
import { ConfirmDeleteModal } from "@/components/admin/menu/ConfirmDeleteModal"
import { ToastManager } from "@/components/ui/feedback/toast"
import { useCategories } from "@/lib/hooks/admin/useCategories"
import { useMenuItems } from "@/lib/hooks/admin/useMenuItems"
import type { AdminCategory, AdminMenuItem } from "@/types/admin"
import { EditMenuItemModal } from "@/components/admin/menu/EditMenuItemModal"

interface ToastItem {
  id: string
  type: "success" | "error" | "info"
  message: string
}

// 类型转换函数 - 将 API 类型转换为组件所需的类型
// 在 page.tsx 中修复 transformAdminMenuItemToLegacy 函数：

// 使用类型断言的版本：

// 清理后的 transformAdminMenuItemToLegacy 函数（移除所有调试日志）：

function transformAdminMenuItemToLegacy(item: AdminMenuItem): any {
  const transformed = {
    ...item,
    image: item.imageUrl || "",
    price: Number(item.price),
    optionGroups: item.optionGroups?.map(group => ({
      ...group,
      options: group.options?.map(option => ({
        ...option, // 保留所有原始字段
        name: option.name || (option as any).optionName || "",
        optionName: (option as any).optionName || option.name || "",
        priceDelta: Number(option.priceDelta) || 0,
        optionGroupId: option.optionGroupId || (option as any).groupId,
        groupId: (option as any).groupId || option.optionGroupId,
        deleted: option.deleted || false,
        available: (option as any).available !== false,
      })) || []
    })) || []
  }
  
  return transformed
}

function transformAdminCategoryToLegacy(category: AdminCategory): any {
  return {
    ...category,
    menuItems: category.menuItems.map(transformAdminMenuItemToLegacy)
  }
}

export default function AdminMenuPage() {
  // State - 先声明 selectedCategoryId
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
  const [toasts, setToasts] = useState<ToastItem[]>([])

  // API Hooks - 在 selectedCategoryId 声明后使用
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories
  } = useCategories()

  const {
    menuItems,
    isLoading: menuItemsLoading,
    error: menuItemsError,
    createMenuItem: createMenuItemApi,
    updateMenuItem: updateMenuItemApi,
    deleteMenuItem: deleteMenuItemApi,
    toggleMenuItemAvailability
  } = useMenuItems(selectedCategoryId || undefined)

  // Toast management
  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, type, message }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const showSuccess = (message: string) => addToast("success", message)
  const showError = (message: string) => addToast("error", message)

  // Auto-select first category when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id)
    }
  }, [categories, selectedCategoryId])

  // Combine category data with real menu items
  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId) 
    ? {
        ...transformAdminCategoryToLegacy(categories.find((cat) => cat.id === selectedCategoryId)!),
        menuItems: menuItems ? menuItems.map(transformAdminMenuItemToLegacy) : []
      }
    : null

  // Transform categories for components that need legacy format
  const transformedCategories = categories.map(transformAdminCategoryToLegacy)

  // Handlers
  const handleTogglePreview = async () => {
    if (!isPreviewMode) {
      // 切换到预览模式时，强制刷新数据
      // console.log("🔄 [Preview] 切换到预览模式，刷新数据...")  
      try {
        await refetchCategories() // 刷新分类数据
        showSuccess('Preview data refreshed')
      } catch (error) {
        // console.error("刷新数据失败:", error)
        showError('Failed to refresh preview data')
      }
    }
    setIsPreviewMode(!isPreviewMode)
  }
  
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
  }

  const handleToggleCategoryVisible = async (categoryId: string, visible: boolean) => {
    try {
      await updateCategory(categoryId, { visible })
      showSuccess(`Category ${visible ? 'shown' : 'hidden'} successfully`)
    } catch (error) {
      showError('Failed to update category visibility')
    }
  }

  const handleMoveCategoryUp = async (categoryId: string) => {
    const currentIndex = categories.findIndex((cat) => cat.id === categoryId)
    if (currentIndex > 0) {
      const newOrder = [...categories]
      const temp = newOrder[currentIndex]
      newOrder[currentIndex] = newOrder[currentIndex - 1]
      newOrder[currentIndex - 1] = temp
      
      try {
        await reorderCategories(newOrder.map(cat => cat.id))
        showSuccess('Category moved up')
      } catch (error) {
        showError('Failed to reorder categories')
      }
    }
  }

  const handleMoveCategoryDown = async (categoryId: string) => {
    const currentIndex = categories.findIndex((cat) => cat.id === categoryId)
    if (currentIndex < categories.length - 1) {
      const newOrder = [...categories]
      const temp = newOrder[currentIndex]
      newOrder[currentIndex] = newOrder[currentIndex + 1]
      newOrder[currentIndex + 1] = temp
      
      try {
        await reorderCategories(newOrder.map(cat => cat.id))
        showSuccess('Category moved down')
      } catch (error) {
        showError('Failed to reorder categories')
      }
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

  // 在 page.tsx 中修复 handleEditMenuItem 函数：

  const handleEditMenuItem = (item: any) => {
    
    // 转换回原始的 AdminMenuItem 类型
    const originalItem: AdminMenuItem = {
      ...item,
      imageUrl: item.image || item.imageUrl || null,
      // 🔥 修复：正确保留 optionGroups 结构，不要破坏原始数据
      optionGroups: item.optionGroups?.map((group: any) => {
        return {
          ...group,
          options: group.options?.map((option: any) => {
            
            // 🔥 关键修复：保留原始字段，不要重新映射
            return {
              ...option, // 保留所有原始字段
              // 确保必要字段存在
              id: option.id,
              name: option.name || option.optionName || "", // 优先使用现有的 name，然后是 optionName
              priceDelta: Number(option.priceDelta) || 0,
              optionGroupId: option.optionGroupId || option.groupId,
              groupId: option.groupId || option.optionGroupId,
              deleted: option.deleted || false,
            }
          }) || []
        }
      }) || []
    }
    
    setEditingItem(originalItem)
  }

  const handleDeleteMenuItem = (itemId: string) => {
    const item = selectedCategory?.menuItems.find((item: any) => item.id === itemId)
    if (item) {
      setDeleteModal({
        isOpen: true,
        type: "item",
        id: itemId,
        name: item.name,
      })
    }
  }

  const handleToggleMenuItemAvailable = async (itemId: string, available: boolean) => {
    try {
      await toggleMenuItemAvailability(itemId, available)
      showSuccess(`Menu item ${available ? 'enabled' : 'disabled'} successfully`)
    } catch (error) {
      showError('Failed to update menu item availability')
    }
  }

  const handleNewMenuItem = () => {
    setShowCreateMenuItem(true)
  }

  // 在你的 AdminMenuPage 中，将这个函数替换掉原来的 handleSaveMenuItem
const handleSaveMenuItem = async (itemId: string, updates: { 
  name: string; 
  price: number; 
  description: string; 
  image?: string; 
  available?: boolean; 
  optionGroups?: any[] 
}) => {
  try {
    // console.log('🔥 handleSaveMenuItem called with updates:', updates)
    
    // 构建完整的更新数据 - 注意字段名映射
    const updateData = {
      name: updates.name,
      price: updates.price,
      description: updates.description,
      imageUrl: updates.image || null, // 映射 image -> imageUrl
      available: updates.available ?? true,
      optionGroups: updates.optionGroups || [] // 🔥 包含选项组数据
    }
    
    // console.log('🔥 Sending update data to API:', updateData)
    
    // 如果有选项组，打印详细信息
    // if (updateData.optionGroups.length > 0) {
    //   updateData.optionGroups.forEach((group, index) => {
    //     console.log(`🔥 Option Group ${index + 1}:`, {
    //       id: group.id,
    //       name: group.name,
    //       required: group.required,
    //       optionsCount: group.options?.length || 0,
    //       options: group.options?.map((opt: any) => ({
    //         id: opt.id,
    //         name: opt.name,
    //         priceDelta: opt.priceDelta
    //       }))
    //     });
    //   });
    // }
    
    // 调用 API 更新菜单项（包括选项组）
    await updateMenuItemApi(itemId, updateData)
    
    setEditingItem(null)
    showSuccess(`Menu item updated successfully with ${updateData.optionGroups.length} option groups`)
    
    // 保存成功后立即刷新数据
    // console.log("🔄 [Save] 菜单项保存成功，刷新数据...")
    await refetchCategories() // 刷新分类数据，这会包含更新的菜单项
    
  } catch (error) {
    showError('Failed to update menu item and option groups')
    // console.error('🔥 Failed to save menu item:', error)
    
    // 打印详细错误信息
    if (error instanceof Error) {
      // console.error('🔥 Error message:', error.message)
      // console.error('🔥 Error stack:', error.stack)
    }
  }
}

  const handleReorderCategories = async (categoryIds: string[]) => {
    try {
      await reorderCategories(categoryIds)
      showSuccess('Categories reordered successfully')
    } catch (error) {
      showError('Failed to reorder categories')
    }
  }

  const handleAddCategory = async (categoryData: { name: string; visible: boolean }) => {
    try {
      // 添加缺失的可选字段
      const createData = {
        name: categoryData.name,
        visible: categoryData.visible,
        slug: categoryData.name.toLowerCase().replace(/\s+/g, "-"), // 自动生成 slug
        order: categories.length + 1 // 自动生成 order
      }
      
      const newCategory = await createCategory(createData)
      setSelectedCategoryId(newCategory.id) // Auto-select new category
      showSuccess('Category created successfully')
    } catch (error) {
      showError('Failed to create category')
    }
  }

  const handleCreateMenuItem = async (itemData: {
    name: string
    description: string
    price: number
    image: string
    available: boolean
    optionGroups: any[]
  }) => {
    if (!selectedCategoryId) return
  
    try {
      const createData = {
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        imageUrl: itemData.image,
        available: itemData.available,
        categoryId: selectedCategoryId,
        optionGroups: itemData.optionGroups
      }
  
      await createMenuItemApi(createData)
      setShowCreateMenuItem(false)
      showSuccess('Menu item created successfully')
      
      // 🔄 创建成功后也刷新数据
      console.log("🔄 [Create] 菜单项创建成功，刷新数据...")
      await refetchCategories()
      
    } catch (error) {
      showError('Failed to create menu item')
      // console.error('Failed to create menu item:', error)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      if (deleteModal.type === "category") {
        await deleteCategory(deleteModal.id)

        // Handle category selection after deletion
        if (selectedCategoryId === deleteModal.id) {
          setSelectedCategoryId(categories.length > 1 ? categories.find(c => c.id !== deleteModal.id)?.id || null : null)
        }
        
        showSuccess('Category deleted successfully')
      } else {
        // Delete menu item
        await deleteMenuItemApi(deleteModal.id)
        showSuccess('Menu item deleted successfully')
      }
    } catch (error) {
      showError(`Failed to delete ${deleteModal.type}`)
    } finally {
      setDeleteModal({ ...deleteModal, isOpen: false })
    }
  }

  // Loading state
  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (categoriesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading menu data: {categoriesError}</p>
          <button
            onClick={refetchCategories}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Manager */}
      <ToastManager toasts={toasts} onRemove={removeToast} />

      {/* Unified Admin Topbar */}
      <AdminTopbar isPreviewMode={isPreviewMode} onTogglePreview={handleTogglePreview} />

      {/* Main content area with slide-in animation */}
      <div className="animate-in slide-in-from-left-4 duration-300">
        <div className="pt-0">
          {isPreviewMode ? (
            <MenuPreview categories={transformedCategories} />
          ) : (
            <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]">
              <CategorySidebar
                categories={transformedCategories}
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
        item={editingItem ? transformAdminMenuItemToLegacy(editingItem) : null}
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