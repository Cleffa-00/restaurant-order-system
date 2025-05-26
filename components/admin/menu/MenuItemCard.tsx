"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import type { AdminMenuItem } from "@/lib/mock-data/admin-menu"

interface MenuItemCardProps {
  item: AdminMenuItem
  onEdit: (item: AdminMenuItem) => void
  onDelete: (itemId: string) => void
  onToggleAvailable: (itemId: string, available: boolean) => void
}

export function MenuItemCard({ item, onEdit, onDelete, onToggleAvailable }: MenuItemCardProps) {
  return (
    <Card className="border border-gray-100 shadow-sm hover:shadow-lg rounded-xl transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
            {item.imageUrl ? (
              <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
            ) : (
              <div className="text-gray-400 text-xs text-center">No Image</div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1 mr-3">
                <h3 className="font-semibold text-gray-900 text-base truncate">{item.name}</h3>
                <p className="text-lg font-bold text-gray-900 mt-1">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(item)}
                  className="h-9 w-9 p-0 text-gray-500 hover:bg-gray-100 hover:shadow-sm transition-all rounded-full"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                  className="h-9 w-9 p-0 text-gray-500 hover:text-red-600 hover:bg-gray-100 hover:shadow-sm transition-all rounded-full"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={item.available}
                  onCheckedChange={(checked) => onToggleAvailable(item.id, checked)}
                  className="scale-90 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                />
                <span className="text-sm text-gray-600">Available</span>
              </div>
              <span
                className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                  item.available ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.available ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
