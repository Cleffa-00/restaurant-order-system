"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"


interface CheckoutHeaderProps {
  onBack?: () => void
}

export function CheckoutHeader({}: CheckoutHeaderProps) {
  const router = useRouter()
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer
      const currentOrigin = window.location.origin
      const isFromSameSite = referrer.startsWith(currentOrigin)
      
      // 检查是否来自购物车页面
      const isFromCart = referrer.includes('/cart')
      
      // 如果有合理的历史记录且来自购物车，使用 back()
      if (window.history.length > 1 && isFromSameSite && isFromCart) {
        router.back()
      } else {
        // 否则导航到购物车页面
        router.push('/cart')
      }
    } else {
      router.push('/cart')
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-lg font-semibold">Checkout</h1>
        <div className="w-16" /> {/* Spacer for centering */}
      </div>
    </div>
  )
}