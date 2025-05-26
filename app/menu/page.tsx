import type { Metadata } from "next"
import { MenuLayout } from "@/components/menu/menu-layout"

export const metadata: Metadata = {
  title: "Menu | Restaurant Ordering System",
  description: "Browse our delicious menu items",
}

export default function MenuPage() {
  // TODO: fetch menu data from server (categories + menuItems)
  // API structure: Category { id, name, slug, order, visible, menuItems: MenuItem[] }
  // MenuItem { id, name, description, price: Decimal, imageUrl, available, categoryId, deleted, createdAt, updatedAt }
  // Remember to: 1) convert Decimal to number 2) filter deleted items 3) handle relations
  return <MenuLayout />
}
