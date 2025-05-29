// 简化版 OptionGroupPanel - 只使用外部 onEdit 回调
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/forms/button"
import { Badge } from "@/components/ui/feedback/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/navigation/collapsible"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/feedback/alert-dialog"
import { ChevronDown, ChevronUp, Trash2, Settings, Plus } from "lucide-react"
import type { AdminOptionGroup } from "@/types/admin"

interface OptionGroupPanelProps {
  itemId: string
  optionGroup: AdminOptionGroup
  onUpdate: () => void
  onDelete: () => void
  onEdit: (optionGroup: AdminOptionGroup) => void // 🔥 必需的回调，不再可选
  isCreateMode?: boolean
}

export function OptionGroupPanel({
  itemId,
  optionGroup,
  onUpdate,
  onDelete,
  onEdit, // 🔥 直接使用，不再检查是否存在
  isCreateMode = false,
}: OptionGroupPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!optionGroup) {
    return null
  }

  const handleDeleteGroup = () => {
    onDelete() // 🔥 简化：统一使用 onDelete 回调
    setShowDeleteConfirm(false)
  }

  const formatPrice = (priceDelta: number) => {
    if (priceDelta === 0) return "Free"
    return priceDelta > 0 ? `+${priceDelta.toFixed(2)}` : `-${Math.abs(priceDelta).toFixed(2)}`
  }

  const getOptionPreview = () => {
    if (!optionGroup?.options || optionGroup?.options.length === 0) return "No options"

    const validOptions = optionGroup.options.filter((option) => option && option.name && option.name.trim())

    if (validOptions.length === 0) return "No valid options"

    const optionNames = validOptions.map((option) => option.name.trim()).slice(0, 3)
    const preview = optionNames.join(" / ")

    return validOptions.length > 3 ? `${preview} / ...` : preview
  }

  const handleEditClick = () => {
    onEdit(optionGroup) // 🔥 直接调用外部回调
  }

  return (
    <>
      <div className="border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="p-5 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto font-medium hover:bg-transparent">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="text-lg font-semibold text-gray-900">{optionGroup?.name}</span>
                  <Badge
                    variant={optionGroup?.required ? "default" : "secondary"}
                    className={`ml-2 text-xs font-medium px-3 py-1 rounded-full ${
                      optionGroup?.required ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {optionGroup?.required ? "Required" : "Optional"}
                  </Badge>
                </Button>
              </CollapsibleTrigger>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {optionGroup?.options?.length || 0} option{(optionGroup?.options?.length || 0) !== 1 ? "s" : ""}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditClick()
                  }}
                  className="h-9 px-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-all"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDeleteConfirm(true)
                  }}
                  className="h-9 w-9 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isOpen && optionGroup?.options && optionGroup?.options.length > 0 && (
              <div className="text-sm mt-2">
                <span className="text-gray-500">Options: </span>
                <span className="text-gray-700">{getOptionPreview()}</span>
              </div>
            )}
          </div>

          <CollapsibleContent>
            <div className="p-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-900">Options</h4>
                {optionGroup?.options && optionGroup?.options.length > 0 ? (
                  <div className="space-y-2">
                    {optionGroup.options.map((option) => (
                      <div key={option.id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-900">{option.name || "Unnamed Option"}</span>
                            <Badge
                              variant={option.priceDelta === 0 ? "secondary" : "outline"}
                              className={`text-xs font-medium px-3 py-1 rounded-full ${
                                option.priceDelta === 0 ? "bg-gray-100 text-gray-600" : "border-gray-300 text-gray-700"
                              }`}
                            >
                              {formatPrice(option.priceDelta)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-base font-medium mb-2 text-gray-700">No options in this group yet</p>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">Click "Edit" to add options to this group</p>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-white border-0 shadow-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-medium text-lg text-gray-900">Delete Option Group</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600">
              Are you sure you want to delete option group "{optionGroup?.name}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}