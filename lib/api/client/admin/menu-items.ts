// lib/api/client/admin/menu-items.ts
import { AdminMenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from '@/types/admin'
import { apiClient } from '@/lib/api/utils/client'

export async function getMenuItems(categoryId?: string): Promise<AdminMenuItem[]> {
  try {
    const url = categoryId ? `/api/v1/admin/menu-items?categoryId=${categoryId}` : '/api/v1/admin/menu-items'
    const result = await apiClient.get<AdminMenuItem[]>(url)
    
    return result.data || []
  } catch (error) {
    throw new Error('Failed to fetch menu items')
  }
}

export async function getMenuItem(id: string): Promise<AdminMenuItem> {
  try {
    const result = await apiClient.get<AdminMenuItem>(`/api/v1/admin/menu-items/${id}`)
    
    if (!result.data) throw new Error('No data returned from server')
    return result.data
  } catch (error) {
    throw new Error('Failed to fetch menu item')
  }
}

export async function createMenuItem(data: CreateMenuItemRequest): Promise<AdminMenuItem> {
  try {
    const result = await apiClient.post<AdminMenuItem>('/api/v1/admin/menu-items', data)
    if (!result.data) throw new Error('No data returned from server')
    return result.data
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create menu item')
  }
}

export async function updateMenuItem(id: string, data: UpdateMenuItemRequest): Promise<AdminMenuItem> {
  try {
    const result = await apiClient.put<AdminMenuItem>(`/api/v1/admin/menu-items/${id}`, data)
    if (!result.data) throw new Error('No data returned from server')
    return result.data
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update menu item')
  }
}

export async function deleteMenuItem(id: string): Promise<void> {
  try {
    await apiClient.delete(`/api/v1/admin/menu-items/${id}`)
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete menu item')
  }
}