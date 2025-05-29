// lib/api/client/admin/option-groups.ts
import { AdminOptionGroup, CreateOptionGroupRequest, UpdateOptionGroupRequest } from '@/types/admin'
import { apiClient } from '@/lib/api/utils/client'

export async function getOptionGroups(menuItemId?: string): Promise<AdminOptionGroup[]> {
  try {
    const url = menuItemId ? `/api/v1/admin/option-groups?menuItemId=${menuItemId}` : '/api/v1/admin/option-groups'
    const result = await apiClient.get<AdminOptionGroup[]>(url)
    
    return result.data || []
  } catch (error) {
    throw new Error('Failed to fetch option groups')
  }
}

export async function getOptionGroup(id: string): Promise<AdminOptionGroup> {
  try {
    const result = await apiClient.get<AdminOptionGroup>(`/api/v1/admin/option-groups/${id}`)
    if (!result.data) throw new Error('No data returned from server')
    return result.data
  } catch (error) {
    throw new Error('Failed to fetch option group')
  }
}

export async function createOptionGroup(data: CreateOptionGroupRequest & { menuItemId: string }): Promise<AdminOptionGroup> {
  try {
    const result = await apiClient.post<AdminOptionGroup>('/api/v1/admin/option-groups', data)
    if (!result.data) throw new Error('No data returned from server')
    return result.data
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create option group')
  }
}

export async function updateOptionGroup(id: string, data: UpdateOptionGroupRequest): Promise<AdminOptionGroup> {
  try {
    const result = await apiClient.put<AdminOptionGroup>(`/api/v1/admin/option-groups/${id}`, data)
    if (!result.data) throw new Error('No data returned from server')
    return result.data
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update option group')
  }
}

export async function deleteOptionGroup(id: string): Promise<void> {
  try {
    await apiClient.delete(`/api/v1/admin/option-groups/${id}`)
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete option group')
  }
}