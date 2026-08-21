import { httpClient } from '@/core/http'
import type { DailyOrdersQuery, OrderOut } from '@/types/management'

export function getDailyOrders(query: DailyOrdersQuery = {}): Promise<OrderOut[]> {
  return httpClient
    .get<OrderOut[]>('/management/daily-orders', { params: query })
    .then((res) => res.data)
}
