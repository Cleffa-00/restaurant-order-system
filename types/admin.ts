// types/admin.ts
export interface AdminCategory {
  id: string
  name: string
  slug: string
  order: number
  visible: boolean
  menuItems: AdminMenuItem[]
  createdAt: Date
  updatedAt: Date
}

export interface AdminMenuItem {
  id: string
  name: string
  description: string | null
  price: number // Prisma 中是 Decimal，但在 JS 中通常作为 number 处理
  imageUrl: string | null
  available: boolean
  categoryId: string | null
  category?: AdminCategory | null
  optionGroups: AdminOptionGroup[]
  deleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AdminOptionGroup {
  id: string
  menuItemId: string
  name: string
  required: boolean
  options: AdminOption[]
  deleted: boolean
}

export interface AdminOption {
  id: string
  optionGroupId: string // 在 Prisma 中是 groupId
  name: string // 在 Prisma 中是 optionName
  priceDelta: number // Prisma 中是 Decimal
  deleted: boolean
}

// API 请求类型
export interface CreateCategoryRequest {
  name: string
  visible?: boolean
  slug?: string  // 后端自动生成，但类型中需要包含
  order?: number // 后端自动生成，但类型中需要包含
}

export interface UpdateCategoryRequest {
  name?: string
  visible?: boolean
  order?: number
}

export interface CreateMenuItemRequest {
  name: string
  description?: string
  price: number
  imageUrl?: string
  available?: boolean
  categoryId?: string
  optionGroups?: CreateOptionGroupRequest[]
}

// 🔥 修复：添加 optionGroups 到 UpdateMenuItemRequest
export interface UpdateMenuItemRequest {
  name?: string
  description?: string
  price?: number
  imageUrl?: string | null // 🔥 修复：允许 null 值
  available?: boolean
  categoryId?: string
  optionGroups?: UpdateOptionGroupRequest[] // 🔥 添加这个字段
}

export interface CreateOptionGroupRequest {
  name: string
  required?: boolean
  options?: CreateOptionRequest[]
}

export interface CreateOptionRequest {
  name: string // 对应 Prisma 的 optionName
  priceDelta?: number
}

// 🔥 修复：更新 UpdateOptionGroupRequest 以支持完整的选项组更新
export interface UpdateOptionGroupRequest {
  id?: string // 用于更新现有的选项组
  name?: string
  required?: boolean
  options?: UpdateOptionRequest[] // 更改为 UpdateOptionRequest
}

// 🔥 新增：UpdateOptionRequest 类型
export interface UpdateOptionRequest {
  id?: string // 用于更新现有选项
  name: string // 对应 Prisma 的 optionName
  priceDelta?: number
  deleted?: boolean // 支持软删除
}

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