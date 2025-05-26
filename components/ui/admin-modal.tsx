"use client"

import type * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  size?: "compact" | "default" | "large"
  preventClose?: boolean
  className?: string
  children: React.ReactNode
}

export interface AdminModalBodyProps {
  className?: string
  children: React.ReactNode
}

export interface AdminModalFooterProps {
  className?: string
  children: React.ReactNode
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  description,
  size = "default",
  preventClose = false,
  className,
  children,
}: AdminModalProps) {
  const sizeClasses = {
    compact: "w-[95vw] max-w-md sm:w-full",
    default: "w-[95vw] max-w-lg sm:w-full",
    large: "w-[95vw] max-w-4xl sm:w-full",
  }

  const handleInteractOutside = (e: Event) => {
    if (preventClose) {
      e.preventDefault()
    }
  }

  const handleEscapeKeyDown = (e: KeyboardEvent) => {
    if (preventClose) {
      e.preventDefault()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={preventClose ? () => {} : onClose}>
      <DialogContent
        className={cn(sizeClasses[size], "max-h-[90vh] overflow-y-auto", className)}
        onInteractOutside={handleInteractOutside}
        onEscapeKeyDown={handleEscapeKeyDown}
      >
        <DialogHeader className="space-y-1.5 pb-2 sm:space-y-2 sm:pb-4">
          <DialogTitle className="text-base font-semibold sm:text-lg">{title}</DialogTitle>
          {description && <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>}
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  )
}

function AdminModalBody({ className, children }: AdminModalBodyProps) {
  return <div className={cn("space-y-3 py-2 sm:space-y-4 sm:py-4", className)}>{children}</div>
}

function AdminModalFooter({ className, children }: AdminModalFooterProps) {
  return (
    <DialogFooter className={cn("flex-col gap-2 pt-4 sm:flex-row sm:gap-3 sm:pt-6", className)}>
      {children}
    </DialogFooter>
  )
}

// Compound component pattern
AdminModal.Body = AdminModalBody
AdminModal.Footer = AdminModalFooter

// Default footer with cancel/save buttons
export interface AdminModalDefaultFooterProps {
  onCancel: () => void
  onSave: () => void
  saveText?: string
  cancelText?: string
  saveDisabled?: boolean
  saveLoading?: boolean
  className?: string
}

export function AdminModalDefaultFooter({
  onCancel,
  onSave,
  saveText = "Save",
  cancelText = "Cancel",
  saveDisabled = false,
  saveLoading = false,
  className,
}: AdminModalDefaultFooterProps) {
  return (
    <AdminModal.Footer className={className}>
      <Button variant="outline" onClick={onCancel} disabled={saveLoading} className="w-full sm:w-auto">
        {cancelText}
      </Button>
      <Button
        onClick={onSave}
        disabled={saveDisabled || saveLoading}
        className={cn("w-full sm:w-auto", saveLoading ? "opacity-50" : "")}
      >
        {saveLoading ? "Saving..." : saveText}
      </Button>
    </AdminModal.Footer>
  )
}

AdminModal.DefaultFooter = AdminModalDefaultFooter
