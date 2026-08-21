import { httpClient } from '@/core/http'
import type { OrderCreate, OrderOut } from '@/types/checkout'

export function processOrder(data: OrderCreate): Promise<OrderOut> {
  return httpClient.post<OrderOut>('/checkout/process-order', data).then((res) => res.data)
}
