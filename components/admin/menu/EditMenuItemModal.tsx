"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus } from "lucide-react"
import type { AdminMenuItem, AdminOptionGroup } from "@/lib/mock-data/admin-menu"
import { OptionGroupPanel } from "./OptionGroupPanel"
import { AddOptionGroupModal } from "./AddOptionGroupModal"
import { EditOptionGroupModal } from "./EditOptionGroupModal"
import { Switch } from "@/components/ui/switch"
import { ConfirmDeleteModal } from "./ConfirmDeleteModal"
import { updateOptionGroup } from "@/lib/mock-data/admin-menu"

interface EditMenuItemModalProps {
  item: AdminMenuItem | null
  isOpen: boolean
  onClose: () => void
  onSave: (itemId: string, updates: { name: string; price: number; description: string }) => void
  mode?: "create" | "edit"
  categoryId?: string
  categoryName?: string
  onCreate?: (itemData: {
    name: string
    description: string
    price: number
    image: string
    available: boolean
    optionGroups: any[]
  }) => void
}

export function EditMenuItemModal({
  item,
  isOpen,
  onClose,
  onSave,
  mode = "edit",
  categoryId,
  categoryName,
  onCreate,
}: EditMenuItemModalProps) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [available, setAvailable] = useState(true)
  const [optionGroups, setOptionGroups] = useState<AdminOptionGroup[]>([])
  const [showAddOptionGroup, setShowAddOptionGroup] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  // 编辑 option group 相关状态
  const [editingOptionGroup, setEditingOptionGroup] = useState<AdminOptionGroup | null>(null)
  const [showEditOptionGroup, setShowEditOptionGroup] = useState(false)

  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    name: boolean
    price: boolean
  }>({
    name: false,
    price: false,
  })

  const resetForm = () => {
    setName("")
    setPrice("")
    setDescription("")
    setImage("")
    setAvailable(true)
    setOptionGroups([])
    setShowAddOptionGroup(false)
    setEditingOptionGroup(null)
    setShowEditOptionGroup(false)
    setValidationErrors({ name: false, price: false })
  }

  useEffect(() => {
    if (mode === "edit" && item) {
      setName(item.name)
      setPrice(item.price.toString())
      setDescription(item.description)
      setImage(item.image || "")
      setAvailable(item.available)
      // 深拷贝 option groups 到本地 state
      setOptionGroups(JSON.parse(JSON.stringify(item.optionGroups || [])))
    } else if (mode === "create") {
      resetForm()
    }
  }, [item, mode, isOpen])

  const validateForm = () => {
    const errors = {
      name: !name.trim(),
      price: !price.trim() || isNaN(Number.parseFloat(price)) || Number.parseFloat(price) <= 0,
    }

    setValidationErrors(errors)
    return !errors.name && !errors.price
  }

  const handleSaveClick = () => {
    if (!validateForm()) {
      return
    }
    setShowSaveConfirm(true)
  }

  const handleConfirmSave = async () => {
    const priceValue = Number.parseFloat(price)

    if (mode === "create") {
      console.log("🟢 [EditMenuItemModal] CREATE MODE: 创建新菜单项")
      if (onCreate) {
        onCreate({
          name: name.trim(),
          description: description.trim(),
          price: priceValue,
          image: image.trim(),
          available,
          optionGroups: optionGroups,
        })
      }
    } else if (item) {
      console.log("🔴 [EditMenuItemModal] EDIT MODE: 开始批量保存")
      console.log("🔴 [EditMenuItemModal] 本地 optionGroups 状态:", optionGroups)

      // 先保存基本信息
      console.log("🔴 [EditMenuItemModal] 1. 保存基本信息")
      onSave(item.id, {
        name: name.trim(),
        price: priceValue,
        description: description.trim(),
      })

      // 然后保存所有 option groups 的更改
      console.log("🔴 [EditMenuItemModal] 2. 开始批量保存 option groups")
      for (const optionGroup of optionGroups) {
        console.log("🔴 [EditMenuItemModal] 保存 option group:", optionGroup)
        await updateOptionGroup(item.id, optionGroup.id, optionGroup)
      }
      console.log("🔴 [EditMenuItemModal] 3. 所有 option groups 保存完成")
    }

    setShowSaveConfirm(false)
    onClose()
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleAddOptionGroup = (newGroup: AdminOptionGroup) => {
    setOptionGroups((prev) => [...prev, newGroup])
    setShowAddOptionGroup(false)
  }

  const handleEditOptionGroup = (optionGroup: AdminOptionGroup) => {
    console.log("🟡 [EditMenuItemModal] 开始编辑 option group:", optionGroup)
    // 深拷贝要编辑的 option group，避免引用问题
    setEditingOptionGroup(JSON.parse(JSON.stringify(optionGroup)))
    setShowEditOptionGroup(true)
  }

  const handleEditOptionGroupSave = (updatedGroup?: AdminOptionGroup) => {
    console.log("🟡 [EditMenuItemModal] 编辑完成回调")
    console.log("🟡 [EditMenuItemModal] 更新的组:", updatedGroup)
    console.log("🟡 [EditMenuItemModal] 原始编辑组:", editingOptionGroup)

    // 🔥 关键修复：先关闭模态框，再更新状态
    setShowEditOptionGroup(false)
    setEditingOptionGroup(null)

    // 然后更新 optionGroups 状态
    if (updatedGroup && editingOptionGroup) {
      console.log("🟡 [EditMenuItemModal] 更新本地 optionGroups 状态")
      setOptionGroups((prev) => {
        const newGroups = prev.map((group) => (group.id === editingOptionGroup.id ? updatedGroup : group))
        console.log("🟡 [EditMenuItemModal] 新的 optionGroups:", newGroups)
        return newGroups
      })
    }
  }

  const handleEditOptionGroupClose = () => {
    console.log("🟡 [EditMenuItemModal] 取消编辑 option group")
    setShowEditOptionGroup(false)
    setEditingOptionGroup(null)
  }

  const handleDeleteOptionGroup = (optionGroupId: string) => {
    setOptionGroups((prev) => prev.filter((group) => group.id !== optionGroupId))
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {mode === "create" ? `Add Menu Item to ${categoryName}` : "Edit Menu Item"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid grid-cols-2 w-full bg-gray-50 rounded-xl p-1">
              <TabsTrigger value="basic" className="text-sm font-medium rounded-lg data-[state=active]:bg-white">
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="options" className="text-sm font-medium rounded-lg data-[state=active]:bg-white">
                Option Groups
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-4">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name" className="flex items-center text-sm font-medium text-gray-900 mb-2">
                    Name <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (e.target.value.trim() && validationErrors.name) {
                        setValidationErrors((prev) => ({ ...prev, name: false }))
                      }
                    }}
                    placeholder="Enter menu item name"
                    className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 ${
                      validationErrors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  {validationErrors.name && <p className="mt-2 text-red-500 text-sm">Name is required</p>}
                </div>

                <div>
                  <Label htmlFor="price" className="flex items-center text-sm font-medium text-gray-900 mb-2">
                    Price ($) <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value)
                      if (
                        e.target.value.trim() &&
                        !isNaN(Number.parseFloat(e.target.value)) &&
                        Number.parseFloat(e.target.value) > 0 &&
                        validationErrors.price
                      ) {
                        setValidationErrors((prev) => ({ ...prev, price: false }))
                      }
                    }}
                    placeholder="0.00"
                    className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 ${
                      validationErrors.price ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  {validationErrors.price && (
                    <p className="mt-2 text-red-500 text-sm">Price must be a positive number</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description" className="flex items-center text-sm font-medium text-gray-900 mb-2">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter menu item description"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none transition-all duration-200"
                  />
                </div>

                <div>
                  <Label htmlFor="image" className="flex items-center text-sm font-medium text-gray-900 mb-2">
                    Image URL (optional)
                  </Label>
                  <Input
                    id="image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <Label htmlFor="available" className="text-sm font-medium text-gray-900">
                    Available for ordering
                  </Label>
                  <Switch
                    id="available"
                    checked={available}
                    onCheckedChange={setAvailable}
                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="options" className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Option Groups</h3>
                <Button
                  onClick={() => setShowAddOptionGroup(true)}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Group
                </Button>
              </div>

              <ScrollArea className="max-h-[300px] pr-4">
                <div className="space-y-4">
                  {optionGroups.length > 0 ? (
                    optionGroups.map((group) => (
                      <OptionGroupPanel
                        key={group.id}
                        itemId={item?.id || "new-item"}
                        optionGroup={group}
                        onUpdate={() => {}}
                        onDelete={() => handleDeleteOptionGroup(group.id)}
                        onEdit={() => handleEditOptionGroup(group)}
                        isCreateMode={true}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-base mb-2">No option groups yet</p>
                      <p className="text-sm text-gray-400">Add option groups to allow customization</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end items-center gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              onClick={handleClose}
              className="border border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-6 py-2 rounded-md font-medium transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveClick}
              className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-full font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {mode === "create" ? "Create Menu Item" : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        isOpen={showSaveConfirm}
        title={mode === "create" ? "Create Menu Item" : "Save Changes"}
        description={
          mode === "create"
            ? "Are you sure you want to create this menu item?"
            : "Are you sure you want to save the changes to this menu item and all its option groups?"
        }
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleConfirmSave}
        confirmText={mode === "create" ? "Create" : "Save"}
        confirmButtonClass="bg-black hover:bg-gray-800 text-white"
      />

      <AddOptionGroupModal
        itemId={item?.id || "new-item"}
        isOpen={showAddOptionGroup}
        onClose={() => setShowAddOptionGroup(false)}
        onAdd={handleAddOptionGroup}
      />

      <EditOptionGroupModal
        itemId={item?.id || "new-item"}
        optionGroup={editingOptionGroup}
        isOpen={showEditOptionGroup}
        onClose={handleEditOptionGroupClose}
        onSave={handleEditOptionGroupSave}
        isCreateMode={true}
      />
    </>
  )
}
