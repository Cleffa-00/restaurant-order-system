"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function CheckoutHeader() {
  const router = useRouter()

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-lg font-semibold">Checkout</h1>
        <div className="w-16" /> {/* Spacer for centering */}
      </div>
    </div>
  )
}
