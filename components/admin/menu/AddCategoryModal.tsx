"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (categoryData: { name: string; visible: boolean }) => void
}

export function AddCategoryModal({ isOpen, onClose, onSave }: AddCategoryModalProps) {
  const [name, setName] = useState("")
  const [visible, setVisible] = useState(true)
  const [nameError, setNameError] = useState<string | null>(null)

  const handleSave = () => {
    if (!name.trim()) {
      setNameError("Category name is required")
      return
    }

    onSave({ name: name.trim(), visible })
    setName("")
    setVisible(true)
    setNameError(null)
    onClose()
  }

  const handleClose = () => {
    setName("")
    setVisible(true)
    setNameError(null)
    onClose()
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (value.trim() && nameError) {
      setNameError(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 [&>button]:hidden">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold text-gray-900">Add New Category</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div>
            <label htmlFor="category-name" className="block text-sm font-medium text-gray-900 mb-1 flex items-center">
              Category Name <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter category name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              autoFocus
            />
            {nameError && <p className="mt-1 text-red-500 text-sm">{nameError}</p>}
          </div>

          <div className="flex items-center justify-between mt-6">
            <label htmlFor="category-visible" className="text-sm font-medium text-gray-900">
              Visible to customers
            </label>
            <Switch
              id="category-visible"
              checked={visible}
              onCheckedChange={setVisible}
              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end items-center gap-3 mt-8 pt-6 border-t border-gray-100">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
          >
            Add Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
