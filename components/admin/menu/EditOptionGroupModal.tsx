"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2, Plus } from "lucide-react"
import type { AdminOptionGroup } from "@/types/admin"
import { ConfirmDeleteModal } from "./ConfirmDeleteModal"

interface OptionInput {
  id: string
  name: string
  priceDelta: string
}

interface EditOptionGroupModalProps {
  itemId: string
  optionGroup: AdminOptionGroup | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedGroup: AdminOptionGroup) => void // 🔥 简化：只传递更新后的组数据
  isCreateMode?: boolean
}

export function EditOptionGroupModal({
  itemId,
  optionGroup,
  isOpen,
  onClose,
  onSave,
  isCreateMode = false,
}: EditOptionGroupModalProps) {
  const [groupName, setGroupName] = useState("")
  const [required, setRequired] = useState(false)
  const [options, setOptions] = useState<OptionInput[]>([])
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  // Validation state
  const [nameError, setNameError] = useState<string | null>(null)
  const [optionErrors, setOptionErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (optionGroup && isOpen) {
      setGroupName(optionGroup.name || "")
      setRequired(optionGroup.required || false)

      // 处理选项数据
      const optionInputs = optionGroup.options?.map((option) => {
        return {
          id: option.id,
          name: option.name || "",
          priceDelta: (Number(option.priceDelta) || 0).toString(),
        }
      }) || []

      // 如果没有选项，至少提供一个空的选项模板
      setOptions(optionInputs.length > 0 ? optionInputs : [{ 
        id: `temp-${Date.now()}`, // 🔥 使用临时 ID
        name: "", 
        priceDelta: "0" 
      }])
      
      // 重置验证状态
      setNameError(null)
      setOptionErrors(new Set())
    }
  }, [optionGroup, isOpen])

  const addOption = () => {
    const newOption: OptionInput = {
      id: `temp-${Date.now()}`, // 🔥 使用临时 ID
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

  const formatPrice = (priceDelta: string) => {
    const price = Number.parseFloat(priceDelta) || 0
    if (price === 0) return "Free"
    return price > 0 ? `+${price.toFixed(2)}` : `-${Math.abs(price).toFixed(2)}`
  }

  const validateForm = () => {
    let isValid = true
    setNameError(null)
    const newOptionErrors = new Set<string>()

    if (!groupName.trim()) {
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

  const handleGroupNameChange = (value: string) => {
    setGroupName(value)
    if (value.trim() && nameError) {
      setNameError(null)
    }
  }

  const handleOptionNameChange = (id: string, value: string) => {
    updateOption(id, "name", value)
    if (value.trim() && optionErrors.has(id)) {
      const newErrors = new Set(optionErrors)
      newErrors.delete(id)
      setOptionErrors(newErrors)
    }
  }

  const handleSaveClick = () => {
    if (!validateForm()) {
      return
    }
    setShowSaveConfirm(true)
  }

  const handleConfirmSave = () => {
    if (!optionGroup) return

    // 🔥 构建本地更新的选项组数据
    const updatedOptions = options.map((option) => ({
      id: option.id.startsWith('temp-') ? `local-${Date.now()}-${Math.random()}` : option.id, // 生成本地 ID
      name: option.name.trim(),
      priceDelta: Number.parseFloat(option.priceDelta) || 0,
      optionGroupId: optionGroup.id,
      deleted: false,
    }))

    const updatedGroup: AdminOptionGroup = {
      ...optionGroup,
      id: optionGroup.id, // 🔥 保持原始 ID 不变
      name: groupName.trim(),
      required,
      options: updatedOptions,
    }
    
    // 🔥 关键：只做本地保存，不调用 API
    onSave(updatedGroup)
    setShowSaveConfirm(false)
    onClose()
  }

  const handleClose = () => {
    setNameError(null)
    setOptionErrors(new Set())
    onClose()
  }

  if (!optionGroup) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Edit Option Group
              <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Local Edit
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="group-name" className="text-sm font-medium text-gray-700">
                  Group Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="group-name"
                  value={groupName || ""}
                  onChange={(e) => handleGroupNameChange(e.target.value)}
                  placeholder="e.g. Spice Level"
                  className={`w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                    nameError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {nameError && <p className="mt-1 text-red-500 text-sm">{nameError}</p>}
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="required"
                  checked={required}
                  onCheckedChange={setRequired}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200"
                />
                <Label htmlFor="required" className="text-sm font-medium text-gray-700">
                  Required selection
                </Label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium text-gray-900">Options</Label>
                <Button
                  onClick={addOption}
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-4">
                {options.map((option, index) => (
                  <Card key={option.id} className="border border-gray-100 shadow-none rounded-xl">
                    <CardContent className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`option-name-${option.id}`} className="text-sm font-medium text-gray-700">
                            Option Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`option-name-${option.id}`}
                            value={option.name || ""}
                            onChange={(e) => handleOptionNameChange(option.id, e.target.value)}
                            placeholder="e.g. Extra Egg"
                            className={`w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
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
                          <Label htmlFor={`option-price-${option.id}`} className="text-sm font-medium text-gray-700">
                            Price Delta ($)
                            <span className="ml-2 text-sm text-gray-500">{formatPrice(option.priceDelta)}</span>
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id={`option-price-${option.id}`}
                              type="number"
                              step="0.01"
                              value={option.priceDelta || "0"}
                              onChange={(e) => updateOption(option.id, "priceDelta", e.target.value)}
                              placeholder="0.00"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                            {options.length > 1 && (
                              <Button
                                onClick={() => removeOption(option.id)}
                                size="sm"
                                variant="ghost"
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-10 w-10 p-0 rounded-xl transition-all duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
            >
              Save Locally ({options.length} option{options.length !== 1 ? "s" : ""})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        isOpen={showSaveConfirm}
        title="Save Changes Locally"
        description="Save these changes to the option group? Changes will be applied when you save the menu item."
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleConfirmSave}
        confirmText="Save Locally"
        confirmButtonClass="bg-blue-600 hover:bg-blue-700 text-white"
      />
    </>
  )
}