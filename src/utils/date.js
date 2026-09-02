export function formatDateBR(value, includeTime = false) {
  if (!value) return ''

  try {
    let date

    if (typeof value?.toDate === 'function') {
      date = value.toDate()
    } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-')
      return `${day}/${month}/${year}`
    } else {
      date = new Date(value)
    }

    if (Number.isNaN(date.getTime())) return String(value)

    return includeTime
      ? date.toLocaleString('pt-BR')
      : date.toLocaleDateString('pt-BR')
  } catch {
    return String(value)
  }
}
