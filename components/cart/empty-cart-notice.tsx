"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface EmptyCartNoticeProps {
  onBackToMenu: () => void
}

export function EmptyCartNotice({ onBackToMenu }: EmptyCartNoticeProps) {
  const { toast } = useToast()

  const handleBackToMenu = () => {
    toast({
      type: "info",
      message: "Redirecting to menu...",
      duration: 1500,
    })
    onBackToMenu()
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
            />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some delicious items from our menu</p>
        <Button onClick={handleBackToMenu} className="bg-gray-900 hover:bg-gray-800 text-white">
          Browse Menu
        </Button>
      </div>
    </div>
  )
}