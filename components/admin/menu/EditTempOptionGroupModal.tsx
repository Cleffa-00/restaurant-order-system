"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/forms/button"
import { Input } from "@/components/ui/forms/input"
import { Label } from "@/components/ui/forms/label"
import { Switch } from "@/components/ui/forms/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/feedback/dialog"
import { Card, CardContent } from "@/components/ui/layout/card"
import { Trash2, Plus } from "lucide-react"
import { ConfirmDeleteModal } from "./ConfirmDeleteModal"

interface EditTempOptionGroupModalProps {
  optionGroup: any | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedGroup: any) => void
  onDelete: () => void
}

interface OptionInput {
  id: string
  name: string
  priceDelta: string
}

export function EditTempOptionGroupModal({
  optionGroup,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EditTempOptionGroupModalProps) {
  const [name, setName] = useState("")
  const [required, setRequired] = useState(false)
  const [options, setOptions] = useState<OptionInput[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  // Validation state
  const [nameError, setNameError] = useState<string | null>(null)
  const [optionErrors, setOptionErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (optionGroup && isOpen) {
      setName(optionGroup.name || "")
      setRequired(optionGroup.required || false)
      // 移除了 multiSelect 和 maxSelections 的处理
      setOptions(
        optionGroup.options?.map((opt: any) => ({
          id: opt.id,
          name: opt.name,
          priceDelta: opt.priceDelta.toString(),
          // 移除了 available 字段的处理
        })) || [],
      )
    }
  }, [optionGroup, isOpen])

  const addOption = () => {
    const newOption: OptionInput = {
      id: `temp-option-${Date.now()}-${Math.random()}`,
      name: "",
      priceDelta: "0",
    }
    setOptions([...options, newOption])
  }

  const removeOption = (id: string) => {
    if (options.length > 1) {
      setOptions(options.filter((option) => option.id !== id))
      const newErrors = new Set(optionErrors)
      newErrors.delete(id)
      setOptionErrors(newErrors)
    }
  }

  const updateOption = (id: string, field: keyof OptionInput, value: string) => {
    setOptions(options.map((option) => (option.id === id ? { ...option, [field]: value } : option)))

    // Clear error for this option if name is being updated and is now valid
    if (field === "name" && value.trim()) {
      const newErrors = new Set(optionErrors)
      newErrors.delete(id)
      setOptionErrors(newErrors)
    }
  }

  const validateForm = () => {
    let isValid = true
    setNameError(null)
    const newOptionErrors = new Set<string>()

    if (!name.trim()) {
      setNameError("Please enter a group name")
      isValid = false
    }

    for (const option of options) {
      if (!option.name.trim()) {
        newOptionErrors.add(option.id)
        isValid = false
      }

      const priceDelta = Number.parseFloat(option.priceDelta)
      if (isNaN(priceDelta)) {
        isValid = false
      }
    }

    setOptionErrors(newOptionErrors)
    return isValid
  }

  const handleSaveClick = () => {
    if (!validateForm()) {
      return
    }
    setShowSaveConfirm(true)
  }

  const handleConfirmSave = () => {
    const updatedGroup = {
      ...optionGroup,
      name: name.trim(),
      required,
      // 移除了 multiSelect 和 maxSelections
      options: options.map((option) => ({
        id: option.id,
        name: option.name.trim(),
        priceDelta: Number.parseFloat(option.priceDelta),
        // 移除了 available 字段
      })),
    }

    onSave(updatedGroup)
    setShowSaveConfirm(false)
    onClose()
  }

  const handleClose = () => {
    setNameError(null)
    setOptionErrors(new Set())
    onClose()
  }

  const formatPriceDelta = (priceDelta: string) => {
    const value = Number.parseFloat(priceDelta)
    if (isNaN(value)) return ""
    if (value === 0) return "Free"
    return value > 0 ? `+$${value.toFixed(2)}` : `-$${Math.abs(value).toFixed(2)}`
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-semibold text-gray-900">Edit Option Group</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="group-name" className="text-sm font-medium text-gray-900 mb-2">
                  Group Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="group-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (e.target.value.trim() && nameError) {
                      setNameError(null)
                    }
                  }}
                  placeholder="e.g., Size, Spice Level, Add-ons"
                  className={`border-gray-300 rounded-md text-sm px-3 py-2 placeholder:text-gray-400 ${
                    nameError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {nameError && <p className="mt-1 text-red-500 text-sm">{nameError}</p>}
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="group-required" className="text-sm font-medium text-gray-900">
                  Required selection
                </Label>
                <Switch id="group-required" checked={required} onCheckedChange={setRequired} />
              </div>

              {/* 移除了 multiSelect 和 maxSelections 的 UI */}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium text-gray-900">Options</Label>
                <span className="text-sm text-gray-500">At least 1 option required</span>
              </div>

              <div className="space-y-4">
                {options.map((option, index) => (
                  <Card key={option.id} className="border border-gray-200 shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`option-name-${option.id}`} className="text-sm font-medium text-gray-700">
                                Option Name <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id={`option-name-${option.id}`}
                                value={option.name}
                                onChange={(e) => updateOption(option.id, "name", e.target.value)}
                                placeholder="e.g., Extra Egg, Large Size"
                                className={`rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-black focus:border-black ${
                                  optionErrors.has(option.id)
                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                    : ""
                                }`}
                              />
                              {optionErrors.has(option.id) && (
                                <p className="mt-1 text-red-500 text-sm">Option name is required</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor={`price-delta-${option.id}`} className="text-sm font-medium text-gray-700">
                                Price Delta
                              </Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  id={`price-delta-${option.id}`}
                                  type="number"
                                  step="0.01"
                                  min="-999"
                                  max="999"
                                  value={option.priceDelta}
                                  onChange={(e) => updateOption(option.id, "priceDelta", e.target.value)}
                                  placeholder="0.00"
                                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                                />
                                <span className="text-sm text-gray-500 min-w-[60px]">
                                  {formatPriceDelta(option.priceDelta)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* 移除了 available 开关 */}
                        </div>

                        {options.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(option.id)}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 mt-6"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl font-medium transition-all"
            >
              Delete Group
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveClick}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        title="Delete Option Group"
        description="Are you sure you want to delete this option group? This action cannot be undone."
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDelete()
          setShowDeleteConfirm(false)
          onClose()
        }}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />

      <ConfirmDeleteModal
        isOpen={showSaveConfirm}
        title="Save Changes"
        description="Are you sure you want to save the changes to this option group?"
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleConfirmSave}
        confirmText="Save"
        confirmButtonClass="bg-black hover:bg-gray-800 text-white"
      />
    </>
  )
}