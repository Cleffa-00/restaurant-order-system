"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus } from "lucide-react"
import { ConfirmDeleteModal } from "./ConfirmDeleteModal"
import { OptionGroupPanel } from "./OptionGroupPanel"
import { AddOptionGroupModal } from "./AddOptionGroupModal"
import { EditOptionGroupModal } from "./EditOptionGroupModal"
import type { AdminMenuItem } from "@/types/admin"

interface EditMenuItemModalProps {
  item: AdminMenuItem | null
  isOpen: boolean
  onClose: () => void
  onSave: (itemId: string, updates: { 
    name: string; 
    price: number; 
    description: string; 
    image?: string; 
    available?: boolean; 
    optionGroups?: any[] 
  }) => void
}

export function EditMenuItemModal({
  item,
  isOpen,
  onClose,
  onSave,
}: EditMenuItemModalProps) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [available, setAvailable] = useState(true)
  const [optionGroups, setOptionGroups] = useState<any[]>([])
  
  // Modal states
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [addGroupOpen, setAddGroupOpen] = useState(false)
  const [editGroupOpen, setEditGroupOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<any>(null)

  // Validation
  const [errors, setErrors] = useState({ name: false, price: false })

  useEffect(() => {
    if (item && isOpen) {
      setName(item.name || "")
      setPrice(item.price ? item.price.toString() : "")
      setDescription(item.description || "")
      setImage(item.imageUrl || "")
      setAvailable(item.available !== false)
      setOptionGroups(item.optionGroups || [])
      
      // Reset validation
      setErrors({ name: false, price: false })
    }
  }, [item, isOpen])

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
    setConfirmOpen(false)
    setAddGroupOpen(false)
    setEditGroupOpen(false)
    setEditingGroup(null)
    onClose()
  }

  const handleSaveClick = () => {
    if (!validateForm()) {
      return
    }
    setConfirmOpen(true)
  }

  const handleConfirmSave = () => {
    if (!item) return
    
    // 🔥 准备完整的更新数据，包括本地暂存的选项组
    const updates = {
      name: name.trim(),
      price: Number.parseFloat(price),
      description: description.trim(),
      image: image.trim(),
      available: available,
      optionGroups: optionGroups // 🔥 包含所有本地暂存的选项组数据
    }
    
    onSave(item.id, updates)
    setConfirmOpen(false)
    handleClose()
  }

  const handleEditGroup = (group: any) => { 
    setEditingGroup(group)
    setEditGroupOpen(true)
  }

  const handleUpdateGroup = (updatedGroup: any) => {
    
    setOptionGroups((prev) => {
      const updated = prev.map((group) => {
        return group.id === updatedGroup.id ? updatedGroup : group
      })
      return updated
    })
    
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

  if (!item) return null

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
              Edit Menu Item
              {/* 调试信息 */}
              <div className="text-xs text-gray-500 mt-1">
                Option Groups: {optionGroups.length} | Item ID: {item.id}
              </div>
            </DialogTitle>
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
                <Button 
                  onClick={() => setAddGroupOpen(true)} 
                  size="sm" 
                  className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Group
                </Button>
              </div>
              <ScrollArea className="max-h-[300px] pr-4">
                {optionGroups.length > 0 ? (
                  optionGroups.map((group) => (
                    <OptionGroupPanel
                      key={group.id}
                      itemId={item.id}
                      optionGroup={group}
                      onUpdate={() => {}}
                      onDelete={() => handleDeleteGroup(group.id)}
                      onEdit={() => handleEditGroup(group)}
                      isCreateMode={false}
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
              onClick={handleSaveClick}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        isOpen={confirmOpen}
        title="Save Changes"
        description={`Are you sure you want to save the changes to this menu item? This will update ${optionGroups.length} option group(s).`}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        confirmText="Save All Changes"
        confirmButtonClass="bg-black hover:bg-gray-800 text-white"
      />

      <AddOptionGroupModal
        itemId={item.id}
        isOpen={addGroupOpen}
        onClose={() => setAddGroupOpen(false)}
        onAdd={handleAddGroup}
      />

      {/* Edit Option Group Modal */}
      {editGroupOpen && editingGroup && (
        <EditOptionGroupModal
          itemId={item.id}
          optionGroup={editingGroup}
          isOpen={editGroupOpen}
          onClose={() => {
            setEditGroupOpen(false)
            setEditingGroup(null)
          }}
          onSave={(updatedGroup) => {
            handleUpdateGroup(updatedGroup)
          }} // 🔥 明确的函数调用
          isCreateMode={false}
        />
      )}
    </>
  )
}