"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface CartTutorialProps {
  isVisible: boolean
  tutorialStep: "waiting" | "animating" | "complete"
}

export function CartTutorial({ isVisible, tutorialStep }: CartTutorialProps) {
  const { toast } = useToast()

  useEffect(() => {
    if (tutorialStep === "complete") {
      // Delay the toast slightly to allow the tutorial animation to finish
      const timeoutId = setTimeout(() => {
        toast({
          type: "success",
          message: "Great! You've learned how to delete items",
          duration: 3000,
        })
      }, 300)

      return () => clearTimeout(timeoutId)
    }
  }, [tutorialStep, toast])

  if (!isVisible) return null

  return (
    <div
      className={`bg-blue-50 border-b border-blue-200 px-4 py-3 transition-all duration-500 ease-out ${
        tutorialStep === "complete" ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-blue-600">👈</span>
          <span className="text-sm font-medium text-blue-800">Swipe left to delete an item</span>
        </div>
        {tutorialStep === "animating" && (
          <div className="ml-2 flex items-center gap-1">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
          </div>
        )}
      </div>
    </div>
  )
}