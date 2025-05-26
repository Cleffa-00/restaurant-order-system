"use client"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDeleteModalProps {
  isOpen: boolean
  title: string
  description: string
  onClose: () => void
  onConfirm: () => void
  confirmText?: string
  confirmButtonClass?: string
}

export function ConfirmDeleteModal({
  isOpen,
  title,
  description,
  onClose,
  onConfirm,
  confirmText = "Delete",
  confirmButtonClass = "bg-red-600 hover:bg-red-700 text-white",
}: ConfirmDeleteModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white border-0 shadow-xl rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold text-gray-900">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-base text-gray-600 leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className={`px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md ${confirmButtonClass}`}
          >
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
