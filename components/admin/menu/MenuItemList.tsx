"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { MenuItemCard } from "./MenuItemCard"
import type { AdminMenuItem, AdminCategory } from "@/types/admin"

interface MenuItemListProps {
  category: AdminCategory | null
  onEditMenuItem: (item: AdminMenuItem) => void
  onDeleteMenuItem: (itemId: string) => void
  onToggleMenuItemAvailable: (itemId: string, available: boolean) => void
  onNewMenuItem: () => void
}

export function MenuItemList({
  category,
  onEditMenuItem,
  onDeleteMenuItem,
  onToggleMenuItemAvailable,
  onNewMenuItem,
}: MenuItemListProps) {
  if (!category) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white p-6">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Category Selected</h3>
          <p className="text-sm text-gray-600">Select a category from the sidebar to manage its menu items.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{category.menuItems.length} menu items</p>
          </div>
          <Button
            onClick={onNewMenuItem}
            className="bg-gray-900 text-white hover:bg-gray-800 text-sm font-medium px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Menu Item
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {category.menuItems.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Menu Items</h3>
            <p className="text-sm text-gray-600 mb-6">This category doesn't have any menu items yet.</p>
            <Button
              onClick={onNewMenuItem}
              variant="outline"
              className="border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Menu Item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-6">
            {category.menuItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onEdit={onEditMenuItem}
                onDelete={onDeleteMenuItem}
                onToggleAvailable={onToggleMenuItemAvailable}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
