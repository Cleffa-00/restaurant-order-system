"use client"

import { useState } from "react"
import { Button } from "@/components/ui/forms/button"
import { Input } from "@/components/ui/forms/input"
import { Label } from "@/components/ui/forms/label"
import { Textarea } from "@/components/ui/forms/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/feedback/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs"
import { ScrollArea } from "@/components/ui/layout/scroll-area"
import { Plus } from "lucide-react"
import { Switch } from "@/components/ui/forms/switch"
import { ConfirmDeleteModal } from "./ConfirmDeleteModal"
import { AddOptionGroupModal } from "./AddOptionGroupModal"
import { OptionGroupPanel } from "./OptionGroupPanel"
import { EditOptionGroupModal } from "./EditOptionGroupModal"

interface CreateMenuItemModalProps {
  categoryId: string
  categoryName: string
  isOpen: boolean
  onClose: () => void
  onCreate: (itemData: any) => void
}

export function CreateMenuItemModal({ categoryName, isOpen, onClose, onCreate }: CreateMenuItemModalProps) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [available, setAvailable] = useState(true)
  const [optionGroups, setOptionGroups] = useState<any[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [addGroupOpen, setAddGroupOpen] = useState(false)
  const [editGroupOpen, setEditGroupOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<any>(null)

  const [errors, setErrors] = useState({ name: false, price: false })

  const validateForm = () => {
    const nameError = !name.trim()
    const priceVal = Number.parseFloat(price)
    const priceError = isNaN(priceVal) || priceVal <= 0
    setErrors({ name: nameError, price: priceError })
    return !(nameError || priceError)
  }

  const handleClose = () => {
    setName("")
    setPrice("")
    setDescription("")
    setImage("")
    setAvailable(true)
    setOptionGroups([])
    setErrors({ name: false, price: false })
    setAddGroupOpen(false)
    setEditGroupOpen(false)
    setEditingGroup(null)
    onClose()
  }

  const handleCreateClick = () => {
    if (!validateForm()) {
      return
    }
    setConfirmOpen(true)
  }

  const handleEditGroup = (group: any) => {
    setEditingGroup(group)
    setEditGroupOpen(true)
  }

  const handleUpdateGroup = (updatedGroup: any) => {
    setOptionGroups((prev) => prev.map((group) => (group.id === updatedGroup.id ? updatedGroup : group)))
    // 🔥 关闭编辑模态框
    setEditGroupOpen(false)
    setEditingGroup(null)
  }

  const handleDeleteGroup = (groupId: string) => {
    setOptionGroups((prev) => prev.filter((group) => group.id !== groupId))
  }

  const handleAddGroup = (newGroup: any) => {
    setOptionGroups((prev) => [...prev, newGroup])
    // 🔥 关闭添加模态框
    setAddGroupOpen(false)
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
            <DialogTitle className="text-xl font-semibold text-gray-900">Add Menu Item to {categoryName}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid grid-cols-2 w-full bg-gray-50 rounded-xl p-1">
              <TabsTrigger value="basic" className="text-sm font-medium rounded-lg data-[state=active]:bg-white">
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="options" className="text-sm font-medium rounded-lg data-[state=active]:bg-white">
                Option Groups ({optionGroups.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-4">
              <div>
                <div className="flex items-center gap-1 text-sm font-medium text-gray-900 mb-2">
                  <Label htmlFor="name">Name</Label>
                  <span className="text-red-500">*</span>
                </div>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter menu item name"
                  className="border-gray-300 rounded-md text-sm px-3 py-2 placeholder:text-gray-400"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">Name is required</p>}
              </div>

              <div>
                <div className="flex items-center gap-1 text-sm font-medium text-gray-900 mb-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <span className="text-red-500">*</span>
                </div>
                <Input
                  id="price"
                  value={price}
                  type="number"
                  step="0.01"
                  min="0"
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="border-gray-300 rounded-md text-sm px-3 py-2 placeholder:text-gray-400"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">Valid price required</p>}
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-900 mb-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter menu item description"
                  className="border-gray-300 rounded-md text-sm px-3 py-2 placeholder:text-gray-400 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image" className="text-sm font-medium text-gray-900 mb-2">
                  Image URL
                </Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="border-gray-300 rounded-md text-sm px-3 py-2 placeholder:text-gray-400"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="available" className="text-sm font-medium text-gray-900">
                  Available for ordering
                </Label>
                <Switch id="available" checked={available} onCheckedChange={setAvailable} />
              </div>
            </TabsContent>

            <TabsContent value="options" className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-gray-900">Option Groups</h3>
                <Button onClick={() => setAddGroupOpen(true)} size="sm" className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Group
                </Button>
              </div>
              <ScrollArea className="max-h-[300px] pr-4">
                {optionGroups.length > 0 ? (
                  optionGroups.map((group) => (
                    <OptionGroupPanel
                      key={group.id}
                      itemId="new-item"
                      optionGroup={group}
                      onUpdate={() => {}}
                      onDelete={() => handleDeleteGroup(group.id)}
                      onEdit={() => handleEditGroup(group)} // 🔥 传递编辑回调
                    />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-base mb-2">No option groups yet</p>
                    <p className="text-sm text-gray-400">Add option groups to allow customization</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end items-center gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateClick}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
            >
              Create Menu Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        isOpen={confirmOpen}
        title="Create Menu Item"
        description="Are you sure you want to create this menu item?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          onCreate({ name, price: Number.parseFloat(price), description, image, available, optionGroups })
          setConfirmOpen(false)
          handleClose()
        }}
        confirmText="Create"
        confirmButtonClass="bg-black hover:bg-gray-800 text-white"
      />

      <AddOptionGroupModal
        itemId="new-item"
        isOpen={addGroupOpen}
        onClose={() => setAddGroupOpen(false)}
        onAdd={handleAddGroup} // 🔥 使用新的处理函数
      />

      <EditOptionGroupModal
        itemId="new-item"
        optionGroup={editingGroup}
        isOpen={editGroupOpen}
        onClose={() => {
          setEditGroupOpen(false)
          setEditingGroup(null)
        }}
        onSave={handleUpdateGroup}
        isCreateMode={true}
      />
    </>
  )
}