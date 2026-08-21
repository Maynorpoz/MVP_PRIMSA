import { useQuery } from '@tanstack/react-query'
import { getDailyOrders } from '@/api/management'

export function useDailyOrders(day: string) {
  return useQuery({
    queryKey: ['management', 'daily-orders', day],
    queryFn: () => getDailyOrders({ day }),
  })
}
