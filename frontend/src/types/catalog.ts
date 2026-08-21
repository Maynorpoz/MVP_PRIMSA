/**
 * Mirrors backend/app/models/schemas.py::ProductOut.
 *
 * `price` is typed `string`, not `number`: FastAPI/Pydantic serializes
 * `Decimal` fields as JSON strings (verified against the real backend, e.g.
 * `"29.99"`). Always parse through lib/currency.ts before doing arithmetic —
 * never assume it is already a number.
 */
export interface ProductOut {
  id: number
  name: string
  description: string | null
  price: string
  stock: number
}
