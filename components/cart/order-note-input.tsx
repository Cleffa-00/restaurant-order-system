"use client"

import { useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/forms/textarea"
import { useToast } from "@/hooks/use-toast"

interface OrderNoteInputProps {
  value: string
  onChange: (value: string) => void
}

export function OrderNoteInput({ value, onChange }: OrderNoteInputProps) {
  const { toast } = useToast()
  const previousValueRef = useRef(value)

  useEffect(() => {
    // Show toast when user adds or removes significant content
    if (previousValueRef.current.trim() === "" && value.trim().length > 10) {
      toast({
        type: "info",
        message: "Order instructions added",
        duration: 2000,
      })
    } else if (previousValueRef.current.trim().length > 10 && value.trim() === "") {
      toast({
        type: "info",
        message: "Order instructions cleared",
        duration: 2000,
      })
    }
    
    previousValueRef.current = value
  }, [value, toast])

  const handleChange = (newValue: string) => {
    // Limit to reasonable length
    if (newValue.length <= 500) {
      onChange(newValue)
    } else {
      toast({
        type: "error",
        message: "Text limit reached (500 characters max)",
        duration: 3000,
      })
    }
  }

  return (
    <>
      <div className="px-4 pb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="customer-note" className="block text-sm font-medium text-gray-900">
              Order Instructions
            </label>
            <span className="text-xs text-gray-400">
              {value.length}/500
            </span>
          </div>
          <Textarea
            id="customer-note"
            placeholder="Any special instructions? (e.g. 'No onions' or 'Make it extra spicy')"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full border-gray-200 focus:border-gray-300 focus:ring-gray-300 rounded-lg resize-none"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-2">These instructions will be sent to the kitchen with your order.</p>
        </div>
      </div>

      {/* Invisible placeholder to ensure textarea can scroll above bottom bar */}
      <div aria-hidden className="h-32" />
    </>
  )
}