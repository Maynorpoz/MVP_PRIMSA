export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('es-GT', { dateStyle: 'medium' })
}
