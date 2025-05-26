"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Trash2, Plus } from "lucide-react"
import type { AdminOptionGroup } from "@/lib/mock-data/admin-menu"
import { updateOptionGroup } from "@/lib/mock-data/admin-menu"

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
  onSave: (updatedGroup?: AdminOptionGroup) => void
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
  const [isGroupNameValid, setIsGroupNameValid] = useState(true)
  const [invalidOptionIndexes, setInvalidOptionIndexes] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (optionGroup) {
      setGroupName(optionGroup.name || "")
      setRequired(optionGroup.required || false)

      const optionInputs =
        optionGroup.options?.map((option) => ({
          id: option.id || crypto.randomUUID(),
          name: option.name || "",
          priceDelta: (option.priceDelta ?? 0).toString(),
        })) || []

      setOptions(optionInputs.length > 0 ? optionInputs : [{ id: crypto.randomUUID(), name: "", priceDelta: "0" }])
    } else {
      setGroupName("")
      setRequired(false)
      setOptions([{ id: crypto.randomUUID(), name: "", priceDelta: "0" }])
    }
  }, [optionGroup])

  const addOption = () => {
    setOptions([...options, { id: crypto.randomUUID(), name: "", priceDelta: "0" }])
  }

  const removeOption = (id: string) => {
    if (options.length > 1) {
      setOptions(options.filter((option) => option.id !== id))
      const newInvalidIndexes = new Set(invalidOptionIndexes)
      newInvalidIndexes.delete(id)
      setInvalidOptionIndexes(newInvalidIndexes)
    }
  }

  const updateOption = (id: string, field: keyof OptionInput, value: string) => {
    setOptions(options.map((option) => (option.id === id ? { ...option, [field]: value } : option)))
  }

  const formatPrice = (priceDelta: string) => {
    const price = Number.parseFloat(priceDelta) || 0
    if (price === 0) return "Free"
    return price > 0 ? `+$${price.toFixed(2)}` : `-$${Math.abs(price).toFixed(2)}`
  }

  const validateForm = () => {
    let isValid = true
    const newInvalidIndexes = new Set<string>()

    if (!groupName.trim()) {
      setIsGroupNameValid(false)
      isValid = false
    }

    options.forEach((option) => {
      if (!option.name.trim()) {
        newInvalidIndexes.add(option.id)
        isValid = false
      }
    })

    setInvalidOptionIndexes(newInvalidIndexes)
    return isValid
  }

  const handleGroupNameChange = (value: string) => {
    setGroupName(value)
    if (value.trim() && !isGroupNameValid) {
      setIsGroupNameValid(true)
    }
  }

  const handleOptionNameChange = (id: string, value: string) => {
    updateOption(id, "name", value)
    if (value.trim() && invalidOptionIndexes.has(id)) {
      const newInvalidIndexes = new Set(invalidOptionIndexes)
      newInvalidIndexes.delete(id)
      setInvalidOptionIndexes(newInvalidIndexes)
    }
  }

  const handleSave = () => {
    if (!validateForm() || !optionGroup) return

    const updatedOptions = options.map((option) => ({
      id: option.id,
      name: option.name.trim(),
      priceDelta: Number.parseFloat(option.priceDelta) || 0,
      available: true,
    }))

    const updatedGroup: AdminOptionGroup = {
      ...optionGroup,
      name: groupName.trim(),
      required,
      multiSelect: false,
      maxSelections: undefined,
      options: updatedOptions,
    }

    if (isCreateMode) {
      // 🟢 创建模式：只更新本地状态，不保存到数据库
      console.log("🟢 [EditOptionGroupModal] CREATE MODE: 只更新本地状态，不调用数据库")
      console.log("🟢 [EditOptionGroupModal] 更新的组:", updatedGroup)
      onSave(updatedGroup)
    } else {
      // 🔴 编辑模式：直接保存到数据库
      console.log("🔴 [EditOptionGroupModal] EDIT MODE: 直接保存到数据库")
      console.log("🔴 [EditOptionGroupModal] 调用 updateOptionGroup:", {
        itemId,
        groupId: optionGroup.id,
        updatedGroup,
      })
      updateOptionGroup(itemId, optionGroup.id, updatedGroup)
      onSave()
    }

    onClose()
  }

  const handleClose = () => {
    onClose()
    setIsGroupNameValid(true)
    setInvalidOptionIndexes(new Set())
  }

  if (!optionGroup) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Edit Option Group
            {isCreateMode && (
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Local Edit</span>
            )}
            {!isCreateMode && (
              <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Database Edit</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
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
                  !isGroupNameValid ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                }`}
              />
              {!isGroupNameValid && <p className="mt-1 text-red-500 text-sm">Group name is required</p>}
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
                            invalidOptionIndexes.has(option.id)
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }`}
                        />
                        {invalidOptionIndexes.has(option.id) && (
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

        <DialogFooter className="mt-6 pt-4 border-t border-gray-100 gap-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="rounded-xl px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-black text-white hover:bg-gray-800 rounded-xl px-6 py-3 transition-all duration-200 shadow-sm"
          >
            {isCreateMode ? "Update Locally" : "Save to Database"} ({options.length} option
            {options.length !== 1 ? "s" : ""})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
