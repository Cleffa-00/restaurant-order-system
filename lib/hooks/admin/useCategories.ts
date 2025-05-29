// lib/hooks/admin/useCategories.ts
import { useState, useEffect } from 'react'
import { AdminCategory } from '@/types/admin'
import { CreateCategoryRequest, UpdateCategoryRequest } from '@/types'
import * as categoriesApi from '@/lib/api/client/admin/categories'


export function useCategories() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await categoriesApi.getCategories()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    } finally {
      setIsLoading(false)
    }
  }

  const createCategory = async (data: CreateCategoryRequest) => {
    try {
      const newCategory = await categoriesApi.createCategory(data)
      setCategories(prev => [...prev, newCategory])
      return newCategory
    } catch (err) {
      throw err
    }
  }

  const updateCategory = async (id: string, data: UpdateCategoryRequest) => {
    try {
      const updatedCategory = await categoriesApi.updateCategory(id, data)
      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat))
      return updatedCategory
    } catch (err) {
      throw err
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      await categoriesApi.deleteCategory(id)
      setCategories(prev => prev.filter(cat => cat.id !== id))
    } catch (err) {
      throw err
    }
  }

  const reorderCategories = async (categoryIds: string[]) => {
    try {
      await categoriesApi.reorderCategories(categoryIds)
      await fetchCategories() // 重新获取排序后的数据
    } catch (err) {
      throw err
    }
  }

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  }
}