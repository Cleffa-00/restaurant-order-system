"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CartHeaderProps {
  onBack: () => void
}

export function CartHeader({ onBack }: CartHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center h-16 px-4">
        <Button variant="ghost" className="flex items-center gap-2" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
          <span className="text-base font-medium">Back</span>
        </Button>
      </div>
    </header>
  )
}
