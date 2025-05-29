import CartClientPage from "../../_components/cart/CartClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Your Cart | Restaurant Ordering System",
  description: "View and modify your food order",
}

export default function CartPage() {
  return <CartClientPage />
}