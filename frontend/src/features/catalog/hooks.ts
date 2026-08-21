import { useQuery } from '@tanstack/react-query'
import { getInventory } from '@/api/catalog'

export const inventoryQueryKey = ['catalog', 'inventory'] as const

export function useInventory() {
  return useQuery({
    queryKey: inventoryQueryKey,
    queryFn: getInventory,
  })
}
