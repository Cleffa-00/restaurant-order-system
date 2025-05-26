// Mock admin menu data for category and menu item management
// This extends the existing mock data with admin-specific fields

import { v4 as uuidv4 } from "uuid"
import { mockCategories } from "../mock-data"

export interface AdminMenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  available: boolean
  categoryId: string
  optionGroups?: AdminOptionGroup[]
}

export interface AdminOptionGroup {
  id: string
  name: string
  required: boolean
  multiSelect: boolean
  maxSelections?: number
  options: AdminOption[]
}

export interface AdminOption {
  id: string
  name: string
  priceDelta: number
  available: boolean
}

export interface AdminCategory {
  id: string
  name: string
  visible: boolean
  order: number
  menuItems: AdminMenuItem[]
}

// Transform existing mock data for admin use
let mockAdminMenu: AdminCategory[] = mockCategories.map((category) => ({
  id: category.id,
  name: category.name,
  visible: category.visible,
  order: category.order,
  menuItems: category.menuItems.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    imageUrl: item.imageUrl, // Map imageUrl to image for admin interface
    available: item.available,
    categoryId: item.categoryId,
    optionGroups:
      item.optionGroups?.map((group) => ({
        id: group.id,
        name: group.name,
        required: group.required,
        multiSelect: group.multiSelect || false,
        maxSelections: group.maxSelections,
        options: group.options.map((option) => ({
          id: option.id,
          name: option.optionName, // 修复：映射 optionName 到 name
          priceDelta: option.priceDelta,
          available: option.available !== undefined ? option.available : true, // 默认为可用
        })),
      })) || [],
  })),
}))

// Option group templates for quick setup
export const optionGroupTemplates = [
  {
    id: "spice-level",
    name: "Spice Level",
    required: true,
    multiSelect: false,
    options: [
      { name: "Mild", priceDelta: 0 },
      { name: "Medium", priceDelta: 0 },
      { name: "Hot", priceDelta: 0 },
      { name: "Extra Hot", priceDelta: 0.5 },
    ],
  },
  {
    id: "size",
    name: "Size",
    required: true,
    multiSelect: false,
    options: [
      { name: "Small", priceDelta: -2 },
      { name: "Medium", priceDelta: 0 },
      { name: "Large", priceDelta: 3 },
    ],
  },
  {
    id: "toppings",
    name: "Extra Toppings",
    required: false,
    multiSelect: true,
    maxSelections: 5,
    options: [
      { name: "Extra Cheese", priceDelta: 1.5 },
      { name: "Bacon", priceDelta: 2 },
      { name: "Mushrooms", priceDelta: 1 },
      { name: "Pepperoni", priceDelta: 1.5 },
      { name: "Olives", priceDelta: 1 },
    ],
  },
]

export function getAdminMenu(): AdminCategory[] {
  const menu = [...mockAdminMenu].sort((a, b) => a.order - b.order)

  // 调试：检查option groups数据
  menu.forEach((category) => {
    category.menuItems.forEach((item) => {
      if (item.optionGroups && item.optionGroups.length > 0) {
        console.log(
          `Item ${item.name} has ${item.optionGroups.length} option groups:`,
          item.optionGroups.map((g) => ({
            name: g.name,
            optionsCount: g.options.length,
            optionNames: g.options.map((o) => o.name),
          })),
        )
      }
    })
  })

  return menu
}

export function updateCategory(categoryId: string, updates: Partial<Omit<AdminCategory, "id" | "menuItems">>) {
  // TODO: replace with PATCH /api/admin/category/:id
  const categoryIndex = mockAdminMenu.findIndex((cat) => cat.id === categoryId)
  if (categoryIndex !== -1) {
    mockAdminMenu[categoryIndex] = { ...mockAdminMenu[categoryIndex], ...updates }
  }
}

export function deleteCategory(categoryId: string) {
  // TODO: replace with DELETE /api/admin/category/:id
  mockAdminMenu = mockAdminMenu.filter((cat) => cat.id !== categoryId)
}

export function updateMenuItem(itemId: string, updates: Partial<Omit<AdminMenuItem, "id" | "categoryId">>) {
  // TODO: replace with PATCH /api/admin/menu-item/:id
  for (const category of mockAdminMenu) {
    const itemIndex = category.menuItems.findIndex((item) => item.id === itemId)
    if (itemIndex !== -1) {
      category.menuItems[itemIndex] = { ...category.menuItems[itemIndex], ...updates }
      break
    }
  }
}

export function addOptionGroupToItem(itemId: string, optionGroup: Omit<AdminOptionGroup, "id">): AdminOptionGroup {
  // TODO: replace with POST /api/admin/menu-item/:id/option-group
  const newOptionGroup: AdminOptionGroup = {
    id: uuidv4(),
    ...optionGroup,
    options: optionGroup.options.map((option) => ({
      id: uuidv4(),
      ...option,
      available: true,
    })),
  }

  for (const category of mockAdminMenu) {
    const item = category.menuItems.find((item) => item.id === itemId)
    if (item) {
      if (!item.optionGroups) item.optionGroups = []
      item.optionGroups.push(newOptionGroup)
      break
    }
  }

  return newOptionGroup
}

