"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/forms/button"

interface CartHeaderProps {
  onBack?: () => void
}

export function CartHeader({ onBack }: CartHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      // 默认行为：智能导航到菜单
      if (typeof window !== 'undefined') {
        const referrer = document.referrer
        const currentOrigin = window.location.origin
        const isFromSameSite = referrer.startsWith(currentOrigin)
        const isFromMenu = referrer.includes('/menu')
        
        if (window.history.length > 1 && isFromSameSite && isFromMenu) {
          window.history.back()
        } else {
          window.location.href = '/menu'
        }
      }
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center h-16 px-4">
        <Button variant="ghost" className="flex items-center gap-2" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
          <span className="text-base font-medium">Back</span>
        </Button>
      </div>
    </header>
  )
}