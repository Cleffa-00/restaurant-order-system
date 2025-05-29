// lib/hooks/admin/useOptionGroups.ts
import { useState, useEffect } from 'react'
import { AdminOptionGroup, CreateOptionGroupRequest, UpdateOptionGroupRequest } from '@/types/admin'
import * as optionGroupsApi from '@/lib/api/client/admin/option-groups'

export function useOptionGroups(menuItemId?: string) {
  const [optionGroups, setOptionGroups] = useState<AdminOptionGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (menuItemId) {
      fetchOptionGroups()
    } else {
      setOptionGroups([])
    }
  }, [menuItemId])

  const fetchOptionGroups = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await optionGroupsApi.getOptionGroups(menuItemId)
      setOptionGroups(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch option groups')
    } finally {
      setIsLoading(false)
    }
  }

  const createOptionGroup = async (data: CreateOptionGroupRequest & { menuItemId: string }) => {
    try {
      const newOptionGroup = await optionGroupsApi.createOptionGroup(data)
      setOptionGroups(prev => [...prev, newOptionGroup])
      return newOptionGroup
    } catch (err) {
      throw err
    }
  }

  const updateOptionGroup = async (id: string, data: UpdateOptionGroupRequest) => {
    try {
      const updatedOptionGroup = await optionGroupsApi.updateOptionGroup(id, data)
      setOptionGroups(prev => prev.map(group => group.id === id ? updatedOptionGroup : group))
      return updatedOptionGroup
    } catch (err) {
      throw err
    }
  }

  const deleteOptionGroup = async (id: string) => {
    try {
      await optionGroupsApi.deleteOptionGroup(id)
      setOptionGroups(prev => prev.filter(group => group.id !== id))
    } catch (err) {
      throw err
    }
  }

  return {
    optionGroups,
    isLoading,
    error,
    refetch: fetchOptionGroups,
    createOptionGroup,
    updateOptionGroup,
    deleteOptionGroup,
  }
}