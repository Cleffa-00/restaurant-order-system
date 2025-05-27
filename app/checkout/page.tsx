import CheckoutClientPage from "./CheckoutClientPage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout | Restaurant Ordering System",
  description: "Complete your food order",
}

export default function CheckoutPage() {
  return <CheckoutClientPage />
}