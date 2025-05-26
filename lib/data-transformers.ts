// Frontend expected types (based on mock data structure)
export interface FrontendCategory {
  id: string
  name: string
  slug: string
  order: number
  menuItems: FrontendMenuItem[]
}

export interface FrontendMenuItem {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  available: boolean
  categoryId: string
}

// Database types (matching Prisma schema structure)
export interface DatabaseCategory {
  id: string
  name: string
  slug: string
  order: number
  visible: boolean
  menuItems?: DatabaseMenuItem[]
}

export interface DatabaseMenuItem {
  id: string
  name: string
  description: string | null
  price: string | number // Can be Decimal string or number
  imageUrl: string | null
  available: boolean
  categoryId: string | null
  deleted: boolean
  createdAt?: Date
  updatedAt?: Date
}

// TODO: Uncomment when using in environment with Prisma support
// import type { Category as PrismaCategory, MenuItem as PrismaMenuItem } from "@prisma/client"

// TODO: Uncomment when using in environment with Prisma support
/*
// Prisma types with relations
type PrismaCategoryWithItems = PrismaCategory & {
  menuItems: PrismaMenuItem[]
}
*/

/**
 * Transform Database Category data to Frontend format
 * Filters out deleted menu items and converts Decimal prices to numbers
 */
export function transformCategory(dbCategory: DatabaseCategory): FrontendCategory {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    slug: dbCategory.slug,
    order: dbCategory.order,
    menuItems: (dbCategory.menuItems || [])
      .filter((item) => !item.deleted && item.available) // Filter deleted and unavailable items
      .map(transformMenuItem),
  }
}

/**
 * Transform Database MenuItem data to Frontend format
 * Converts Decimal price to number and handles optional fields
 */
export function transformMenuItem(dbMenuItem: DatabaseMenuItem): FrontendMenuItem {
  return {
    id: dbMenuItem.id,
    name: dbMenuItem.name,
    description: dbMenuItem.description || "",
    price: typeof dbMenuItem.price === "string" ? Number(dbMenuItem.price) : dbMenuItem.price,
    imageUrl: dbMenuItem.imageUrl || "/placeholder.svg?height=200&width=200&query=food",
    available: dbMenuItem.available,
    categoryId: dbMenuItem.categoryId || "",
  }
}

/**
 * Transform array of Database Categories to Frontend format
 * Filters out invisible categories and sorts by order
 */
export function transformCategories(dbCategories: DatabaseCategory[]): FrontendCategory[] {
  return dbCategories
    .filter((category) => category.visible) // Filter invisible categories
    .sort((a, b) => a.order - b.order) // Sort by order
    .map(transformCategory)
}

/**
 * Transform array of Database MenuItems to Frontend format
 * Useful for menu grid when fetching items separately
 */
export function transformMenuItems(dbMenuItems: DatabaseMenuItem[]): FrontendMenuItem[] {
  return dbMenuItems.filter((item) => !item.deleted && item.available).map(transformMenuItem)
}

/**
 * Get menu items by category ID from transformed data
 */
export function getMenuItemsByCategory(categories: FrontendCategory[], categoryId: string): FrontendMenuItem[] {
  const category = categories.find((cat) => cat.id === categoryId)
  return category?.menuItems || []
}

/**
 * Get all menu items from all categories (flattened)
 */
export function getAllMenuItems(categories: FrontendCategory[]): FrontendMenuItem[] {
  return categories.flatMap((category) => category.menuItems)
}
