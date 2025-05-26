"use client"

import { Textarea } from "@/components/ui/textarea"

interface OrderNoteInputProps {
  value: string
  onChange: (value: string) => void
}

export function OrderNoteInput({ value, onChange }: OrderNoteInputProps) {
  return (
    <>
      <div className="px-4 pb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <label htmlFor="customer-note" className="block text-sm font-medium text-gray-900 mb-3">
            Order Instructions
          </label>
          <Textarea
            id="customer-note"
            placeholder="Any special instructions? (e.g. 'No onions' or 'Make it extra spicy')"
            value={value}
            onChange={(e) => onChange(e.target.value)}
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
