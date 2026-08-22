/**
 * The checkout error `detail` is a plain, backend-curated string (see
 * ARQUITECTURA.md section 4.1) — never a structured `{product_id}` field.
 * This best-effort matches it back to a cart line so the UI can point at
 * the specific product, per section 4's requirement that checkout errors
 * are shown in the cart's context, not as a generic toast.
 */
export function findAffectedProductId(
  detail: string,
  items: Array<{ productId: number; name: string }>,
): number | null {
  const lower = detail.toLowerCase()

  const byName = items.find((item) => lower.includes(item.name.toLowerCase()))
  if (byName) return byName.productId

  const match = detail.match(/product\s+(\d+)/i) ?? detail.match(/\[(\d+)/)
  if (match) {
    const id = Number(match[1])
    if (items.some((item) => item.productId === id)) return id
  }

  return null
}
