"use client"

import { useState } from "react"
import { Button } from "@/components/ui/forms/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/feedback/dialog"

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  details?: string
  showRetry?: boolean
  onRetry?: () => void
}

export function ErrorModal({ 
  isOpen, 
  onClose, 
  title = "Order Failed",
  message,
  details,
  showRetry = false,
  onRetry
}: ErrorModalProps) {
  const [showDetails, setShowDetails] = useState(false)

  const handleClose = () => {
    setShowDetails(false)
    onClose()
  }

  const handleRetry = () => {
    setShowDetails(false)
    onRetry?.()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 [&>button]:hidden">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            {/* Error Icon */}
            <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">{title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-6 space-y-4">
          {/* Main Error Message */}
          <div className="text-gray-700 leading-relaxed">
            {message}
          </div>

          {/* Details Section */}
          {details && (
            <div className="space-y-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-1"
              >
                <span>{showDetails ? 'Hide' : 'Show'} details</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showDetails && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed">
                    {details}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end items-center gap-3 pt-6 border-t border-gray-100">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all"
          >
            Close
          </Button>
          {showRetry && (
            <Button
              onClick={handleRetry}
              className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
            >
              Try Again
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}