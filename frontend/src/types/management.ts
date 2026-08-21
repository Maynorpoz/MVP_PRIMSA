// GET /management/daily-orders returns the same OrderOut shape as checkout.
export type { OrderOut } from './checkout'

export interface DailyOrdersQuery {
  day?: string // YYYY-MM-DD
}
