"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"
import { optionGroupTemplates } from "@/types/admin"

interface AddOptionGroupModalProps {
  itemId: string
  isOpen: boolean
  onClose: () => void
  onAdd: (optionGroup: any) => void
}

interface OptionInput {
  id: string
  optionName: string
  priceDelta: string
}

// 定义模板类型
interface OptionGroupTemplate {
  id: string
  name: string
  required: boolean
  options: Array<{
    name: string
    priceDelta: number
  }>
}

export function AddOptionGroupModal({ itemId, isOpen, onClose, onAdd }: AddOptionGroupModalProps) {
  const [activeTab, setActiveTab] = useState("custom")
  const [customName, setCustomName] = useState("")
  const [customRequired, setCustomRequired] = useState(false)
  const [options, setOptions] = useState<OptionInput[]>([{ id: "1", optionName: "", priceDelta: "0" }])
  const [nameError, setNameError] = useState<string | null>(null)
  const [optionErrors, setOptionErrors] = useState<Set<string>>(new Set())

  const addOption = () => {
    const newOption: OptionInput = {
      id: Date.now().toString(),
      optionName: "",
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

  const updateOption = (id: string, field: keyof Omit<OptionInput, "id">, value: string) => {
    setOptions(options.map((option) => (option.id === id ? { ...option, [field]: value } : option)))

    // Clear error for this option if name is being updated and is now valid
    if (field === "optionName" && value.trim()) {
      const newErrors = new Set(optionErrors)
      newErrors.delete(id)
      setOptionErrors(newErrors)
    }
  }

  const validateForm = () => {
    let isValid = true
    setNameError(null)
    const newOptionErrors = new Set<string>()

    if (!customName.trim()) {
      setNameError("Please enter a group name")
      isValid = false
    }

    for (const option of options) {
      if (!option.optionName.trim()) {
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

  const handleAddCustomGroup = () => {
    if (!validateForm()) {
      return
    }

    const newOptionGroup = {
      id: `temp-${Date.now()}`,
      name: customName.trim(),
      required: customRequired,
      // 移除了 multiSelect 和 maxSelections
      options: options.map((option: OptionInput) => ({
        id: `temp-option-${Date.now()}-${Math.random()}`,
        name: option.optionName.trim(),
        priceDelta: Number.parseFloat(option.priceDelta),
        // 移除了 available 字段
      })),
    }

    onAdd(newOptionGroup)
    handleClose()
  }

  const handleAddTemplate = (template: OptionGroupTemplate) => {
    const newOptionGroup = {
      id: `temp-${Date.now()}`,
      name: template.name,
      required: template.required,
      // 移除了 multiSelect 和 maxSelections 的引用
      options: template.options.map((option: any, index: number) => ({
        id: `temp-option-${Date.now()}-${index}`,
        name: option.name,
        priceDelta: option.priceDelta,
        // 移除了 available 字段
      })),
    }

    onAdd(newOptionGroup)
    handleClose()
  }

  const handleClose = () => {
    onClose()
    setCustomName("")
    setCustomRequired(false)
    setOptions([{ id: "1", optionName: "", priceDelta: "0" }])
    setActiveTab("custom")
    setNameError(null)
    setOptionErrors(new Set())
  }

  const formatPriceDelta = (priceDelta: string) => {
    const value = Number.parseFloat(priceDelta)
    if (isNaN(value)) return ""
    if (value === 0) return "Free"
    return value > 0 ? `+$${value.toFixed(2)}` : `-$${Math.abs(value).toFixed(2)}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold text-gray-900">Add Option Group</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2 w-full bg-gray-50 rounded-xl p-1">
            <TabsTrigger value="custom" className="text-sm font-medium rounded-lg data-[state=active]:bg-white">
              Custom Group
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-sm font-medium rounded-lg data-[state=active]:bg-white">
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="custom" className="space-y-6 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-name" className="text-sm font-medium text-gray-700">
                  Group Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="custom-name"
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value)
                    if (e.target.value.trim() && nameError) {
                      setNameError(null)
                    }
                  }}
                  placeholder="e.g., Size, Spice Level, Add-ons"
                  className={`rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-black focus:border-black ${
                    nameError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {nameError && <p className="mt-1 text-red-500 text-sm">{nameError}</p>}
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="custom-required"
                  checked={customRequired}
                  onCheckedChange={setCustomRequired}
                  className="scale-90 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                />
                <Label htmlFor="custom-required" className="text-sm font-medium text-gray-700">
                  Required selection
                </Label>
              </div>
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
                                value={option.optionName}
                                onChange={(e) => updateOption(option.id, "optionName", e.target.value)}
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

            <DialogFooter className="flex justify-end items-center gap-3 mt-6 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCustomGroup}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
              >
                Create Group ({options.length} option{options.length !== 1 ? "s" : ""})
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-4">
              {optionGroupTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200 shadow-none"
                  onClick={() => handleAddTemplate(template)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-gray-900">{template.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {template.required ? "Required" : "Optional"}
                      {/* 移除了 multiSelect 和 maxSelections 的显示 */}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm text-gray-500">
                      {template.options.length} options: {template.options.map((opt: any) => opt.name).join(", ")}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <DialogFooter className="flex justify-end items-center gap-3 mt-6 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium transition-all"
              >
                Cancel
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}