export function updateOptionGroup(itemId: string, groupId: string, updates: Partial<AdminOptionGroup>) {
  // TODO: replace with PATCH /api/admin/option-group/:id
  for (const category of mockAdminMenu) {
    const item = category.menuItems.find((item) => item.id === itemId)
    if (item?.optionGroups) {
      const groupIndex = item.optionGroups.findIndex((group) => group.id === groupId)
      if (groupIndex !== -1) {
        item.optionGroups[groupIndex] = { ...item.optionGroups[groupIndex], ...updates }
        break
      }
    }
  }
}

export function deleteOptionGroup(itemId: string, groupId: string) {
  // TODO: replace with DELETE /api/admin/option-group/:id
  for (const category of mockAdminMenu) {
    const item = category.menuItems.find((item) => item.id === itemId)
    if (item?.optionGroups) {
      item.optionGroups = item.optionGroups.filter((group) => group.id !== groupId)
      break
    }
  }
}

export function addOptionToGroup(itemId: string, groupId: string, option: Omit<AdminOption, "id">): AdminOption {
  // TODO: replace with POST /api/admin/option-group/:id/option
  const newOption: AdminOption = {
    id: uuidv4(),
    ...option,
    available: true,
  }

  for (const category of mockAdminMenu) {
    const item = category.menuItems.find((item) => item.id === itemId)
    if (item?.optionGroups) {
      const group = item.optionGroups.find((group) => group.id === groupId)
      if (group) {
        group.options.push(newOption)
        break
      }
    }
  }

  return newOption
}

export function updateOption(
  itemId: string,
  groupId: string,
  optionId: string,
  updates: Partial<Omit<AdminOption, "id">>,
) {
  // TODO: replace with PATCH /api/admin/option/:id
  for (const category of mockAdminMenu) {
    const item = category.menuItems.find((item) => item.id === itemId)
    if (item?.optionGroups) {
      const group = item.optionGroups.find((group) => group.id === groupId)
      if (group) {
        const optionIndex = group.options.findIndex((option) => option.id === optionId)
        if (optionIndex !== -1) {
          group.options[optionIndex] = { ...group.options[optionIndex], ...updates }
          break
        }
      }
    }
  }
}

export function deleteOption(itemId: string, groupId: string, optionId: string) {
  // TODO: replace with DELETE /api/admin/option/:id
  for (const category of mockAdminMenu) {
    const item = category.menuItems.find((item) => item.id === itemId)
    if (item?.optionGroups) {
      const group = item.optionGroups.find((group) => group.id === groupId)
      if (group) {
        group.options = group.options.filter((option) => option.id !== optionId)
        break
      }
    }
  }
}

export function reorderOptionGroups(itemId: string, groupIds: string[]) {
  // TODO: replace with PATCH /api/admin/menu-item/:id/option-groups/reorder
  for (const category of mockAdminMenu) {
    const item = category.menuItems.find((item) => item.id === itemId)
    if (item?.optionGroups) {
      const reorderedGroups = groupIds
        .map((id) => item.optionGroups?.find((group) => group.id === id))
        .filter(Boolean) as AdminOptionGroup[]

      item.optionGroups = reorderedGroups
      break
    }
  }
}

export function deleteMenuItem(itemId: string) {
  // TODO: replace with DELETE /api/admin/menu-item/:id
  for (const category of mockAdminMenu) {
    category.menuItems = category.menuItems.filter((item) => item.id !== itemId)
  }
}

export function updateCategoryOrder(categoryIds: string[]) {
  // TODO: replace with PATCH /api/admin/categories/reorder
  const reorderedCategories = categoryIds
    .map((id, index) => {
      const category = mockAdminMenu.find((cat) => cat.id === id)
      if (category) {
        return { ...category, order: index + 1 }
      }
      return null
    })
    .filter(Boolean) as AdminCategory[]

  mockAdminMenu = reorderedCategories
}

export function addCategory(categoryData: { name: string; visible: boolean }): AdminCategory {
  // TODO: replace with POST /api/admin/category
  const newCategory: AdminCategory = {
    id: uuidv4(),
    name: categoryData.name,
    visible: categoryData.visible,
    order: mockAdminMenu.length + 1,
    menuItems: [],
  }

  mockAdminMenu.push(newCategory)
  return newCategory
}

export function addMenuItem(categoryId: string, itemData: Omit<AdminMenuItem, "id" | "categoryId">): AdminMenuItem {
  // TODO: replace with POST /api/admin/menu-item
  const newMenuItem: AdminMenuItem = {
    id: uuidv4(),
    ...itemData,
    categoryId,
    imageUrl: itemData.imageUrl ?? "", // ✅ 显式处理 imageUrl
    optionGroups: itemData.optionGroups || [],
  }

  const categoryIndex = mockAdminMenu.findIndex((cat) => cat.id === categoryId)
  if (categoryIndex !== -1) {
    mockAdminMenu[categoryIndex].menuItems.push(newMenuItem)
  }

  return newMenuItem
}

export function reorderCategories(fromIndex: number, toIndex: number) {
  // TODO: replace with PATCH /api/admin/categories/reorder
  const categories = [...mockAdminMenu]
  const [movedCategory] = categories.splice(fromIndex, 1)
  categories.splice(toIndex, 0, movedCategory)

  // Update order values
  categories.forEach((category, index) => {
    category.order = index + 1
  })

  mockAdminMenu = categories
}
