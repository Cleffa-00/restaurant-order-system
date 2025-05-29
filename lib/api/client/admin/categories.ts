// lib/api/admin/categories.ts
import { AdminCategory } from '@/types/admin'
import { CreateCategoryRequest, UpdateCategoryRequest } from '@/types'
import { apiClient } from '@/lib/api/utils/client'

export async function getCategories(): Promise<AdminCategory[]> {
  try {
    const result = await apiClient.get<AdminCategory[]>('/api/v1/admin/categories')
    return result.data || []
  } catch (error) {
    throw new Error('Failed to fetch categories')
  }
}

export async function createCategory(data: CreateCategoryRequest): Promise<AdminCategory> {
  try {
    const result = await apiClient.post<AdminCategory>('/api/v1/admin/categories', data)
    if (!result.data) throw new Error('No data returned from server')
    return result.data
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create category')
  }
}

export async function updateCategory(id: string, data: UpdateCategoryRequest): Promise<AdminCategory> {
  try {
    const result = await apiClient.put<AdminCategory>(`/api/v1/admin/categories/${id}`, data)
    if (!result.data) throw new Error('No data returned from server')
    return result.data
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update category')
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await apiClient.delete(`/api/v1/admin/categories/${id}`)
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete category')
  }
}

export async function reorderCategories(categoryIds: string[]): Promise<void> {
  try {
    await apiClient.post('/api/v1/admin/categories/reorder', { categoryIds })
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to reorder categories')
  }
}