import { httpClient } from '@/core/http'
import type { ProductOut } from '@/types/catalog'

export function getInventory(): Promise<ProductOut[]> {
  return httpClient.get<ProductOut[]>('/catalog/inventory').then((res) => res.data)
}
