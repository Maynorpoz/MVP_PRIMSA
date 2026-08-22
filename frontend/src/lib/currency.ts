/**
 * The backend serializes Decimal fields (price, unit_price, total) as JSON
 * strings (e.g. "29.99") — see types/catalog.ts. These helpers are the only
 * place that should convert between that wire format and display/arithmetic.
 */

export function parseMoney(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

export function formatMoney(value: string | number): string {
  const amount = typeof value === 'string' ? parseMoney(value) : value
  return formatter.format(amount)
}
