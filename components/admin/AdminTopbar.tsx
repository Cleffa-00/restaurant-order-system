"use client"

import type React from "react"

import { Button } from "@/components/ui/forms/button"
import { Eye, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AdminTopbarProps {
  rightContent?: React.ReactNode
  isPreviewMode?: boolean
  onTogglePreview?: () => void
}

export function AdminTopbar({ rightContent, isPreviewMode, onTogglePreview }: AdminTopbarProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between min-h-[64px]">
        {/* Left side navigation */}
        <nav className="flex items-center gap-1">
          <Link href="/admin/orders">
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 px-3 text-sm font-normal rounded-md transition-colors duration-200 ${
                pathname === "/admin/orders"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Orders
            </Button>
          </Link>
          <Link href="/admin/menu">
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 px-3 text-sm font-normal rounded-md transition-colors duration-200 ${
                pathname === "/admin/menu"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Menu
            </Button>
          </Link>
          <Link href="/admin/revenue">
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 px-3 text-sm font-normal rounded-md transition-colors duration-200 ${
                pathname === "/admin/revenue"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Revenue
            </Button>
          </Link>
        </nav>

        {/* Right side content */}
        <div className="flex items-center gap-3">
          {rightContent}

          {/* Preview Toggle */}
          {onTogglePreview && (
            <Button
              variant={isPreviewMode ? "default" : "outline"}
              size="sm"
              onClick={onTogglePreview}
              className={`h-9 px-3 text-sm rounded-md transition-colors duration-200 ${
                isPreviewMode
                  ? "bg-black text-white hover:bg-gray-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {isPreviewMode ? (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Mode
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
