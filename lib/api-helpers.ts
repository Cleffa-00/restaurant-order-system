import { neon } from "@neondatabase/serverless"
import { transformCategories, transformMenuItems } from "./data-transformers"
import type { FrontendCategory, FrontendMenuItem } from "./data-transformers"

const sql = neon(process.env.DATABASE_URL!)

/**
 * Fetch categories with menu items from database
 * Returns transformed data ready for frontend consumption
 */
export async function fetchCategoriesWithMenuItems(): Promise<FrontendCategory[]> {
  try {
    // Fetch categories with their menu items
    const categories = await sql`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c."order",
        c.visible,
        json_agg(
          json_build_object(
            'id', m.id,
            'name', m.name,
            'description', m.description,
            'price', m.price,
            'imageUrl', m."imageUrl",
            'available', m.available,
            'categoryId', m."categoryId",
            'deleted', m.deleted
          ) ORDER BY m.name
        ) FILTER (WHERE m.id IS NOT NULL) as "menuItems"
      FROM "Category" c
      LEFT JOIN "MenuItem" m ON c.id = m."categoryId"
      WHERE c.visible = true
      GROUP BY c.id, c.name, c.slug, c."order", c.visible
      ORDER BY c."order"
    `

    // Transform the raw SQL result to match Prisma types, then transform for frontend
    const transformedCategories = categories.map((cat) => ({
      ...cat,
      menuItems: cat.menuItems || [],
    }))

    return transformCategories(transformedCategories as any)
  } catch (error) {
    return [];
  }
}

/**
 * Fetch menu items by category ID
 */
export async function fetchMenuItemsByCategory(categoryId: string): Promise<FrontendMenuItem[]> {
  try {
    const menuItems = await sql`
      SELECT * FROM "MenuItem" 
      WHERE "categoryId" = ${categoryId} 
      AND deleted = false 
      AND available = true
      ORDER BY name
    `

    return transformMenuItems(menuItems as any)
  } catch (error) {
    return [];
  }
}

/**
 * Fetch all available menu items
 */
export async function fetchAllMenuItems(): Promise<FrontendMenuItem[]> {
  try {
    const menuItems = await sql`
      SELECT * FROM "MenuItem" 
      WHERE deleted = false 
      AND available = true
      ORDER BY name
    `

    return transformMenuItems(menuItems as any)
  } catch (error) {
    return [];
  }
}
