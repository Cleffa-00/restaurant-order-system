import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Order Successful | Restaurant Ordering System",
  description: "Your order has been successfully placed",
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold">Order Successful</h1>
      {/* Success page content will be implemented later */}
    </div>
  )
}

