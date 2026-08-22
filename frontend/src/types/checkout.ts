/**
 * Mirrors backend/app/models/schemas.py (Orders section). `unit_price` and
 * `total` are strings for the same reason as ProductOut.price — see
 * types/catalog.ts.
 */

export interface OrderItemCreate {
  product_id: number
  quantity: number
}

export interface OrderCreate {
  items: OrderItemCreate[]
}

export interface OrderItemOut {
  product_id: number
  quantity: number
  unit_price: string
}

export interface OrderOut {
  id: number
  user_id: number
  status: string
  total: string
  created_at: string
  items: OrderItemOut[]
}

/**
 * Shape of a checkout 400/404 error's `detail`, as observed against the real
 * backend (see ARQUITECTURA.md section 4.1):
 *   - 400 "Insufficient stock for product '<name>'"
 *   - 400 "Invalid quantity for product <id>"
 *   - 400 "An order must contain at least one item"
 *   - 404 "Products not found: [<id>, ...]"
 * These are plain strings, not structured objects — the frontend maps them
 * to a per-product cart error by matching the affected item, not by parsing
 * the message text as data.
 */
export interface ApiErrorBody {
  detail: string
}
