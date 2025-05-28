// lib/hooks/admin/useMenuItems.ts
import { useState, useEffect } from 'react'
import { AdminMenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from '@/types/admin'
import * as menuItemsApi from '@/lib/api/admin/menu-items'

// UpdateMenuItemRequest 现在已经包含了 optionGroups，不需要扩展类型

export function useMenuItems(categoryId?: string) {
  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (categoryId) {
      fetchMenuItems()
    } else {
      setMenuItems([])
      setIsLoading(false)
    }
  }, [categoryId])

  const fetchMenuItems = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await menuItemsApi.getMenuItems(categoryId)
      setMenuItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu items')
    } finally {
      setIsLoading(false)
    }
  }

  const createMenuItem = async (data: CreateMenuItemRequest) => {
    try {
      const newMenuItem = await menuItemsApi.createMenuItem(data)
      setMenuItems(prev => [...prev, newMenuItem])
      return newMenuItem
    } catch (err) {
      throw err
    }
  }

  const updateMenuItem = async (id: string, data: UpdateMenuItemRequest) => {
    try {
      
      const updatedMenuItem = await menuItemsApi.updateMenuItem(id, data)
      
      setMenuItems(prev => prev.map(item => item.id === id ? updatedMenuItem : item))
      return updatedMenuItem
    } catch (err) {
      throw err
    }
  }

  const deleteMenuItem = async (id: string) => {
    try {
      await menuItemsApi.deleteMenuItem(id)
      setMenuItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      throw err
    }
  }

  const toggleMenuItemAvailability = async (id: string, available: boolean) => {
    try {
      await updateMenuItem(id, { available })
    } catch (err) {
      throw err
    }
  }

  return {
    menuItems,
    isLoading,
    error,
    refetch: fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
  }
}